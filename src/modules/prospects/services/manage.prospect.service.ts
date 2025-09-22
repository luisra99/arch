import { prismaInstance } from "../../../../prisma/client";

export const createProspectService = async (prospectData: any, prisma = prismaInstance) => {
  const newProspect = await prisma.prospects.create({
    data: prospectData,
  });
  return newProspect
}
export const updateProspectService = async (id: string, prospectData: any, prisma = prismaInstance) => {
  const newProspect = await prisma.prospects.update({
    where: { id },
    data: prospectData,
  });
  return newProspect
}
export const getAllProspectsService = async (prisma = prismaInstance) => {
  const prospects = await prisma.prospects.findMany();
  return prospects
}
export const getProspectByIdService = async (id: string, prisma = prismaInstance) => {
  const prospect = await prisma.prospects.findUnique({ where: { id } });
  return prospect
}
export const getProspectByEmailService = async (email: string, prisma = prismaInstance) => {
  const prospect = await prisma.prospects.findFirst({ where: { email } });
  return prospect
}
export const getProspectByPhoneService = async (phone: string, prisma = prismaInstance) => {
  const prospect = await prisma.prospects.findFirst({ where: { phone } });
  return prospect
}
export const getActiveProspectsService = async (mode?: any, prisma = prismaInstance) => {
  let prospects
  if (mode == "all")
    prospects = await prisma.prospects.findMany();
  else if (mode == "deleted")
    return await prisma.prospects.findMany({ where: { deleted: { not: null } } });
  else
    return await prisma.prospects.findMany({ where: { deleted: { equals: null } } });

  return prospects.map((item) => {
    let status: string[] = [];
    if (
      (item?.metadata as any).question?.length >
      (item?.metadata as any).answer?.length
    )
      status.push("ESPERANDO RESPUESTA");
    if (!item?.attended) status.push("SIN ATENDER");
    return { ...item, status };
  })
}
