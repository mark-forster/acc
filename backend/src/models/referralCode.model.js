import mongoose from "mongoose";

// ==================================================
// REFERRAL CODE SCHEMA
// ==================================================

const referralCodeSchema = new mongoose.Schema(
  {
    // ==============================================
    // OWNER
    // ==============================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,

      unique: true,
    },

    // ==============================================
    // HASHED CODE
    // ==============================================

    codeHash: {
      type: String,

      required: true,

      unique: true,

      index: true,

      trim: true,
    },

    // ==============================================
    // ENCRYPTED FULL CODE
    // ==============================================

    encryptedCode: {
      type: String,

      required: true,

      select: false,

      trim: true,
    },

    // ==============================================
    // SAFE PREVIEW
    // ==============================================

    codePreview: {
      type: String,

      required: true,

      trim: true,
    },

    // ==============================================
    // USED COUNT
    // ==============================================

    usedCount: {
      type: Number,

      default: 0,

      min: 0,
    },

    // ==============================================
    // MAXIMUM USES
    // ==============================================

    maxUses: {
      type: Number,

      default: 10,

      min: 1,
    },

    // ==============================================
    // STATUS
    // ==============================================

    status: {
      type: String,

      enum: ["active", "exhausted", "revoked"],

      default: "active",

      index: true,
    },

    // ==============================================
    // EXPIRATION
    // ==============================================

    expiresAt: {
      type: Date,

      default: null,
    },
  },

  {
    timestamps: true,

    strict: true,
  },
);

// ==================================================
// INDEXES
// ==================================================

referralCodeSchema.index({
  owner: 1,

  status: 1,
});

// ==================================================
// MODEL
// ==================================================

const ReferralCode = mongoose.model("ReferralCode", referralCodeSchema);

export default ReferralCode;
