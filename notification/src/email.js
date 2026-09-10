import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  if (
    process.env.EMAIL_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS,
      },
    });
  }

  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.REFRESH_TOKEN &&
    process.env.EMAIL_USER
  ) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

let transporter;

const getTransporter = () => {
  transporter ??= createTransporter();
  return transporter;
};

export const normalizeMailInput = (input, subject, text, html) => {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return {
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    };
  }

  return {
    to: input,
    subject,
    text,
    html,
  };
};

// Send Email Function
export const sendEmail = async (input, subject, text, html) => {
  const payload = normalizeMailInput(input, subject, text, html);

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "notification-service@example.com",
      to: payload.to,
      subject: payload.subject || "Notification",
      text: payload.text,
      html: payload.html,
    };

    const info = await getTransporter().sendMail(mailOptions);

    console.log("Email sent:", info.messageId || "local-preview");

    return info;
  } catch (error) {
    console.warn(
      "Email delivery failed, continuing without failing the notification flow:",
      error.message || error
    );

    return {
      messageId: null,
      skipped: true,
      error: error.message || String(error),
    };
  }
};

export default getTransporter();