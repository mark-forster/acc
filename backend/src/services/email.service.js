import nodemailer from "nodemailer";

import { env } from "../config/env.js";
import logger from "../utils/logger.js";

// ==================================================
// EMAIL TRANSPORTER
// ==================================================

const transporter = nodemailer.createTransport({
  host: env.email.host,

  port: env.email.port,

  secure: env.email.secure,

  auth: {
    user: env.email.user,

    pass: env.email.password,
  },
});

// ==================================================
// VERIFY SMTP CONNECTION
// ==================================================

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

        logger.info("Email service connection established");
    
  } catch (error) {
    logger.error("Email service connection failed", { error });
    
    throw error;
  }
};

// ==================================================
// OTP SUBJECT
// ==================================================

const getOtpSubject = (purpose) => {
  switch (purpose) {
    case "register":
      return "College Management System - Registration OTP";

    case "forgot-password":
      return "College Management System - Password Reset OTP";

    case "reset-password":
      return "College Management System - Password Reset OTP";

    default:
      return "College Management System - Verification Code";
  }
};

// ==================================================
// OTP TITLE
// ==================================================

const getOtpTitle = (purpose) => {
  switch (purpose) {
    case "register":
      return "Verify Your Account";

    case "forgot-password":
      return "Reset Your Password";

    case "reset-password":
      return "Verify Password Reset";

    default:
      return "Verification Code";
  }
};

// ==================================================
// SEND OTP EMAIL
// ==================================================

export const sendOtpEmail = async ({ to, otp, purpose, expiresIn }) => {
  const expiresInMinutes = Math.ceil(expiresIn / 60);

  const subject = getOtpSubject(purpose);

  const title = getOtpTitle(purpose);

  // ==============================================
  // HTML EMAIL
  // ==============================================

  const html = `
      <!DOCTYPE html>

      <html>
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f4f5;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              border-radius:10px;
              padding:40px;
            "
          >

            <h1
              style="
                margin-bottom:20px;
              "
            >
              ${title}
            </h1>

            <p>
              Your verification code is:
            </p>

            <div
              style="
                margin:30px 0;
                padding:20px;
                text-align:center;
                font-size:32px;
                font-weight:bold;
                letter-spacing:8px;
                background:#f4f4f5;
                border-radius:8px;
              "
            >
              ${otp}
            </div>

            <p>
              This code will expire in
              <strong>
                ${expiresInMinutes} minutes
              </strong>.
            </p>

            <p>
              If you did not request this code,
              you can safely ignore this email.
            </p>

            <hr />

            <p
              style="
                font-size:12px;
                color:#71717a;
              "
            >
              College Management System
            </p>

          </div>

        </body>
      </html>
    `;

  // ==============================================
  // TEXT EMAIL
  // ==============================================

  const text = `
${title}

Your verification code is:

${otp}

This code will expire in ${expiresInMinutes} minutes.

If you did not request this code,
you can safely ignore this email.

College Management System
`;

  // ==============================================
  // SEND EMAIL
  // ==============================================

  const info = await transporter.sendMail({
    from: env.email.from,

    to,

    subject,

    text,

    html,
  });

  // ==============================================
  // LOG MESSAGE ID
  // ==============================================

  if (env.nodeEnv !== "production") {
    logger.info("OTP email sent", { messageId: info.messageId });
  }

  return {
    success: true,

    messageId: info.messageId,
  };
};
