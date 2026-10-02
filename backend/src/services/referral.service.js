import crypto from "crypto";

import ReferralCode from "../models/referralCode.model.js";

import ReferralRedemption from "../models/referralRedemption.model.js";

import {
  encryptReferralCode,
  decryptReferralCode,
} from "../utils/referralCrypto.js";

// ==================================================
// CONFIGURATION
// ==================================================

const MAX_REFERRAL_USES = 10;

const REFERRAL_CODE_BYTES = 6;

// ==================================================
// GENERATE REFERRAL CODE
// ==================================================

const generateReferralCode = () => {
  return crypto.randomBytes(REFERRAL_CODE_BYTES).toString("hex").toUpperCase();
};

// ==================================================
// HASH REFERRAL CODE
// ==================================================

const hashReferralCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

// ==================================================
// PREVIEW
// ==================================================

const createCodePreview = (code) => {
  return `${code.slice(0, 4)}••••`;
};

// ==================================================
// CREATE REFERRAL CODE
// ==================================================

export const createReferralCode = async (userId, session = null) => {
  // ==============================================
  // CHECK EXISTING CODE
  // ==============================================

  const existingQuery = ReferralCode.findOne({
    owner: userId,
  });

  if (session) {
    existingQuery.session(session);
  }

  const existing = await existingQuery;

  // ==============================================
  // IDEMPOTENT
  // ==============================================

  if (existing) {
    return {
      success: true,

      data: {
        id: existing._id,

        code: null,

        codePreview: existing.codePreview,

        usedCount: existing.usedCount,

        maxUses: existing.maxUses,

        remaining: existing.maxUses - existing.usedCount,

        status: existing.status,

        expiresAt: existing.expiresAt,

        createdAt: existing.createdAt,
      },
    };
  }

  // ==============================================
  // GENERATE UNIQUE CODE
  // ==============================================

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode();

    const codeHash = hashReferralCode(code);

    // ==========================================
    // CHECK HASH DUPLICATE
    // ==========================================

    const exists = await ReferralCode.exists({
      codeHash,
    });

    if (exists) {
      continue;
    }

    // ==========================================
    // ENCRYPT FULL CODE
    // ==========================================

    const encryptedCode = encryptReferralCode(code);

    // ==========================================
    // CREATE
    // ==========================================

    try {
      const created = await ReferralCode.create(
        [
          {
            owner: userId,

            codeHash,

            encryptedCode,

            codePreview: createCodePreview(code),

            usedCount: 0,

            maxUses: MAX_REFERRAL_USES,

            status: "active",

            expiresAt: null,
          },
        ],
        {
          session,
        },
      );

      const referralCode = created[0];

      // ========================================
      // RETURN
      // ========================================

      return {
        success: true,

        data: {
          id: referralCode._id,

          // Plain code is returned only
          // when newly created.

          code,

          codePreview: referralCode.codePreview,

          usedCount: referralCode.usedCount,

          maxUses: referralCode.maxUses,

          remaining: referralCode.maxUses - referralCode.usedCount,

          status: referralCode.status,

          expiresAt: referralCode.expiresAt,

          createdAt: referralCode.createdAt,
        },
      };
    } catch (error) {
      // ========================================
      // DUPLICATE CODE HASH
      // ========================================

      if (error?.code === 11000) {
        continue;
      }

      throw error;
    }
  }

  // ==============================================
  // FAILED
  // ==============================================

  const error = new Error("Unable to generate referral code.");

  error.code = "REFERRAL_CODE_GENERATION_FAILED";

  throw error;
};

// ==================================================
// GET MY REFERRAL CODE
// ==================================================

export const getUserReferralCodes = async (userId) => {
  const referralCodes = await ReferralCode.find({
    owner: userId,
  })
    .select(
      "+encryptedCode _id codePreview usedCount maxUses status expiresAt createdAt",
    )
    .sort({
      createdAt: -1,
    })
    .lean();

  // ==============================================
  // DECRYPT FOR AUTHENTICATED OWNER
  // ==============================================

  const data = referralCodes.map((referral) => {
    const code = decryptReferralCode(referral.encryptedCode);

    return {
      _id: referral._id,

      code,

      codePreview: referral.codePreview,

      usedCount: referral.usedCount,

      maxUses: referral.maxUses,

      remaining: referral.maxUses - referral.usedCount,

      status: referral.status,

      expiresAt: referral.expiresAt,

      createdAt: referral.createdAt,
    };
  });

  return {
    success: true,

    data,
  };
};

// ==================================================
// VALIDATE REFERRAL CODE
// ==================================================

