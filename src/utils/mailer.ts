import nodemailer from "nodemailer";

export const sendShareEmail = async (to: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "env.SMTP_USER",
      pass: "env.SMTP_PASS"
    }
  });

  await transporter.sendMail({
    from: `"Tu App" <${"env.SMTP_USER"}>`,
    to,
    subject: "Has recibido una carpeta o archivo",
    html: `<p>Haz clic para descargar: <a href="${link}">${link}</a></p>`
  });
};
