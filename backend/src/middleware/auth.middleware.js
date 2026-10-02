import { getAuth } from "@clerk/express";

import User from "../models/user.model.js";
import UserSession from "../models/userSession.model.js";

import AppError from "../utils/AppError.js";

/**
 * ============================================================
 * REQUIRE AUTHENTICATION
 * ============================================================
 *
 * Authentication flow:
 *
 * Client
 *   ↓
 * Clerk Session Token
 *   ↓
 * Clerk Authentication
 *   ↓
 * Get Clerk User ID
 *   ↓
 * Find Application User in MongoDB
 *   ↓
 * Check Account Status
 *   ↓
 * Get Clerk Session ID
 *   ↓
 * Check Application Session Revocation
 *   ↓
 * Attach req.user
 *   ↓
 * Attach req.auth
 *   ↓
 * next()
 *
 * Important:
 *
 * Clerk remains the source of truth for authentication.
 *
 * MongoDB User:
 *   - application user
 *   - role
 *   - account status
 *
 * MongoDB UserSession:
 *   - application-side session tracking
 *   - session revocation
 *
 * ============================================================
 */

export const requireAuthentication = async (req, res, next) => {
  try {
    // ========================================================
    // 1. GET CLERK AUTH CONTEXT
    // ========================================================

    const auth = getAuth(req, {
      acceptsToken: "session_token",
    });

    // ========================================================
    // 2. CHECK CLERK AUTHENTICATION
    // ========================================================

    if (!auth.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    // ========================================================
    // 3. GET CLERK USER ID
    // ========================================================

    const clerkId = auth.userId;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
        code: "INVALID_AUTH_SESSION",
      });
    }

    // ========================================================
    // 4. GET CLERK SESSION ID
    // ========================================================
    //
    // We need the session ID because our UserSession model
    // tracks application sessions using clerkSessionId.
    //
    // ========================================================

    const clerkSessionId = auth.sessionId;

    if (!clerkSessionId) {
      return res.status(401).json({
        success: false,
        message: "Authentication session is required.",
        code: "CLERK_SESSION_ID_REQUIRED",
      });
    }

    // ========================================================
    // 5. FIND APPLICATION USER
    // ========================================================
    //
    // Clerk authenticates the user.
    //
    // MongoDB contains the application's User record.
    //
    // ========================================================

    const user = await User.findOne({
      clerkId,
    }).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Application user not found.",
        code: "APPLICATION_USER_NOT_FOUND",
      });
    }

    // ========================================================
    // 6. CHECK ACCOUNT STATUS
    // ========================================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // ========================================================
    // 7. CHECK APPLICATION SESSION
    // ========================================================
    //
    // A valid Clerk session may not have an application
    // UserSession record yet.
    //
    // This can happen when the user makes their first
    // authenticated request before calling /auth/me.
    //
    // In that case we allow the request.
    //
    // /auth/me will create the application session.
    //
    // BUT:
    //
    // If a UserSession exists and is revoked, we reject it.
    //
    // ========================================================

    const userSession = await UserSession.findOne({
      userId: user._id,
      clerkSessionId,
    })
      .select("_id isRevoked")
      .lean();

    // ========================================================
    // 8. REJECT REVOKED APPLICATION SESSION
    // ========================================================

    if (userSession?.isRevoked) {
      return res.status(401).json({
        success: false,
        message: "This session has been revoked.",
        code: "SESSION_REVOKED",
      });
    }

    // ========================================================
    // 9. ATTACH USER TO REQUEST
    // ========================================================
    //
    // Controllers can now access:
    //
    // req.user
    //
    // Example:
    //
    // const userId = req.user._id;
    //
    // ========================================================

    req.user = user;

    // ========================================================
    // 10. ATTACH AUTH CONTEXT TO REQUEST
    // ========================================================
    //
    // Controllers/services can now access:
    //
    // req.auth.clerkId
    // req.auth.sessionId
    // req.auth.sessionClaims
    //
    // ========================================================

    req.auth = {
      clerkId,
      sessionId: clerkSessionId,
      sessionClaims: auth.sessionClaims,
    };

    // ========================================================
    // 11. CONTINUE REQUEST
    // ========================================================

    return next();
  } catch (error) {
    // ========================================================
    // AUTHENTICATION DEPENDENCY ERROR
    // ========================================================
    //
    // Possible failures:
    //
    // - Clerk authentication problem
    // - MongoDB connection problem
    // - User lookup failure
    // - UserSession lookup failure
    //
    // Do not expose internal error details to the client.
    //
    // ========================================================

    console.error("AUTHENTICATION ERROR:", error);

    return next(
      new AppError(
        "Authentication service temporarily unavailable.",
        503,
        "AUTHENTICATION_SERVICE_UNAVAILABLE",
      ),
    );
  }
};