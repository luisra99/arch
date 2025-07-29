import { prismaInstance } from "prisma/client";

export const getConceptByDenominationService = async (denomination: string, prisma = prismaInstance) => {
  try {
    const fatherConcept = await prismaInstance.concept.findFirst({
      where: {
        denomination,
      },
    });

    if (!fatherConcept) {
      throw new Error("No se encontró el concepto padre");
    }
    return fatherConcept;
  } catch (error) {
    console.log(error);
    throw new Error("Error encontrando al concepto padre");
  }
};
export const getConceptsByFatherIdService = async (fatherId: string, prisma = prismaInstance) => {
  try {
    const concepts = await prismaInstance.concept.findMany({
      where: {
        fatherId,
      },
      orderBy: { denomination: "asc" },
    });

    return concepts;
  } catch (error) {
    console.log(error);
    throw new Error("Error encontrando los conceptos asociados");
  }
};
export const createConceptService = async (
  fatherId: string,
  denomination: string,
  details?: string, prisma = prismaInstance
) => {
  try {
    const concept = await prismaInstance.concept.create({
      data: {
        denomination,
        details,
        fatherId,
      },
    });

    return concept;
  } catch (error) {
    console.log(error);
    throw new Error("Error creando el concepto");
  }
};
export const getConceptByIdService = async (id: string, prisma = prismaInstance) => {
  try {
    const concepts = await prismaInstance.concept.findFirst({
      where: {
        id,
      },
    });
    return concepts;
  } catch (error) {
    console.log(error);
    throw new Error("Error encontrando los conceptos asociados");
  }
};
export const updateConceptService=async ({id,denomination, details, fatherId}:any, prisma = prismaInstance)=>{
  try {
    const updatedConcept = await prismaInstance.concept.update({
      where: { id: id },
      data: {
        denomination,
        details,
        fatherId,
      },
    });
    return updatedConcept;
  } catch (error) {
    console.log(error);
    throw new Error("Error encontrando los conceptos asociados");
  }
}
export const deleteConceptService=async (id:string, prisma = prismaInstance)=>{
  try {
    const deletedConcept = await prismaInstance.concept.delete({
      where: { id },
    });
    return deletedConcept;
  } catch (error) {
    console.log(error);
    throw new Error("Error encontrando los conceptos asociados");
  }
}