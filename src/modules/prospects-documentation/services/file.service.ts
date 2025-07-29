
import { readFileSync, unlinkSync } from "fs";
import supabase from "../../../libs/supabase";
import { AppError } from "../../../types/errors";
import archiver from "archiver";
import { Buffer } from "buffer";
import { getFileTypeFromExtension, sanitizeFilename } from "../../../utils/file.utils";
import { prismaInstance } from "prisma/client";
import { getMimeType } from "../utils/file.utils";
import { env } from "@/config/env";

type TreeNode = {
  name: string;
  path: string;
  type: "folder" | "file";
  children?: TreeNode[];
};

export const listFilesRecursivelyService = async (prefix: string = ""): Promise<TreeNode[]> => {
  const { data, error } = await supabase
    .storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .list(prefix); // sin recursive

  if (error) throw new Error(`Error al listar ${prefix}: ${error.message}`);

  const result: TreeNode[] = [];

  for (const item of data) {
    if (item.name === ".emptyFolderPlaceholder") continue; // 🚫 lo ignoramos

    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.metadata === null) {
      // 📁 Carpeta
      const children = await listFilesRecursivelyService(itemPath);
      result.push({
        name: item.name,
        path: itemPath,
        type: "folder",
        children
      });
    } else {
      // 📄 Archivo
      result.push({
        name: item.name,
        path: itemPath,
        type: "file"
      });
    }
  }

  return result;
};

export const uploadBase64FileService = async ({
  base64,
  name,
  type,
  prospectId
}: {
  base64: string;
  name: string;
  type: string; // "image" | "video" | "document"
  prospectId: string;
}) => {
  const buffer = Buffer.from(base64, "base64");
  const extension = name.split(".").pop();
  const path = `prospects/${prospectId}/${type}s/${Date.now()}-${name}`;

  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .upload(path, buffer, {
      contentType: getMimeType(extension),
      upsert: true
    });

  if (error) throw new AppError(error.message, 500);

  const url = supabase.storage.from(env.SUPABASE_BUCKET_NAME!)
    .getPublicUrl(path).data.publicUrl;

  return { path, url };
};

export const getFolderZipStreamService = async (folder: string) => {
  const { data, error } = await supabase
    .storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .list(folder);

  if (error) throw new AppError("Error al obtener archivos", 500);

  const archive = archiver("zip", { zlib: { level: 9 } });
  for (const file of data) {
    const { data: signedUrlData } = await supabase
      .storage
      .from(env.SUPABASE_BUCKET_NAME!)
      .createSignedUrl(`${folder}/${file.name}`, 60);

    if (signedUrlData?.signedUrl) {
      const res = await fetch(signedUrlData.signedUrl);
      const buffer = await res.arrayBuffer();
      archive.append(Buffer.from(buffer), { name: file.name });
    }
  }

  archive.finalize();
  return archive;
};

export const shareFolderWithUserService = async (folder: string, email: string) => {
  // Aquí podés guardar en DB o mandar invitación
  // Ejemplo: guardar en tabla Share(folder, email)
  throw "No implemented exception"
};

export const uploadProspectFileService = async ({
  localPath,
  originalName,
  mimeType,
  prospect
}: {
  localPath: string;
  originalName: string;
  mimeType: string;

  prospect: {
    id?:string;
    fullName?: string;
    address?: string;
    email?: string;
    phone?: string;
    createdAt: Date;
  };
}, prisma = prismaInstance) => {
  if(!prospect.id){
    const {id} =await prisma.prospects.create({data:prospect})
    prospect.id=id
  }
  const ext = originalName.split(".").pop() || "bin";
  const type = getFileTypeFromExtension(ext); // "image", "video", etc.
  const safeName = sanitizeFilename(originalName);
  const storagePath = `${prospect.id}/${type}s/${safeName}`;
  const fileBuffer = readFileSync(localPath);

  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  unlinkSync(localPath);
  if (error) throw new AppError(error.message, 500);

  const publicUrl = supabase.storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .getPublicUrl(storagePath).data.publicUrl;

  return { path: storagePath, url: publicUrl,id:prospect.id };
};

export const deleteFileService = async (path: string) => {
  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .remove([path]);

  if (error) throw new AppError("Error al eliminar archivo", 500);
};

export const renameFileService = async (oldPath: string, newPath: string) => {
  console.log("newPath",newPath,oldPath)
  const { data: download, error: downloadErr } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .download(oldPath);

  if (downloadErr || !download) throw new AppError("No se pudo descargar archivo", 500);

  const buffer = await download.arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .upload(newPath, buffer, {
      contentType: "application/octet-stream",
      upsert: true
    });

  if (uploadErr) throw new AppError("No se pudo renombrar archivo", 500);

  await deleteFileService(oldPath);

  return {
    path: newPath,
    url: supabase.storage
      .from(env.SUPABASE_BUCKET_NAME!)
      .getPublicUrl(newPath).data.publicUrl
  };
};

export const moveFileOrFolderService = async (from: string, to: string) => {
  const { data, error } = await supabase
    .storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .list(from);

  if (!data?.length) {
    // es un archivo
    const move = await supabase
      .storage
      .from(env.SUPABASE_BUCKET_NAME!)
      .move(from, `${to}/${from.split("/").pop()}`);

    if (move.error) throw new AppError(move.error.message+" moviendo archivo", 500);
    return;
  }

  // es una carpeta: mover contenido recursivo
  for (const item of data) {
    const sourcePath = `${from}/${item.name}`;
    const destPath = `${to}/${item.name}`;

    const move = await supabase
      .storage
      .from(env.SUPABASE_BUCKET_NAME!)
      .move(sourcePath, destPath);

    if (move.error) throw new AppError(move.error.message+" moviendo carpeta", 500);
  }
};