export const validateReferralCode = async (code) => {
  // ==============================================
  // REQUIRED
  // ==============================================

  if (typeof code !== "string" || !code.trim()) {
    const error = new Error("Referral code is required.");

    error.code = "REFERRAL_CODE_REQUIRED";

    throw error;
  }

  // ==============================================
  // NORMALIZE
  // ==============================================

  const normalizedCode = code.trim().toUpperCase();

  // ==============================================
  // HASH
  // ==============================================

  const codeHash = hashReferralCode(normalizedCode);

  // ==============================================
  // FIND
  // ==============================================

  const referral = await ReferralCode.findOne({
    codeHash,
  })
    .select("_id owner status usedCount maxUses expiresAt")
    .lean();

  // ==============================================
  // NOT FOUND
  // ==============================================

  if (!referral) {
    const error = new Error("Invalid referral code.");

    error.code = "INVALID_REFERRAL_CODE";

    throw error;
  }

  // ==============================================
  // REVOKED
  // ==============================================

  if (referral.status === "revoked") {
    const error = new Error("Referral code has been revoked.");

    error.code = "REFERRAL_CODE_REVOKED";

    throw error;
  }

  // ==============================================
  // EXHAUSTED
  // ==============================================

  if (referral.usedCount >= referral.maxUses) {
    const error = new Error("Referral code has reached its usage limit.");

    error.code = "REFERRAL_CODE_EXHAUSTED";

    throw error;
  }

  // ==============================================
  // STATUS
  // ==============================================

  if (referral.status !== "active") {
    const error = new Error("Referral code is not active.");

    error.code = "REFERRAL_CODE_NOT_ACTIVE";

    throw error;
  }

  // ==============================================
  // EXPIRATION
  // ==============================================

  if (referral.expiresAt && referral.expiresAt <= new Date()) {
    const error = new Error("Referral code has expired.");

    error.code = "REFERRAL_CODE_EXPIRED";

    throw error;
  }

  // ==============================================
  // SUCCESS
  // ==============================================

  return {
    valid: true,

    referral,
  };
};

// ==================================================
// CONSUME REFERRAL CODE
// ==================================================

export const consumeReferralCode = async ({ referralId, userId, session }) => {
  // ==============================================
  // FIND REFERRAL
  // ==============================================

  const referralQuery = ReferralCode.findOne({
    _id: referralId,

    status: "active",

    $expr: {
      $lt: ["$usedCount", "$maxUses"],
    },
  });

  if (session) {
    referralQuery.session(session);
  }

  const referral = await referralQuery;

  // ==============================================
  // UNAVAILABLE
  // ==============================================

  if (!referral) {
    const error = new Error("Referral code is no longer available.");

    error.code = "REFERRAL_NO_LONGER_AVAILABLE";

    throw error;
  }

  // ==============================================
  // SELF REFERRAL
  // ==============================================

  if (referral.owner.toString() === userId.toString()) {
    const error = new Error("You cannot use your own referral code.");

    error.code = "SELF_REFERRAL_NOT_ALLOWED";

    throw error;
  }

  // ==============================================
  // CHECK EXPIRATION
  // ==============================================

  if (referral.expiresAt && referral.expiresAt <= new Date()) {
    const error = new Error("Referral code has expired.");

    error.code = "REFERRAL_CODE_EXPIRED";

    throw error;
  }

  // ==============================================
  // INCREMENT
  // ==============================================

  referral.usedCount += 1;

  // ==============================================
  // EXHAUST
  // ==============================================

  if (referral.usedCount >= referral.maxUses) {
    referral.status = "exhausted";
  }

  await referral.save({
    session,
  });

  // ==============================================
  // CREATE REDEMPTION
  // ==============================================

  await ReferralRedemption.create(
    [
      {
        referralId: referral._id,

        referrerId: referral.owner,

        referredUserId: userId,
      },
    ],
    {
      session,
    },
  );

  return referral;
};

// ==================================================
// REVOKE REFERRAL CODE
// ==================================================

export const revokeReferralCode = async (userId, referralId) => {
  const referral = await ReferralCode.findOne({
    _id: referralId,

    owner: userId,
  });

  // ==============================================
  // NOT FOUND
  // ==============================================

  if (!referral) {
    const error = new Error("Referral code not found.");

    error.code = "REFERRAL_NOT_FOUND";

    throw error;
  }

  // ==============================================
  // ALREADY REVOKED
  // ==============================================

  if (referral.status === "revoked") {
    const error = new Error("Referral code is already revoked.");

    error.code = "REFERRAL_ALREADY_REVOKED";

    throw error;
  }

  // ==============================================
  // EXHAUSTED
  // ==============================================

  if (referral.status === "exhausted") {
    const error = new Error(
      "Referral code has already reached its usage limit.",
    );

    error.code = "REFERRAL_ALREADY_EXHAUSTED";

    throw error;
  }

  // ==============================================
  // REVOKE
  // ==============================================

  referral.status = "revoked";

  await referral.save();

  // ==============================================
  // RETURN
  // ==============================================

  return {
    success: true,

    data: {
      id: referral._id,

      codePreview: referral.codePreview,

      usedCount: referral.usedCount,

      maxUses: referral.maxUses,

      remaining: referral.maxUses - referral.usedCount,

      status: referral.status,

      updatedAt: referral.updatedAt,
    },
  };
};
