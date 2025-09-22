import { Request, Response } from "express";
import {
  sendContactEmailService,
  sendConfirmationEmailService,
  sendQuestionToAdminEmailService,
  sendAnswerToProspectEmailService,
  sendQuestionConfirmationEmailService,
} from "../services/mailing.prospect.service"; // Asume que tienes un servicio de correo
import { createProspectService, getProspectByEmailService, getProspectByPhoneService, updateProspectService } from "../services/manage.prospect.service";
import { env } from "../../../config/env";
import logger from "../../../libs/logger";

export const contactProspectController = async (req: Request, res: Response) => {
  try {
    const prospectData = req.body;
    const { email, phone, metadata: { message } } = req.body
    // Validar datos básicos
    if (!prospectData.email && !prospectData.phone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    // Enviar correo de contacto
    await sendContactEmailService({
      to: env.EMAIL_ADMIN_USER ?? "", // Correo de la empresa
      subject: "New Contact",
      prospect: prospectData,
    });

    // Si el prospecto tiene email, enviar correo de confirmación
    if (prospectData.email) {
      await sendConfirmationEmailService({
        to: prospectData.email,
        subject: "Thanks for get in touch with us",
        prospect: prospectData,
      });
    }
    let existing
    if (email)
      existing = await getProspectByEmailService(email)
    else if (phone)
      existing = await getProspectByPhoneService(phone)

    if (!existing)
      await createProspectService({
        ...prospectData,
        metadata: {
          question: { [Date.now()]: { question: message } },
        },
      })
    else {
      const previousMetadata: any = existing.metadata || {};
      const previousQuestions = previousMetadata.question || {};
      if (!previousMetadata.contacts) {
        previousMetadata.contacts = []
      }
      if (!previousMetadata.otherAddresses) {
        previousMetadata.otherAddresses = []
      }

      if (existing.phone != phone) previousMetadata.contacts.push(phone)
      if (existing.email != email) previousMetadata.contacts.push(email)
      if (existing.state && existing.city && existing.address) {
        if (existing.state != prospectData.state || existing.city != prospectData.city || existing.address !== prospectData.address)
          previousMetadata.otherAddresses.push([prospectData.state, prospectData.city, prospectData.address].join(", "))
      }

      const updatedProspect = await updateProspectService(existing.id, {
        attended: null,
        metadata: {
          ...previousMetadata,
          question: { ...previousQuestions, [Date.now()]: { question: message } },
        },
      })

    }

    res.status(201).json({ message: "Success" });
  } catch (error: any) {
    logger.error(error)
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
    let existing;
    if (email)
      existing = await getProspectByEmailService(email)
    else if (phone)
      existing = await getProspectByPhoneService(phone)

    // Preparar mensaje para enviar al administrador

    // Enviar correo al admin
    await sendQuestionToAdminEmailService({
      email,
      question,
      subject: "Nueva pregunta",
      phone,
      to: env.EMAIL_ADMIN_USER ?? "",
    });
    if (email)
      await sendQuestionConfirmationEmailService({
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
          question: { [Date.now()]: { question } },
        },
      })


      return res.status(201).json(newProspect);
    } else {
      // Si ya existe, actualizamos el metadata y attended
      const previousMetadata: any = existing.metadata || {};
      const previousQuestions = previousMetadata.question || {};

      const updatedProspect = await updateProspectService(existing.id, {
        attended: null,
        metadata: {
          ...previousMetadata,
          question: { ...previousQuestions, [Date.now()]: { question } },
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
    const { email, answer, questionId } = req.body;
    if (!email || !answer) {
      return res.status(400).json({ error: "Email and answer are required" });
    }
    let existing = await getProspectByEmailService(email)
    if (!existing) {
      // Si no existe, lo creamos
      return res.status(404).json({ message: "Prospect not found." });
    } else {
      // Si ya existe, actualizamos el metadata y attended
      (existing.metadata as any).question[questionId].answer = answer
      // Enviar correo con la respuesta
      await sendAnswerToProspectEmailService({
        to: email,
        subject: "About your question",
        question: (existing.metadata as any).question[questionId].question,
        answer
      });

      const updatedProspect = await updateProspectService(existing.id, {
        attended: null,
        metadata: existing.metadata,
      })
    }
    res.status(200).json({ message: "Respuesta enviada con éxito" });
  } catch (error: any) {
    logger.error(error)
    return res.status(error.send || 500).json({ message: error.message || "Ha ocurrido un error" });
  }
};
