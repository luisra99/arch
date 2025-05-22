import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getConceptByDenomination = async (denomination: string) => {
  try {
    const fatherConcept = await prisma.concept.findFirst({
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
export const getConceptsByFatherId = async (fatherId: string) => {
  try {
    const concepts = await prisma.concept.findMany({
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
export const createNewConcept = async (
  fatherId: string,
  denomination: string,
  details?: string
) => {
  try {
    const concept = await prisma.concept.create({
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
