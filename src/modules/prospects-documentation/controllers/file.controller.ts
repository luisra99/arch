import { deleteFileService, listFilesRecursivelyService, renameFileService, uploadBase64FileService, uploadProspectFileService } from "../services/file.service";
import { Request, Response } from "express";
import {
  getFolderZipStreamService,
  shareFolderWithUserService
} from "../services/file.service";

import { moveFileOrFolderService } from "../services/file.service";

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

export const downloadZipController = async (req: Request, res: Response) => {
  try {
    const folder = req.query.folder as string;
    const zipStream = await getFolderZipStreamService(folder);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${folder}.zip"`);

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