import { env } from "process";
import { transporter } from "../../../libs/nodemailer";
import { createConfirmationEmail, createContactEmail, createQuestionConfirmationEmail, createQuestionToAdminEmail, createResponseEmail, createUnattendedProspectsEmail } from "../utils/email-generator";
import { prismaInstance } from "../../../../prisma/client";
import logger from "../../../libs/logger";


export const sendUnattendedProspectsEmailService = async (prisma = prismaInstance) => {
  try {
    const prospects = await prismaInstance.prospects.findMany({
      where: { attended: null },
    });

    if (prospects.length === 0) {
      console.log("No unattended prospects.");
      return;
    }
    const completeProspects = [];
    let incompleteCount = 0;
    for (const p of prospects) {
      const isIncomplete = !p.name && !p.lastName && !p.email && !p.phone;
      if (isIncomplete) {
        incompleteCount++;
      } else {
        completeProspects.push(p);
      }
    }

    const html = createUnattendedProspectsEmail({ completeProspects, incompleteCount })
    const mailOptions = {
      from: env.EMAIL_USER,
      to: env.EMAIL_ADMIN_USER,
      subject: "📌 Unattended Prospects - Dwellingplus",
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Unattended prospects email sent.");
  } catch (error) {
    logger.error(error)
  }
};

export const sendContactEmailService = async ({
  to,
  subject,
  prospect,
}: {
  to: string;
  subject: string;
  prospect: {
    name?: string;
    lastName?: string;
    address?: string;
    email?: string;
    phone?: string;
    state?: string;
    city?: string;
    postal?: string;
    metadata?: any;
  };
}) => {
  const {
    name = "Not specified",
    lastName = "Not specified",
    address = "Not specified",
    email: prospectEmail = "Not specified",
    phone = "Not specified",
    state = "Not specified",
    city = "Not specified",
    postal = "Not specified",
  } = prospect;

  // Phone action buttons if phone is provided and not the default "Not specified"
  const { html, text } = createContactEmail({ name, lastName, address, prospectEmail, phone, state, city, postal })

  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendConfirmationEmailService = async ({
  to,
  subject,
  prospect,
}: {
  to: string;
  subject: string;
  prospect: any;
}) => {
  const name = prospect.name || "";
  const { html, text } = createConfirmationEmail({ name })

  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendQuestionConfirmationEmailService = async ({
  to,
  subject,
  prospect,
  question,
}: {
  to: string;
  subject: string;
  prospect?: any;
  question: string;
}) => {
  const { html, text } = createQuestionConfirmationEmail({ question })

  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendQuestionToAdminEmailService = async ({
  to,
  subject,
  email,
  phone,
  question,
}: {
  to: string;
  subject: string;
  email: string;
  phone?: string;
  question: string;
}) => {
  const { html, text } = createQuestionToAdminEmail({ phone, email, question, })
  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  await transporter.sendMail(mailOptions);
};

export const sendAnswerToProspectEmailService = async ({
  to,
  subject,
  question,
  answer,
}: {
  to: string;
  subject: string;
  question: string;
  answer: string;
}) => {
  const { html, text } = createResponseEmail({ answer,question })

  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  await transporter.sendMail(mailOptions);
};

