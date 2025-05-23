import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Configura el transporter según tu proveedor de correo
const transporter = nodemailer.createTransport({
  service: "gmail", // o cualquier otro servicio
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendUnattendedProspectsEmail = async () => {
  const prospects = await prisma.prospects.findMany({
    where: { attended: null },
  });

  if (prospects.length === 0) {
    console.log("No hay prospectos pendientes.");
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

  const tableHeaders = `
    <tr>
      <th>Nombre</th>
      <th>Apellido</th>
      <th>Email</th>
      <th>Teléfono</th>
      <th>Acción</th>
    </tr>`;

  const tableRows = completeProspects
    .map(
      (p) => `
    <tr>
      <td>${p.name || ""}</td>
      <td>${p.lastName || ""}</td>
      <td>${p.email || ""}</td>
      <td>${p.phone || ""}</td>
      <td>
        <form action="${process.env.SERVER_URL}/prospect/${
        p.id
      }/atender" method="POST">
          <button type="submit" style="padding: 6px 12px; background-color: #4CAF50; color: white; border: none; border-radius: 4px;">
            Marcar como atendido
          </button>
        </form>
      </td>
    </tr>`
    )
    .join("");

  const incompleteRow = incompleteCount
    ? `
    <tr>
      <td>${incompleteCount}</td>
      <td>Sin información básica</td>
      <td colspan="3"></td>
    </tr>`
    : "";

  const htmlTable = `
    <h2>Prospectos no atendidos</h2>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">
      <thead>${tableHeaders}</thead>
      <tbody>${tableRows}${incompleteRow}</tbody>
    </table>`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Lista de Prospectos No Atendidos",
    html: htmlTable,
  };

  await transporter.sendMail(mailOptions);
  console.log("Correo de prospectos no atendidos enviado.");
};

export const sendContactEmail = async ({
  to,
  subject,
  prospect,
}: {
  to: string;
  subject: string;
  prospect: any;
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Nuevo prospecto:\n\n${JSON.stringify(prospect, null, 2)}`,
    html: `<h1>Nuevo prospecto</h1><pre>${JSON.stringify(
      prospect,
      null,
      2
    )}</pre>`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendConfirmationEmail = async ({
  to,
  subject,
  prospect,
}: {
  to: string;
  subject: string;
  prospect: any;
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Gracias por contactarnos ${
      prospect.name || ""
    }. Hemos recibido tu información y nos pondremos en contacto contigo pronto.`,
    html: `<h1>Gracias por contactarnos ${
      prospect.name || ""
    }</h1><p>Hemos recibido tu información y nos pondremos en contacto contigo pronto.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
