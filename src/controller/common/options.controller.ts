import { Request, Response } from "express";
export const getOptions = async (req: Request, res: Response) => {
  try {
    const { concept } = req.params;
    switch (concept) {
      default:
        throw new Error("El parámetro no es correcto.");
    }
  } catch (error: any) {
    const descriptionError = {
      message: error.message || "Error listando el concepto.",
      code: error.code || "SERVER_ERROR",
      stackTrace: error.stack || "NO_STACK_TRACE_AVAILABLE",
    };
    res.status(500).json(descriptionError);
  }
};
