import SecurityEvent from "../models/securityEvent.model.js";

import {
  SECURITY_EVENT_TYPES,
} from "../models/securityEvent.model.js";

import AppError  from "../utils/AppError.js";

// ==================================================
// CREATE SECURITY EVENT
// ==================================================

export const createSecurityEvent = async ({
  userId = null,
  eventType,
  ipAddress = null,
  userAgent = null,
  deviceId = null,
  metadata = null,
}) => {
  // ==================================================
  // VALIDATE EVENT TYPE
  // ==================================================

  if (!eventType) {
    throw new AppError(
      "Security event type is required.",
      400,
      "SECURITY_EVENT_TYPE_REQUIRED",
    );
  }

  // ==================================================
  // VALIDATE EVENT TYPE VALUE
  // ==================================================

  if (!SECURITY_EVENT_TYPES.includes(eventType)) {
    throw new AppError(
      "Invalid security event type.",
      400,
      "INVALID_SECURITY_EVENT_TYPE",
    );
  }

  // ==================================================
  // CREATE SECURITY EVENT
  // ==================================================

  try {
    const securityEvent =
      await SecurityEvent.create({
        userId,
        eventType,
        ipAddress,
        userAgent,
        deviceId,
        metadata,
      });

    return securityEvent;
  } catch (error) {
    throw new AppError(
      "Unable to create security event.",
      500,
      "SECURITY_EVENT_CREATION_FAILED",
      {
        cause: error,
      },
    );
  }
};