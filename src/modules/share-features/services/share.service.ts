import { v4 as uuid } from "uuid";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../../../types/errors";
import { getFolderZipStreamService } from "../../prospects-documentation/services/file.service";
import supabase from "../../../libs/supabase";
import { sendShareEmail } from "../../../utils/mailer";
import { prismaInstance } from "prisma/client";

const BASE_URL = env.SHARE_BASE_URL!;

export const createShareTokenService = async ({
  type,
  path,
  email
}: {
  type: "FILE" | "FOLDER";
  path: string;
  email: string;
}, prisma = prismaInstance) => {
  const token = uuid();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.shareToken.create({
    data: { type, path, email, token, expiresAt }
  });

  const link = `${BASE_URL}/api/share/${token}`;
  await sendShareEmail(email, link);
};

export const consumeShareTokenService = async (token: string, prisma = prismaInstance): Promise<{ type: "FILE" | "FOLDER"; path: string }> => {
  const record = await prisma.shareToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date())
    throw new AppError("Token inválido o expirado", 404);

  await prisma.shareToken.delete({ where: { token } });

  return { type: record.type, path: record.path };
};

export const getDownloadStreamService = async (type: "FILE" | "FOLDER", path: string) => {
  if (type === "FOLDER") return await getFolderZipStreamService(path);

  const { data: urlData, error } = await supabase
    .storage
    .from(env.SUPABASE_BUCKET_NAME!)
    .createSignedUrl(path, 60);

  if (error || !urlData?.signedUrl)
    throw new AppError("No se pudo generar enlace temporal", 500);

  const res = await fetch(urlData.signedUrl);
  const buffer = await res.arrayBuffer();

  return Buffer.from(buffer);
};
