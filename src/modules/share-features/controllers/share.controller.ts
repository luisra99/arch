import { Request, Response } from "express";
import { consumeShareToken, createShareToken, getDownloadStream } from "../services/share.service";

export const sendShareLinkController = async (req: Request, res: Response) => {
  const { path, type, email } = req.body;
  await createShareToken({ type, path, email });
  res.json({ message: "Enlace enviado" });
};

export const downloadSharedContentController = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { type, path } = await consumeShareToken(token);
  const download = await getDownloadStream(type, path);

  if (type === "FOLDER") {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${path}.zip"`);
    (download as NodeJS.ReadableStream).pipe(res);
  } else {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${path.split("/").pop()}"`);
    res.send(download);
  }
};
