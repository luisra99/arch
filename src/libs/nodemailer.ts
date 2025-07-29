import nodemailer from "nodemailer";
import { env } from "../config/env";

// Configura el transporter según tu proveedor de correo
export const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true para 465
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});
