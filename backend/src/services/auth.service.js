import crypto from "node:crypto";
import mongoose from "mongoose";

import User from "../models/user.model.js";

import { redisClient } from "../config/redis.js";

import { clerkClient } from "../config/clerk.js";

import {
  createOtp,
  verifyOtp,
} from "./otp.service.js";

import {
  validateReferralCode,
  consumeReferralCode,
  createReferralCode,
} from "./referral.service.js";

import AppError from "../utils/AppError.js";

// ==================================================
// CONFIGURATION
// ==================================================

const REGISTRATION_TTL_SECONDS = 10 * 60;

const PASSWORD_RESET_TTL_SECONDS = 10 * 60;

// ==================================================
// REGISTRATION REDIS KEY
// ==================================================

const getRegistrationKey = (email) => {
  return `registration:pending:${email
    .trim()
    .toLowerCase()}`;
};

// ==================================================
// PASSWORD RESET TOKEN HASH
// ==================================================

const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ==================================================
// PASSWORD RESET REDIS KEY
// ==================================================

const getPasswordResetKey = (token) => {
  const tokenHash = hashResetToken(token);

  return `password-reset:${tokenHash}`;
};

// ==================================================
// START REGISTRATION
// ==================================================

export const startRegistration = async ({
  firstName,
  lastName,
  email,
  referralCode,
}) => {
  // ==================================================
  // NORMALIZE EMAIL
  // ==================================================

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // ==================================================
  // CHECK EXISTING USER
  // ==================================================

  const existingUser = await User.findOne({
    email: normalizedEmail,
  }).lean();

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists.",
      409,
      "USER_ALREADY_EXISTS",
    );
  }

  // ==================================================
  // VALIDATE REFERRAL
  // ==================================================

  const referralResult =
    await validateReferralCode(referralCode);

  // ==================================================
  // CREATE OTP
  // ==================================================

  const otpResult = await createOtp({
    purpose: "register",
    identifier: normalizedEmail,
  });

  if (!otpResult.success) {
    return otpResult;
  }

  // ==================================================
  // STORE PENDING REGISTRATION
  // ==================================================

  const registrationKey =
    getRegistrationKey(normalizedEmail);

  const registrationData = {
    firstName,
    lastName,
    email: normalizedEmail,

    referralId:
      referralResult.referral._id.toString(),

    referredBy:
      referralResult.referral.owner.toString(),
  };

  await redisClient.set(
    registrationKey,
    JSON.stringify(registrationData),
    {
      EX: REGISTRATION_TTL_SECONDS,
    },
  );

  // ==================================================
  // RETURN
  // ==================================================

  return {
    success: true,

    data: {
      expiresIn: otpResult.expiresIn,
      cooldown: otpResult.cooldown,
    },
  };
};

// ==================================================
// VERIFY REGISTRATION OTP
// ==================================================

export const verifyRegistrationOtp = async ({
  email,
  otp,
  password,
}) => {
  // ==================================================
  // NORMALIZE EMAIL
  // ==================================================

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // ==================================================
  // VERIFY OTP
  // ==================================================

  const otpResult = await verifyOtp({
    purpose: "register",
    identifier: normalizedEmail,
    otp,
  });

  if (!otpResult.success) {
    return otpResult;
  }

  // ==================================================
  // GET PENDING REGISTRATION
  // ==================================================

  const registrationKey =
    getRegistrationKey(normalizedEmail);

  const pending =
    await redisClient.get(registrationKey);

  if (!pending) {
    return {
      success: false,
      reason: "REGISTRATION_EXPIRED",
    };
  }

  // ==================================================
  // PARSE PENDING REGISTRATION
  // ==================================================

  let registration;

  try {
    registration = JSON.parse(pending);
  } catch {
    await redisClient.del(registrationKey);

    return {
      success: false,
      reason: "REGISTRATION_INVALID",
    };
  }

  // ==================================================
  // COMPLETE REGISTRATION
  // ==================================================

  const result = await completeRegistration({
    firstName: registration.firstName,

    lastName: registration.lastName,

    email: registration.email,

    password,

    referralId: registration.referralId,

    referredBy: registration.referredBy,
  });

  // ==================================================
  // DELETE PENDING REGISTRATION
  // ==================================================

  await redisClient.del(registrationKey);

  return result;
};

// ==================================================
// GENERATE USERNAME
// ==================================================

const generateUsername = (email) => {
  const usernameBase = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);

  const randomSuffix =
    crypto.randomInt(1000, 10000);

  return `${usernameBase}_${randomSuffix}`;
};

// ==================================================
// COMPLETE REGISTRATION
// ==================================================

