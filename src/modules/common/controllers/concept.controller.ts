import { Request, Response } from "express";
import {
  getConceptByIdService,
  createConceptService,
  deleteConceptService,
  getConceptByDenominationService,
  getConceptsByFatherIdService,
  updateConceptService,
} from "../services/concepts.service";

export const createConceptController = async (req: Request, res: Response) => {
  try {
    const { denomination, details } = req.body;
    const { fatherDenomination } = req.params;

    const { id } = await getConceptByDenominationService(fatherDenomination);
    const newConcept = await createConceptService(id, denomination, details);

    res.status(201).json(newConcept);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const getConceptsController = async (req: Request, res: Response) => {
  try {
    const { fatherDenomination } = req.params;
    const { id } = await getConceptByDenominationService(fatherDenomination);
    const conceptos = await getConceptsByFatherIdService(id);

    res.status(200).json(conceptos);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const getConceptByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const concepto = await getConceptByIdService(id)
    res.status(200).json(concepto);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const updateConceptController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { denomination, details, fatherId } = req.body;
    const updatedConcept = await updateConceptService({ id, denomination, details, fatherId })
    res.status(200).json(updatedConcept);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};

export const deleteConceptController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedConcept = await deleteConceptService(id)
    res.status(200).json(deletedConcept);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};
