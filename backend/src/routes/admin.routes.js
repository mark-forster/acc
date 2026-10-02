import express from "express";

import { requireAuthentication } from "../middleware/auth.middleware.js";

import { requireRole } from "../middleware/authorization.middleware.js";

const router = express.Router();

router.get(
  "/admin-dashboard",
  requireAuthentication,
  requireRole("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to admin dashboard.",
    });
  },
);

export default router;