export const completeRegistration = async ({
  firstName,
  lastName,
  email,
  password,
  referralId,
  referredBy,
}) => {
  // ==================================================
  // NORMALIZE EMAIL
  // ==================================================

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // ==================================================
  // CHECK EXISTING USER
  // ==================================================

  const existingUser = await User.findOne({
    email: normalizedEmail,
  }).lean();

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists.",
      409,
      "USER_ALREADY_EXISTS",
    );
  }

  // ==================================================
  // GENERATE USERNAME
  // ==================================================

  const generatedUsername =
    generateUsername(normalizedEmail);

  let clerkUser = null;

  // ==================================================
  // CREATE CLERK USER
  // ==================================================

  try {
    clerkUser =
      await clerkClient.users.createUser({
        emailAddress: [normalizedEmail],

        firstName,

        lastName,

        password,

        username: generatedUsername,
      });
  } catch (error) {
    console.error(
      "CLERK USER CREATION FAILED:",
      error,
    );

    throw new AppError(
      "Unable to create authentication account.",
      502,
      "CLERK_USER_CREATION_FAILED",
    );
  }

  // ==================================================
  // MONGODB TRANSACTION
  // ==================================================

  const session =
    await mongoose.startSession();

  let applicationUser = null;
  let newReferralCode = null;

  try {
    await session.withTransaction(
      async () => {
        // ==========================================
        // CREATE APPLICATION USER
        // ==========================================

        const users =
          await User.create(
            [
              {
                clerkId: clerkUser.id,

                firstName,

                lastName,

                email: normalizedEmail,

                referredBy:
                  referredBy || null,
              },
            ],
            {
              session,
            },
          );

        applicationUser = users[0];

        // ==========================================
        // CONSUME PARENT REFERRAL
        // ==========================================

        await consumeReferralCode({
          referralId,

          userId:
            applicationUser._id,

          session,
        });

        // ==========================================
        // CREATE USER REFERRAL CODE
        // ==========================================

        newReferralCode =
          await createReferralCode(
            applicationUser._id,
            session,
          );
      },
    );

    // ==================================================
    // SUCCESS
    // ==================================================

    return {
      success: true,

      data: {
        user: {
          id: applicationUser._id,

          clerkId:
            applicationUser.clerkId,

          firstName:
            applicationUser.firstName,

          lastName:
            applicationUser.lastName,

          email:
            applicationUser.email,

          role:
            applicationUser.role,
        },

        referralCode:
          newReferralCode.data,
      },
    };
  } catch (error) {
    // ==================================================
    // LOG DATABASE FAILURE
    // ==================================================

    console.error(
      "REGISTRATION TRANSACTION FAILED:",
      error,
    );

    // ==================================================
    // CLERK ROLLBACK
    // ==================================================

    if (clerkUser?.id) {
      try {
        await clerkClient.users.deleteUser(
          clerkUser.id,
        );
      } catch (rollbackError) {
        console.error(
          "CLERK ROLLBACK FAILED:",
          rollbackError,
        );
      }
    }

    // ==================================================
    // MONGODB DUPLICATE KEY
    // ==================================================

    if (error?.code === 11000) {
      const duplicateFields =
        Object.keys(
          error.keyPattern || {},
        );

      if (
        duplicateFields.includes("email")
      ) {
        throw new AppError(
          "An account with this email already exists.",
          409,
          "USER_ALREADY_EXISTS",
        );
      }

      if (
        duplicateFields.includes("clerkId")
      ) {
        throw new AppError(
          "Authentication account is already linked.",
          409,
          "CLERK_ACCOUNT_ALREADY_LINKED",
        );
      }
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// ==================================================
// FORGOT PASSWORD
// ==================================================

export const forgotPassword = async ({
  email,
}) => {
  // ==================================================
  // NORMALIZE EMAIL
  // ==================================================

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // ==================================================
  // FIND USER
  // ==================================================

  const user = await User.findOne({
    email: normalizedEmail,
  }).lean();

  // ==================================================
  // ACCOUNT ENUMERATION PROTECTION
  // ==================================================

  if (!user || !user.isActive) {
    return {
      success: true,

      data: {
        expiresIn: PASSWORD_RESET_TTL_SECONDS,
      },
    };
  }

  // ==================================================
  // CREATE OTP
  // ==================================================

  const otpResult = await createOtp({
    purpose: "forgot-password",

    identifier: normalizedEmail,
  });

  // ==================================================
  // OTP COOLDOWN
  // ==================================================

  if (!otpResult.success) {
    return otpResult;
  }

  // ==================================================
  // RETURN
  // ==================================================

  return {
    success: true,
    userId: user._id,

    data: {
      expiresIn:
        otpResult.expiresIn,

      cooldown:
        otpResult.cooldown,
    },
  };
};

// ==================================================
// VERIFY FORGOT PASSWORD OTP
// ==================================================

export const verifyForgotPasswordOtp = async ({
  email,
  otp,
}) => {
  // ==================================================
  // NORMALIZE EMAIL
  // ==================================================

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  // ==================================================
  // FIND USER
  // ==================================================

  const user = await User.findOne({
    email: normalizedEmail,
  }).lean();

  // ==================================================
  // USER NOT FOUND
  // ==================================================

  if (!user) {
    return {
      success: false,
      reason: "INVALID_OTP",
    };
  }

  // ==================================================
  // ACCOUNT INACTIVE
  // ==================================================

  if (!user.isActive) {
    return {
      success: false,
      reason: "INVALID_OTP",
    };
  }

  // ==================================================
  // VERIFY OTP
  // ==================================================

  const otpResult = await verifyOtp({
    purpose: "forgot-password",

    identifier: normalizedEmail,

    otp,
  });

  if (!otpResult.success) {
    return {
      ...otpResult,
      userId: user._id,
    };
  }

  // ==================================================
  // GENERATE RESET TOKEN
  // ==================================================

  const resetToken =
    crypto.randomBytes(32).toString("hex");

  // ==================================================
  // CREATE REDIS KEY
  // ==================================================

  const resetKey =
    getPasswordResetKey(resetToken);

  // ==================================================
  // STORE RESET SESSION
  // ==================================================

  await redisClient.set(
    resetKey,

    JSON.stringify({
      userId: user._id.toString(),

      clerkId: user.clerkId,

      email: user.email,
    }),

    {
      EX: PASSWORD_RESET_TTL_SECONDS,
    },
  );

  // ==================================================
  // RETURN RESET TOKEN
  // ==================================================

  return {
    success: true,
    userId: user._id,

    data: {
      resetToken,

      expiresIn:
        PASSWORD_RESET_TTL_SECONDS,
    },
  };
};

// ==================================================
// RESET PASSWORD
// ==================================================

export const resetPassword = async ({
  resetToken,
  newPassword,
}) => {
  // ==================================================
  // BASIC TOKEN VALIDATION
  // ==================================================

  if (
    !resetToken ||
    typeof resetToken !== "string"
  ) {
    return {
      success: false,

      reason: "INVALID_RESET_TOKEN",
    };
  }

  // ==================================================
  // GET REDIS KEY
  // ==================================================

  const resetKey =
    getPasswordResetKey(resetToken);

  // ==================================================
  // ATOMICALLY CLAIM RESET TOKEN
  // ==================================================
  //
  // Redis GET + DEL as two separate commands
  // can create a race condition.
  //
  // Two requests could both GET the token
  // before either request deletes it.
  //
  // This Lua script makes the operation atomic.
  //
  // ==================================================

  const resetData =
    await redisClient.eval(
      `
        local value =
          redis.call("GET", KEYS[1])

        local ttl = redis.call("TTL", KEYS[1])

        if value then
          redis.call("DEL", KEYS[1])
        end

        return {value, ttl}
      `,
      {
        keys: [resetKey],

        arguments: [],
      },
    );

  // ==================================================
  // TOKEN INVALID / EXPIRED / ALREADY USED
  // ==================================================

  const claimedResetData = Array.isArray(resetData) ? resetData[0] : resetData;
  const claimedResetTtl = Array.isArray(resetData) ? Number(resetData[1]) : 0;

  if (!claimedResetData) {
    return {
      success: false,

      reason: "RESET_TOKEN_EXPIRED",
    };
  }

  // ==================================================
  // PARSE RESET SESSION
  // ==================================================

  let resetSession;

  try {
    resetSession =
      JSON.parse(claimedResetData);
  } catch {
    return {
      success: false,

      reason: "INVALID_RESET_TOKEN",
    };
  }

  // ==================================================
  // VALIDATE RESET SESSION
  // ==================================================

  if (
    !resetSession?.userId ||
    !resetSession?.clerkId
  ) {
    return {
      success: false,

      reason: "INVALID_RESET_TOKEN",
    };
  }

  // ==================================================
  // FIND USER
  // ==================================================

  const user =
    await User.findById(
      resetSession.userId,
    ).lean();

  if (!user) {
    return {
      success: false,

      reason: "INVALID_RESET_TOKEN",
    };
  }

  // ==================================================
  // CHECK ACCOUNT STATUS
  // ==================================================

  if (!user.isActive) {
    return {
      success: false,

      reason: "INVALID_RESET_TOKEN",
    };
  }

  // ==================================================
  // VERIFY CLERK IDENTITY
  // ==================================================

  if (
    user.clerkId !==
    resetSession.clerkId
  ) {
    return {
      success: false,

      reason: "INVALID_RESET_TOKEN",
    };
  }

  // ==================================================
  // UPDATE CLERK PASSWORD
  // ==================================================

 try {
  await clerkClient.users.updateUser(
    resetSession.clerkId,
    {
      password: newPassword,
      signOutOfOtherSessions: true,
    },
  );
} catch (error) {
  if (claimedResetTtl > 0) {
    try {
      await redisClient.set(
        resetKey,
        claimedResetData,
        { EX: claimedResetTtl },
      );
    } catch (restoreError) {
      console.error(
        "Failed to restore password reset token:",
        restoreError?.message,
      );
    }
  }

  console.error(
    "CLERK PASSWORD RESET FAILED:",
    error?.message,
  );

  throw new AppError(
    "Unable to reset password.",
    502,
    "PASSWORD_RESET_FAILED",
  );
}

  // ==================================================
  // SUCCESS
  // ==================================================

  return {
    success: true,
    userId: user._id,

    data: {
      message:
        "Password reset successfully.",
    },
  };
};

