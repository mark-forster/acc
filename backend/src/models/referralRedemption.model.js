import mongoose from "mongoose";

// ==================================================
// REFERRAL REDEMPTION SCHEMA
// ==================================================

const referralRedemptionSchema = new mongoose.Schema(
  {
    // ==============================================
    // REFERRAL CODE
    // ==============================================

    referralId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "ReferralCode",

      required: true,

      index: true,
    },

    // ==============================================
    // REFERRER
    // ==============================================

    referrerId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },

    // ==============================================
    // REFERRED USER
    // ==============================================

    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },
  },

  {
    timestamps: true,

    strict: true,
  },
);

// ==================================================
// UNIQUE REDEMPTION
// ==================================================

referralRedemptionSchema.index(
  {
    referralId: 1,

    referredUserId: 1,
  },
  {
    unique: true,
  },
);

// ==================================================
// MODEL
// ==================================================

const ReferralRedemption = mongoose.model(
  "ReferralRedemption",
  referralRedemptionSchema,
);

export default ReferralRedemption;
