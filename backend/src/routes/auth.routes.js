import express from "express";
import {
  register,
  verifyRegisterOtp,
  forgotPasswordController,
  verifyForgotPasswordOtpController,
  resetPasswordController,
  getMe,
  logout,
} from "../controllers/auth.controller.js";

import {
  validate as validationMiddleware,
} from "../middleware/validation.middleware.js";

import {
  authRateLimiter,
  strictRateLimiter,
  emailRateLimiter,
  otpVerifyRateLimiter,
} from "../middleware/rateLimit.middleware.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

import {
  registerSchema,
  verifyRegisterOtpSchema,
  forgotPasswordSchema,
  verifyForgotPasswordOtpSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema.js";

const router = express.Router();

// ==================================================
// REGISTER
// ==================================================

router.post(
  "/register",

  authRateLimiter,

  emailRateLimiter,

  validationMiddleware(
    registerSchema,
  ),

  register,
);

// ==================================================
// VERIFY REGISTER OTP
// ==================================================

router.post(
  "/register/verify",

  authRateLimiter,

  otpVerifyRateLimiter,

  validationMiddleware(
    verifyRegisterOtpSchema,
  ),

  verifyRegisterOtp,
);

// ==================================================
// FORGOT PASSWORD
// ==================================================

router.post(
  "/forgot-password",

  authRateLimiter,

  emailRateLimiter,

  validationMiddleware(
    forgotPasswordSchema,
  ),

  forgotPasswordController,
);

// ==================================================
// VERIFY FORGOT PASSWORD OTP
// ==================================================

router.post(
  "/forgot-password/verify",

  authRateLimiter,

  otpVerifyRateLimiter,

  validationMiddleware(
    verifyForgotPasswordOtpSchema,
  ),

  verifyForgotPasswordOtpController,
);

// ==================================================
// RESET PASSWORD
// ==================================================

router.post(
  "/reset-password",

  strictRateLimiter,

  validationMiddleware(
    resetPasswordSchema,
  ),

  resetPasswordController,
);

// ==================================================
// CURRENT USER
// ==================================================

router.get(
  "/me",

  requireAuthentication,

  getMe,
);
router.post(
  "/logout",
  strictRateLimiter,
  requireAuthentication,
  logout,
);
export default router;