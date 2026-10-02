import {
  getUserReferralCodes,
  revokeReferralCode,
  validateReferralCode,
} from "../services/referral.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ==================================================
// VALIDATE REFERRAL
// ==================================================

export const validateReferral = asyncHandler(async (req, res, next) => {
  try {
    const { referralCode } = req.body;

    const result = await validateReferralCode(referralCode);

    return res.status(200).json({
      success: true,

      data: {
        valid: result.valid,

        referral: {
          id: result.referral._id,

          usedCount: result.referral.usedCount,

          maxUses: result.referral.maxUses,

          remaining: result.referral.maxUses - result.referral.usedCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});
// ==================================================
// GET MY REFERRAL CODE
// ==================================================

export const getReferrals = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await getUserReferralCodes(userId);

    return res.status(200).json({
      success: true,

      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

// ==================================================
// REVOKE REFERRAL
// ==================================================

export const revokeReferral = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { id: referralId } = req.params;

    const result = await revokeReferralCode(userId, referralId);

    return res.status(200).json({
      success: true,

      message: "Referral code revoked successfully.",

      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});
