import { Request, Response } from "express";
import { consumeShareTokenService, createShareTokenService, getDownloadStreamService } from "../services/share.service";

export const sendShareLinkController = async (req: Request, res: Response) => {
  try {
    const { path, type, email } = req.body;
    await createShareTokenService({ type, path, email });
    res.json({ message: "Enlace enviado" });
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const downloadSharedContentController = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { type, path } = await consumeShareTokenService(token);
    const download = await getDownloadStreamService(type, path);

    if (type === "FOLDER") {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${path}.zip"`);
      (download as NodeJS.ReadableStream).pipe(res);
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${path.split("/").pop()}"`);
      res.send(download);
    }
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};
