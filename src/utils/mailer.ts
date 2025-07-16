import nodemailer from "nodemailer";

export const sendShareEmail = async (to: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"Tu App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Has recibido una carpeta o archivo",
    html: `<p>Haz clic para descargar: <a href="${link}">${link}</a></p>`
  });
};
