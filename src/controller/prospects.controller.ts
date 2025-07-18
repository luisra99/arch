import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  sendContactEmail,
  sendConfirmationEmail,
  sendQuestionToAdminEmail,
  sendAnswerToProspectEmail,
  sendQuestionConfirmationEmail,
} from "../services/prospect.service"; // Asume que tienes un servicio de correo

const prisma = new PrismaClient();

// POST /prospect/contact
export const contactProspect = async (req: Request, res: Response) => {
  try {
    const prospectData = req.body;

    // Validar datos básicos
    if (!prospectData.email && !prospectData.phone) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    // Enviar correo de contacto
    await sendContactEmail({
      to: process.env.EMAIL_ADMIN_USER ?? "", // Correo de la empresa
      subject: "Nuevo prospecto de contacto",
      prospect: prospectData,
    });

    // Si el prospecto tiene email, enviar correo de confirmación
    if (prospectData.email) {
      await sendConfirmationEmail({
        to: prospectData.email,
        subject: "Gracias por contactarnos",
        prospect: prospectData,
      });
    }

    // Opcional: Guardar en base de datos
    const newProspect = await prisma.prospects.create({
      data: prospectData,
    });

    res.status(201).json(newProspect);
  } catch (error) {
    console.error("Error in contactProspect:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /prospect/manage
export const createProspect = async (req: Request, res: Response) => {
  try {
    const prospectData = req.body;

    // Validación básica
    if (!Object.values(prospectData).length) {
      return res
        .status(400)
        .json({ error: "We need some information about the prospect" });
    }

    const newProspect = await prisma.prospects.create({
      data: prospectData,
    });

    res.status(201).json(newProspect);
  } catch (error) {
    console.error("Error in createProspect:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// GET /prospect/manage
export const getAllProspects = async (req: Request, res: Response) => {
  try {
    const prospects = await prisma.prospects.findMany();
    res.status(200).json(prospects);
  } catch (error) {
    console.error("Error in getAllProspects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /prospect/manage
export const getActiveProspects = async (req: Request, res: Response) => {
  try {
    const prospects = await prisma.prospects.findMany({
      where: { deleted: { equals: null } },
    });

    res.status(200).json(
      prospects.map((item) => {
        let status: string[] = [];
        if (
          (item?.metadata as any).question?.length >
          (item?.metadata as any).answer?.length
        )
          status.push("ESPERANDO RESPUESTA");
        if (!item?.attended) status.push("SIN ATENDER");
        return { ...item, status };
      })
    );
  } catch (error) {
    console.error("Error in getAllProspects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /prospect/manage
export const getDeletedProspects = async (req: Request, res: Response) => {
  try {
    const prospects = await prisma.prospects.findMany({
      where: { deleted: { not: null } },
    });
    res.status(200).json(prospects);
  } catch (error) {
    console.error("Error in getAllProspects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /prospect/manage/:id
export const getProspectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prospect = await prisma.prospects.findUnique({
      where: { id },
    });

    if (!prospect) {
      return res.status(404).json({ error: "Prospect not found" });
    }

    res.status(200).json(prospect);
  } catch (error) {
    console.error("Error in getProspectById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /prospect/manage/:id
export const updateProspect = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProspect = await prisma.prospects.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedProspect);
  } catch (error) {
    console.error("Error in updateProspect:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /prospect/manage/:id
export const deleteProspect = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.prospects.update({
      where: { id },
      data: { deleted: new Date(Date.now()) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteProspect:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsAttended = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await prisma.prospects.update({
      where: { id },
      data: { attended: new Date() },
    });

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Prospecto marcado como atendido</title>
          <style>
            body {
              background-color: #f9fafb;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              background: white;
              padding: 32px;
              border-radius: 12px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 480px;
            }
            .logo {
              max-width: 120px;
              margin-bottom: 24px;
            }
            h1 {
              color: #111827;
              font-size: 22px;
              margin-bottom: 12px;
            }
            p {
              color: #4b5563;
              font-size: 16px;
              margin: 8px 0;
            }
            .footer {
              margin-top: 24px;
              font-size: 13px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="https://dwellingplus.studio/logo.png" alt="Dwellingplus Logo" class="logo" />
            <h1>Prospecto marcado como atendido</h1>
            <p><strong>Nombre:</strong> ${updated.name || "Sin nombre"}</p>
            <p><strong>Correo:</strong> ${updated.email || "No registrado"}</p>
            <p><strong>Teléfono:</strong> ${
              updated.phone || "No registrado"
            }</p>
            <p><strong>Fecha de marcado:</strong> ${new Date(
              updated.attended || new Date()
            ).toLocaleString("es-ES")}</p>
            <div class="footer">Dwellingplus · Administración de Prospectos</div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; background-color: #fff0f0; padding: 40px;">
          <h1 style="color: #a00;">Error al marcar como atendido</h1>
          <p>Algo salió mal al actualizar este prospecto. Intenta de nuevo más tarde.</p>
        </body>
      </html>
    `);
  }
};

// POST /prospect/question
export const questionFromProspect = async (req: Request, res: Response) => {
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
    let existing = await prisma.prospects.findFirst({
      where: { email },
    });

    // Preparar mensaje para enviar al administrador

    // Enviar correo al admin
    sendQuestionToAdminEmail({
      email,
      question,
      subject: "Nueva pregunta",
      phone,
      to: process.env.EMAIL_ADMIN_USER ?? "",
    });
    if (email)
      sendQuestionConfirmationEmail({
        to: email,
        subject: "Confirmation",
        question,
      });

    if (!existing) {
      // Si no existe, lo creamos
      const newProspect = await prisma.prospects.create({
        data: {
          email,
          phone,
          metadata: {
            question: [question],
          },
        },
      });

      return res.status(201).json(newProspect);
    } else {
      // Si ya existe, actualizamos el metadata y attended
      const previousMetadata: any = existing.metadata || {};
      const previousQuestions = Array.isArray(previousMetadata.question)
        ? previousMetadata.question
        : previousMetadata.question
        ? [previousMetadata.question]
        : [];
      const updatedProspect = await prisma.prospects.update({
        where: { id: existing.id },
        data: {
          attended: null,
          metadata: {
            ...previousMetadata,
            question: [...previousQuestions, question],
          },
        },
      });

      return res.status(200).json(updatedProspect);
    }
  } catch (error) {
    console.error("Error in questionFromProspect:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const answerProspectQuestion = async (req: Request, res: Response) => {
  try {
    const { email, answer } = req.body;

    if (!email || !answer) {
      return res.status(400).json({ error: "Email and answer are required" });
    }
    // Enviar correo con la respuesta
    await sendAnswerToProspectEmail({
      to: email,
      subject: "About your question",
      answer,
    });

    let existing = await prisma.prospects.findFirst({
      where: { email },
    });

    if (!existing) {
      // Si no existe, lo creamos
      const newProspect = await prisma.prospects.create({
        data: {
          email,
          metadata: {
            answer: [answer],
          },
        },
      });
    } else {
      // Si ya existe, actualizamos el metadata y attended
      const previousMetadata: any = existing.metadata || {};
      const previousAnswers = Array.isArray(previousMetadata.answer)
        ? previousMetadata.answer
        : previousMetadata.answer
        ? [previousMetadata.answer]
        : [];
      const updatedProspect = await prisma.prospects.update({
        where: { id: existing.id },
        data: {
          attended: null,
          metadata: {
            ...previousMetadata,
            answer: [...previousAnswers, answer],
          },
        },
      });
    }

    res.status(200).json({ message: "Respuesta enviada con éxito" });
  } catch (error) {
    console.error("Error en answerProspectQuestion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
