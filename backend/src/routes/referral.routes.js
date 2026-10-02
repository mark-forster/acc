import express from "express";

import {
  validateReferral,
  getReferrals,
  revokeReferral,
} from "../controllers/referral.controller.js";

import { requireAuthentication as requireAuth } from "../middleware/auth.middleware.js";

import { strictRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// ==================================================
// VALIDATE REFERRAL
// PUBLIC
// ==================================================

router.post(
  "/validate",

  strictRateLimiter,

  validateReferral,
);

// ==================================================
// GET MY REFERRAL CODE
// PROTECTED
// ==================================================

router.get(
  "/",

  requireAuth,

  getReferrals,
);

// ==================================================
// REVOKE REFERRAL
// PROTECTED
// ==================================================

router.post(
  "/:id/revoke",

  requireAuth,

  strictRateLimiter,

  revokeReferral,
);

export default router;
