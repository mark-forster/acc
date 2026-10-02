import mongoose from "mongoose";

// ==================================================
// SECURITY EVENT TYPES
// ==================================================

export const SECURITY_EVENT_TYPES = Object.freeze([
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
  "LOGOUT_ALL",
  "OTP_SENT",
  "OTP_FAILED",
  "OTP_VERIFIED",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_RESET_COMPLETED",
  "SESSION_REVOKED",
  "NEW_DEVICE_LOGIN",
  "ROLE_CHANGED",
  "ACCOUNT_DEACTIVATED",
]);

// ==================================================
// SECURITY EVENT SCHEMA
// ==================================================

const securityEventSchema =
  new mongoose.Schema(
    {
      // ==============================================
      // USER
      // ==============================================

      userId: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,

      },

      // ==============================================
      // EVENT TYPE
      // ==============================================

      eventType: {
        type: String,

        required: true,

        enum: SECURITY_EVENT_TYPES,

      },

      // ==============================================
      // IP ADDRESS
      // ==============================================

      ipAddress: {
        type: String,

        default: null,
      },

      // ==============================================
      // USER AGENT
      // ==============================================

      userAgent: {
        type: String,

        default: null,

        maxlength: 1000,
      },

      // ==============================================
      // DEVICE
      // ==============================================

      deviceId: {
        type: String,

        default: null,

        maxlength: 255,
      },

      // ==============================================
      // ADDITIONAL SAFE METADATA
      // ==============================================

      metadata: {
        type: mongoose.Schema.Types.Mixed,

        default: null,
      },
    },

    {
      timestamps: true,
    },
  );

// ==================================================
// INDEXES
// ==================================================

securityEventSchema.index({
  userId: 1,
  createdAt: -1,
});

securityEventSchema.index({
  eventType: 1,
  createdAt: -1,
});

// ==================================================
// MODEL
// ==================================================

const SecurityEvent =
  mongoose.model(
    "SecurityEvent",
    securityEventSchema,
  );

export default SecurityEvent;