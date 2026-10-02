import express from "express";

import { requireAuthentication } from "../middleware/auth.middleware.js";

import { authorizeRoles } from "../middleware/authorization.middleware.js";

import { getMyProfile, deleteUser } from "../controllers/user.controller.js";

const router = express.Router();

// ==================================================
// CURRENT USER
// ==================================================

router.get(
  "/me",

  requireAuthentication,

  getMyProfile,
);

// ==================================================
// ADMIN ONLY
// ==================================================

router.delete(
  "/:id",

  requireAuthentication,

  authorizeRoles("admin"),

  deleteUser,
);

export default router;
