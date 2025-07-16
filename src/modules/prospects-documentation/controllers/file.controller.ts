import { deleteFileService, listFilesRecursively, renameFileService, uploadBase64File, uploadProspectFile } from "../services/file.service";
import { Request, Response } from "express";
import {
  getFolderZipStream,
  shareFolderWithUser
} from "../services/file.service";

import { moveFileOrFolder } from "../services/file.service";

export const moveFileController = async (req: Request, res: Response) => {
  const { from, to } = req.body;
  try {
    await moveFileOrFolder(from, to);
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
    const result = await uploadProspectFile({
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
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const renameFileController = async (req: Request, res: Response) => {
  const { oldPath, newName } = req.body;
  try {
    const result = await renameFileService(oldPath, newName);
    res.status(200).json(result);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTreeController = async (req: Request, res: Response) => {
  const prospectId = req?.params?.prospectId??"";
  const flatPaths = await listFilesRecursively(prospectId);
  res.json(flatPaths);
};

export const downloadZipController = async (req: Request, res: Response) => {
  const folder = req.query.folder as string;
  const zipStream = await getFolderZipStream(folder);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${folder}.zip"`);

  zipStream.pipe(res);
};

export const shareFolderController = async (req: Request, res: Response) => {
  const { folder, email } = req.body;
  await shareFolderWithUser(folder, email);
  res.status(200).json({ message: "Carpeta compartida" });
};