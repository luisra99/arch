import { deleteFileService, listFilesRecursivelyService, renameFileService, uploadBase64FileService, uploadProspectFileService } from "../services/file.service";
import { Request, Response } from "express";
import {
  getFolderZipStreamService,
  shareFolderWithUserService
} from "../services/file.service";

import { moveFileOrFolderService } from "../services/file.service";
import { pipeline } from "stream/promises";
import { listSignedUrlsService } from "../services/getFileStream.service";
import archiver from "archiver";
import { appendSignedFilesToArchive } from "../services/zipSignedUrls.service";

export const moveFileController = async (req: Request, res: Response) => {
  const { from, to } = req.body;
  try {
    await moveFileOrFolderService(from, to);
    res.status(200).json({ message: "Movimiento realizado" });
  } catch (error: any) {
    console.error("moveFileController", error);
    res.status(500).json({ message: error.message });
  }
};
export const uploadFileController = async (req: Request, res: Response) => {
  const { prospect } = req.body;

  try {
    if (!req.file) throw new Error("Archivo no recibido");
    const result = await uploadProspectFileService({
      localPath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      prospect: JSON.parse(prospect)
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("uploadFileController error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const deleteFileController = async (req: Request, res: Response) => {
  try {
    await deleteFileService(req.body.path);
    res.status(200).json({ message: "Archivo eliminado" });
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const renameFileController = async (req: Request, res: Response) => {
  const { oldPath, newName } = req.body;
  try {
    const result = await renameFileService(oldPath, newName);
    res.status(200).json(result);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const getTreeController = async (req: Request, res: Response) => {
  try {
    const prospectId = req?.params?.prospectId ?? "";
    const flatPaths = await listFilesRecursivelyService(prospectId);
    res.json(flatPaths);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }

};
/**
 * GET /api/files/zip?path=carpeta/o/archivo&name=MiCarpeta&expires=60
 * - Si `path` es archivo: ZIP con 1 archivo.
 * - Si `path` es carpeta: ZIP con todo su contenido (recursivo).
 */
export async function downloadSignedZipController(req: Request, res: Response) {
  const path = String(req.query.path || req.query.folder || "");
  const zipRoot = String(req.query.name || "folder");
  const expires = Number(req.query.expires ?? 60);

  if (!path) return res.status(400).json({ message: "Missing 'path' (o 'folder')" });

  // 1) Listar y firmar
  const files = await listSignedUrlsService(path, Number.isFinite(expires) ? expires : 60);

  // 2) Preparar headers del ZIP
  res.status(200);
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${zipRoot}.zip"`);
  res.setHeader("Content-Encoding", "identity"); // evita doble compresión

  // 3) Crear ZIP y pipearlo antes de finalize()
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("warning", (err: any) => { if (err?.code !== "ENOENT") res.destroy(err); });
  archive.on("error", (err) => res.destroy(err));

  const pipePromise = pipeline(archive, res);

  // 4) Descargar cada signedUrl y añadir al ZIP
  await appendSignedFilesToArchive(archive, files, path, zipRoot);

  // 5) Cerrar correctamente el ZIP y esperar a que llegue al cliente
  await archive.finalize();
  await pipePromise;
}

export const downloadZipController = async (req: Request, res: Response) => {
  try {
    const {folder,name} = req.query;
    const zipStream = await getFolderZipStreamService(folder as string,name as string);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${name}.zip"`);

    zipStream.pipe(res);
  }
  catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const shareFolderController = async (req: Request, res: Response) => {
  try {
    const { folder, email } = req.body;
    await shareFolderWithUserService(folder, email);
    res.status(200).json({ message: "Carpeta compartida" });
  }
  catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};