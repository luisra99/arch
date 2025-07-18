import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Configura el transporter según tu proveedor de correo
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true para 465
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

  const tableRows = completeProspects
    .map((p) => {
      // Only show phone buttons if phone exists
      const phoneButtons = p.phone
        ? `
          <td style="text-align: center;">
            <a href="tel:${p.phone}" style="display: inline-block; padding: 6px 10px; background: #4caf50; color: #fff; text-decoration: none; border-radius: 4px;">Call</a>
          </td>
          <td style="text-align: center;">
            <a href="sms:${p.phone}" style="display: inline-block; padding: 6px 10px; background: #2196f3; color: #fff; text-decoration: none; border-radius: 4px;">SMS</a>
          </td>
          <td style="text-align: center;">
            <a href="https://wa.me/${p.phone.replace(/[^0-9]/g, '')}" style="display: inline-block; padding: 6px 10px; background: #25d366; color: #fff; text-decoration: none; border-radius: 4px;">WhatsApp</a>
          </td>
        `
        : `
          <td style="text-align: center; color: #aaa;">-</td>
          <td style="text-align: center; color: #aaa;">-</td>
          <td style="text-align: center; color: #aaa;">-</td>
        `;

      return `
        <tr>
          <td>${p.name || "-"}</td>
          <td>${p.lastName || "-"}</td>
          <td>${p.email || "-"}</td>
          <td>${p.phone || "-"}</td>
          ${phoneButtons}
          <td style="text-align: center;">
            <form action="${process.env.SERVER_URL}/prospect/${p.id}/atender" method="POST">
              <button type="submit" style="padding: 6px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px;">
                Mark as Attended
              </button>
            </form>
          </td>
        </tr>
      `;
    })
    .join("");

  const incompleteRow = incompleteCount
    ? `
      <tr>
        <td colspan="8" style="background-color: #fff3cd; color: #856404; text-align: center;">
          ${incompleteCount} prospect(s) without basic information (omitted)
        </td>
      </tr>`
    : "";

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #2c3e50;">📋 Unattended Prospects List</h2>
      <p style="margin-bottom: 20px;">Below is a summary of prospects that have not yet been attended to.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; border: 1px solid #ddd;">First Name</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Last Name</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Email</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Phone</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Call</th>
            <th style="padding: 10px; border: 1px solid #ddd;">SMS</th>
            <th style="padding: 10px; border: 1px solid #ddd;">WhatsApp</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          ${incompleteRow}
        </tbody>
      </table>
      <footer style="font-size: 12px; color: #999; text-align: center;">
        Automatically sent by Dwellingplus | ${new Date().toLocaleDateString()}
      </footer>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_ADMIN_USER,
    subject: "📌 Unattended Prospects - Dwellingplus",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  console.log("Unattended prospects email sent.");
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
  const phoneButtons =
    phone && phone !== "Not specified"
      ? `
        <div style="margin: 15px 0;">
          <a href="tel:${phone}" style="display: inline-block; margin-right: 10px; padding: 8px 14px; background: #4caf50; color: #fff; text-decoration: none; border-radius: 4px;">Call</a>
          <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="display: inline-block; padding: 8px 14px; background: #25d366; color: #fff; text-decoration: none; border-radius: 4px;">WhatsApp</a>
        </div>
      `
      : "";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `New contact prospect:

Name: ${name} ${lastName}
Email: ${prospectEmail}
Phone: ${phone}
Address: ${address}
City: ${city}
State: ${state}
Postal Code: ${postal}
Message: ${prospect.metadata?.message || "Not specified"}
`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #222;">📬 New Contact Prospect</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <tbody>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Name</td><td style="padding: 8px; border: 1px solid #ddd;">${name} ${lastName}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${prospectEmail}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Phone</td><td style="padding: 8px; border: 1px solid #ddd;">${phone}${phoneButtons}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Address</td><td style="padding: 8px; border: 1px solid #ddd;">${address}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">City</td><td style="padding: 8px; border: 1px solid #ddd;">${city}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">State</td><td style="padding: 8px; border: 1px solid #ddd;">${state}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Postal Code</td><td style="padding: 8px; border: 1px solid #ddd;">${postal}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; border: 1px solid #ddd;">Message</td><td style="padding: 8px; border: 1px solid #ddd;">${
              prospect.metadata?.message || "Not specified"
            }</td></tr>
          </tbody>
        </table>
        <p style="color: #777; font-size: 14px; margin-top: 20px;">This message was automatically generated by the Dwellingplus contact system.</p>
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
    text: `Hello${name ? ` ${name}` : ""}, thank you for contacting Dwellingplus.

We have received your information and one of our specialists will contact you very soon.

At Dwellingplus, we specialize in turning ideas into real spaces. We handle the entire process, making it easier for property owners and developers to fulfill their vision.

Thank you for trusting us.`,
    html: `
      <div style="max-width: 600px; margin: auto; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; border-radius: 12px; border: 1px solid #e0e0e0; color: #2c2c2c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://dwellingplus.studio/logo.png" alt="Dwellingplus Logo" style="width: 150px; height: auto;" />
        </div>
        <h2 style="text-align: center; color: #1a1a1a;">Thank you for contacting us${name ? `, ${name}` : ""}</h2>
        <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
          We have received your information and one of our specialists will reach out to you soon to provide the attention you deserve.
        </p>
        <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
          At <strong>Dwellingplus</strong>, we guide property owners and developers through the entire process of bringing their real estate projects to life—with passion, precision, and vision.
        </p>
        <blockquote style="margin: 30px 0; font-style: italic; color: #555; border-left: 4px solid #ccc; padding-left: 15px;">
          “Your ideal space is not a distant dream. It's a project that starts today.”
        </blockquote>
        <p style="font-size: 15px; text-align: center; color: #777;">Thank you for trusting us.</p>
        <div style="text-align: center; margin-top: 40px;">
          <a href="https://dwellingplus.studio" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit our website</a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendQuestionConfirmationEmail = async ({
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
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Hello, we have received your question:

"${question}"

One of our specialists will contact you very soon to provide the attention you deserve.

Thank you for trusting Dwellingplus.`,
    html: `
      <div style="max-width: 600px; margin: auto; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; border-radius: 12px; border: 1px solid #e0e0e0; color: #2c2c2c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://dwellingplus.studio/logo.png" alt="Dwellingplus Logo" style="width: 150px; height: auto;" />
        </div>
        <h2 style="text-align: center; color: #1a1a1a;">We have received your question</h2>
        <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
          Here is your inquiry:
        </p>
        <blockquote style="margin: 20px 0; padding-left: 15px; border-left: 4px solid #ccc; color: #555;">
          ${question}
        </blockquote>
        <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
          One of our specialists will contact you shortly to provide a personalized response.
        </p>
        <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
          At <strong>Dwellingplus</strong>, we transform ideas into spaces. We are committed to making your project a reality.
        </p>
        <p style="font-size: 15px; text-align: center; color: #777;">Thank you for trusting us.</p>
        <div style="text-align: center; margin-top: 40px;">
          <a href="https://dwellingplus.studio" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit our website</a>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendQuestionToAdminEmail = async ({
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
  // Helper to generate phone action buttons if phone is provided
  const phoneButtons = phone
    ? `
      <div style="margin: 15px 0;">
        <a href="tel:${phone}" style="display: inline-block; margin-right: 10px; padding: 8px 14px; background: #4caf50; color: #fff; text-decoration: none; border-radius: 4px;">Call</a>
        <a href="sms:${phone}" style="display: inline-block; margin-right: 10px; padding: 8px 14px; background: #2196f3; color: #fff; text-decoration: none; border-radius: 4px;">Send SMS</a>
        <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="display: inline-block; padding: 8px 14px; background: #25d366; color: #fff; text-decoration: none; border-radius: 4px;">WhatsApp</a>
      </div>
    `
    : "";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `New prospect message:

