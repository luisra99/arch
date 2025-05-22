import nodemailer from "nodemailer";

// Configura el transporter según tu proveedor de correo
const transporter = nodemailer.createTransport({
  service: "gmail", // o cualquier otro servicio
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
