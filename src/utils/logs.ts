import { PrismaClient } from "@prisma/client";
import { Request } from "express";
const prisma = new PrismaClient();
export const createLog = async (
  {
    body: {
      user: { username: userId },
      metadata: { areaId, itemId },
    },
  }: Request & any,
  info: string,
  data: { label: string; value: any; keys?: Record<string, any> }[]
) => {
  await prisma.logs.create({ data: { info, data, userId, areaId, itemId } });
};
