import { z } from "zod";

// ==================================================
// REUSABLE PASSWORD SCHEMA
// ==================================================

const passwordSchema = z
  .string()
  .min(
    8,
    "Password must be at least 8 characters.",
  )
  .max(
    128,
    "Password is too long.",
  );

// ==================================================
// REGISTER SCHEMA
// ==================================================

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(
      1,
      "First name is required.",
    )
    .max(
      100,
      "First name is too long.",
    ),

  lastName: z
    .string()
    .trim()
    .min(
      1,
      "Last name is required.",
    )
    .max(
      100,
      "Last name is too long.",
    ),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email(
      "Invalid email address.",
    )
    .max(
      320,
      "Email is too long.",
    ),

  referralCode: z
    .string()
    .trim()
    .min(
      1,
      "Referral code is required.",
    )
    .max(
      50,
      "Referral code is too long.",
    ),
});

// ==================================================
// VERIFY REGISTER OTP SCHEMA
// ==================================================

export const verifyRegisterOtpSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Invalid email address.",
      ),

    otp: z
      .string()
      .trim()
      .regex(
        /^\d{6}$/,
        "OTP must contain 6 digits.",
      ),

    password: passwordSchema,
  });

// ==================================================
// FORGOT PASSWORD SCHEMA
// ==================================================

export const forgotPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Invalid email address.",
      )
      .max(
        320,
        "Email is too long.",
      ),
  });

// ==================================================
// VERIFY FORGOT PASSWORD OTP SCHEMA
// ==================================================

export const verifyForgotPasswordOtpSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Invalid email address.",
      ),

    otp: z
      .string()
      .trim()
      .regex(
        /^\d{6}$/,
        "OTP must contain 6 digits.",
      ),
  });

// ==================================================
// RESET PASSWORD SCHEMA
// ==================================================

export const resetPasswordSchema =
  z.object({
    resetToken: z
      .string()
      .trim()
      .min(
        1,
        "Reset token is required.",
      ),

    newPassword: passwordSchema,
  });