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

  const tableRows = completeProspects
    .map(
      (p) => `
        <tr>
          <td>${p.name || "-"}</td>
          <td>${p.lastName || "-"}</td>
          <td>${p.email || "-"}</td>
          <td>${p.phone || "-"}</td>
          <td>
            <form action="${process.env.SERVER_URL}/prospect/${
        p.id
      }/atender" method="POST">
              <button type="submit" style="padding: 6px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px;">
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
        <td colspan="5" style="background-color: #fff3cd; color: #856404; text-align: center;">
          ${incompleteCount} prospecto(s) sin información básica (omitidos)
        </td>
      </tr>`
    : "";

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #2c3e50;">📋 Lista de Prospectos No Atendidos</h2>
      <p style="margin-bottom: 20px;">A continuación se muestra un resumen de los prospectos que aún no han sido atendidos.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; border: 1px solid #ddd;">Nombre</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Apellido</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Email</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Teléfono</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          ${incompleteRow}
        </tbody>
      </table>
      <footer style="font-size: 12px; color: #999; text-align: center;">
        Enviado automáticamente por Dwellingplus | ${new Date().toLocaleDateString()}
      </footer>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "📌 Prospectos No Atendidos - Dwellingplus",
    html: htmlContent,
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
  prospect: {
    name?: string;
    lastName?: string;
    address?: string;
    email?: string;
    phone?: string;
    state?: string;
    city?: string;
    postal?: string;
    id?: string;
  };
}) => {
  const {
    name = "No especificado",
    lastName = "No especificado",
    address = "No especificada",
    email: prospectEmail = "No especificado",
    phone = "No especificado",
    state = "No especificado",
    city = "No especificada",
    postal = "No especificado",
    id = "No especificado",
  } = prospect;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Nuevo prospecto de contacto:

ID: ${id}
Nombre: ${name} ${lastName}
Email: ${prospectEmail}
Teléfono: ${phone}
Dirección: ${address}
Ciudad: ${city}
Estado: ${state}
Código Postal: ${postal}
`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #222;">📬 Nuevo Prospecto de Contacto</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <tbody>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">ID</td><td style="padding: 8px; border: 1px solid #ddd;">${id}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Nombre</td><td style="padding: 8px; border: 1px solid #ddd;">${name} ${lastName}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${prospectEmail}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Teléfono</td><td style="padding: 8px; border: 1px solid #ddd;">${phone}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Dirección</td><td style="padding: 8px; border: 1px solid #ddd;">${address}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Ciudad</td><td style="padding: 8px; border: 1px solid #ddd;">${city}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Estado</td><td style="padding: 8px; border: 1px solid #ddd;">${state}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Código Postal</td><td style="padding: 8px; border: 1px solid #ddd;">${postal}</td></tr>
          </tbody>
        </table>
      </div>
    `,
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
          <img src="https://dwellingplus.vercel.app/logo.svg" alt="Dwellingplus Logo" style="width: 150px; height: auto;" />
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
