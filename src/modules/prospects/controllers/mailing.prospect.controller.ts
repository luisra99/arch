import { Request, Response } from "express";
import {
  sendContactEmailService,
  sendConfirmationEmailService,
  sendQuestionToAdminEmailService,
  sendAnswerToProspectEmailService,
  sendQuestionConfirmationEmailService,
} from "../services/mailing.prospect.service"; // Asume que tienes un servicio de correo
import { createProspectService, getProspectByEmailService, updateProspectService } from "../services/manage.prospect.service";
import { env } from "../../../config/env";

export const contactProspectController = async (req: Request, res: Response) => {
  try {
    const prospectData = req.body;

    // Validar datos básicos
    if (!prospectData.email && !prospectData.phone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    // Enviar correo de contacto
    await sendContactEmailService({
      to: env.EMAIL_ADMIN_USER ?? "", // Correo de la empresa
      subject: "Nuevo prospecto de contacto",
      prospect: prospectData,
    });

    // Si el prospecto tiene email, enviar correo de confirmación
    if (prospectData.email) {
      await sendConfirmationEmailService({
        to: prospectData.email,
        subject: "Gracias por contactarnos",
        prospect: prospectData,
      });
    }

    // Opcional: Guardar en base de datos
    const newProspect = await createProspectService(prospectData)

    res.status(201).json(newProspect);
  } catch (error: any) {
    return res.status(error.send || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};
export const questionFromProspectController = async (req: Request, res: Response) => {
  const {
    email,
    phone,
    metadata: { question },
  } = req.body;

  if (!email || !question) {
    return res.status(400).json({
      error: "Email and question are required",
    });
  }

  try {
    // Buscar si el prospecto ya existe

    let existing = await getProspectByEmailService(email)

    // Preparar mensaje para enviar al administrador

    // Enviar correo al admin
    sendQuestionToAdminEmailService({
      email,
      question,
      subject: "Nueva pregunta",
      phone,
      to: env.EMAIL_ADMIN_USER ?? "",
    });
    if (email)
      sendQuestionConfirmationEmailService({
        to: email,
        subject: "Confirmation",
        question,
      });

    if (!existing) {
      // Si no existe, lo creamos
      const newProspect = await createProspectService({
        email,
        phone,
        metadata: {
          question: [question],
        },
      })


      return res.status(201).json(newProspect);
    } else {
      // Si ya existe, actualizamos el metadata y attended
      const previousMetadata: any = existing.metadata || {};
      const previousQuestions = Array.isArray(previousMetadata.question)
        ? previousMetadata.question
        : previousMetadata.question
          ? [previousMetadata.question]
          : [];
      const updatedProspect = await updateProspectService(existing.id, {
        attended: null,
        metadata: {
          ...previousMetadata,
          question: [...previousQuestions, question],
        },
      })

      return res.status(200).json(updatedProspect);
    }
  } catch (error: any) {
    return res.status(error.send || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};
export const answerProspectQuestionController = async (req: Request, res: Response) => {
  try {
    const { email, answer } = req.body;

    if (!email || !answer) {
      return res.status(400).json({ error: "Email and answer are required" });
    }
    // Enviar correo con la respuesta
    await sendAnswerToProspectEmailService({
      to: email,
      subject: "About your question",
      answer,
    });

    let existing = await getProspectByEmailService(email)

    if (!existing) {
      // Si no existe, lo creamos

      const newProspect = await createProspectService({
        data: {
          email,
          metadata: {
            answer: [answer],
          },
        },
      })
    } else {
      // Si ya existe, actualizamos el metadata y attended
      const previousMetadata: any = existing.metadata || {};
      const previousAnswers = Array.isArray(previousMetadata.answer)
        ? previousMetadata.answer
        : previousMetadata.answer
          ? [previousMetadata.answer]
          : [];

      const updatedProspect = await updateProspectService(existing.id, {
        attended: null,
        metadata: {
          ...previousMetadata,
          answer: [...previousAnswers, answer],
        },
      })
    }
    res.status(200).json({ message: "Respuesta enviada con éxito" });
  } catch (error: any) {
    return res.status(error.send || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};
