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
  const name = prospect.name || "";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Hola${name ? ` ${name}` : ""}, gracias por contactar a Dwellingplus.

Hemos recibido tu información y muy pronto uno de nuestros especialistas se pondrá en contacto contigo.

En Dwellingplus, nos especializamos en transformar ideas en espacios concretos. Nos encargamos de todo el proceso, facilitando que propietarios y desarrolladores cumplan su visión.

Gracias por confiar en nosotros.`,
    html: `
      <div style="max-width: 600px; margin: auto; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; border-radius: 12px; border: 1px solid #e0e0e0; color: #2c2c2c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://dwellingplus.vercel.app/assets/assets/logo.35029e2d1796423d6b79711f5ec47abf.svg" alt="Dwellingplus Logo" style="width: 150px; height: auto;" />
        </div>
        <h2 style="text-align: center; color: #1a1a1a;">Gracias por contactarnos${
          name ? `, ${name}` : ""
        }</h2>
        <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
          Hemos recibido tu información y muy pronto uno de nuestros especialistas se comunicará contigo para brindarte la atención que mereces.
        </p>
        <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
          En <strong>Dwellingplus</strong>, acompañamos a propietarios y desarrolladores en el proceso completo de materializar sus proyectos inmobiliarios, con pasión, precisión y visión.
        </p>
        <blockquote style="margin: 30px 0; font-style: italic; color: #555; border-left: 4px solid #ccc; padding-left: 15px;">
          “Tu espacio ideal no es un sueño lejano. Es un proyecto que empieza hoy.”
        </blockquote>
        <p style="font-size: 15px; text-align: center; color: #777;">Gracias por confiar en nosotros.</p>
        <div style="text-align: center; margin-top: 40px;">
          <a href="https://dwellingplus.com" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Visitar nuestro sitio</a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
