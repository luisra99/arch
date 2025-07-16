import { v4 as uuid } from "uuid";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../../../types/errors";
import { getFolderZipStream } from "../../prospects-documentation/services/file.service";
import supabase from "../../../libs/supabase";
import { sendShareEmail } from "../../../utils/mailer";
const prisma = new PrismaClient();

const BASE_URL = process.env.SHARE_BASE_URL!;

export const createShareToken = async ({
  type,
  path,
  email
}: {
  type: "FILE" | "FOLDER";
  path: string;
  email: string;
}) => {
  const token = uuid();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.shareToken.create({
    data: { type, path, email, token, expiresAt }
  });

  const link = `${BASE_URL}/api/share/${token}`;
  await sendShareEmail(email, link);
};

export const consumeShareToken = async (token: string): Promise<{ type: "FILE" | "FOLDER"; path: string }> => {
  const record = await prisma.shareToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date())
    throw new AppError("Token inválido o expirado", 404);

  await prisma.shareToken.delete({ where: { token } });

  return { type: record.type, path: record.path };
};

export const getDownloadStream = async (type: "FILE" | "FOLDER", path: string) => {
  if (type === "FOLDER") return await getFolderZipStream(path);

  const { data: urlData, error } = await supabase
    .storage
    .from(process.env.SUPABASE_BUCKET_NAME!)
    .createSignedUrl(path, 60);

  if (error || !urlData?.signedUrl)
    throw new AppError("No se pudo generar enlace temporal", 500);

  const res = await fetch(urlData.signedUrl);
  const buffer = await res.arrayBuffer();

  return Buffer.from(buffer);
};