Email: ${email ?? ""}
${phone ? `Phone: ${phone}` : ""}
Question: ${question}
`,
    html: `
      <div style="max-width: 600px; margin: auto; padding: 30px; font-family: Arial, sans-serif; background-color: #fefefe; border: 1px solid #ccc; border-radius: 8px;">
        <h2 style="color: #222;">New Prospect Message</h2>
        ${
          email
            ? `<p><strong>Email:</strong> ${email}</p>`
            : "<p><em>No email provided</em></p>"
        }
        ${
          phone
            ? `<p><strong>Phone:</strong> ${phone}</p>${phoneButtons}`
            : "<p><em>No phone provided</em></p>"
        }
        <p><strong>Question:</strong></p>
        <blockquote style="margin: 20px 0; padding-left: 15px; border-left: 3px solid #aaa; color: #333;">
          ${question}
        </blockquote>
        <p style="color: #777; font-size: 14px;">This message was automatically generated by the Dwellingplus contact system.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendAnswerToProspectEmail = async ({
  to,
  subject,
  answer,
}: {
  to: string;
  subject: string;
  answer: string;
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Hello, thank you for your inquiry.

Here is our response:
${answer}

We are here to help you.

The Dwellingplus Team.`,
    html: `
      <div style="max-width: 600px; margin: auto; padding: 40px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 12px; border: 1px solid #e0e0e0; color: #2c2c2c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://dwellingplus.studio/logo.png" alt="Dwellingplus Logo" style="width: 150px;" />
        </div>
        <h2 style="text-align: center; color: #1a1a1a;">Hello</h2>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for reaching out to us. Here is the answer to your inquiry:</p>
        <blockquote style="margin: 20px 0; padding-left: 15px; border-left: 3px solid #ccc; font-style: italic;">
          ${answer}
        </blockquote>
        <p style="font-size: 15px;">If you have any further questions, feel free to reply to this email. We are here to help you.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://dwellingplus.studio" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Visit our website</a>
        </div>
        <p style="text-align: center; font-size: 13px; color: #999; margin-top: 40px;">Dwellingplus · Customer Service</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

