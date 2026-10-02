import User from "../models/user.model.js";

// ==================================================
// CREATE APPLICATION USER
// ==================================================

export const createApplicationUser = async ({
  clerkId,
  firstName,
  lastName,
  email,
  referredBy = null,
}) => {
  const user = await User.create({
    clerkId,

    firstName,

    lastName,

    email,

    role: "student",

    isActive: true,

    referredBy,

    referralCodeCount: 0,
  });

  return user;
};

// ==================================================
// FIND USER BY EMAIL
// ==================================================

export const findUserByEmail = async (email) => {
  return User.findOne({
    email: email.trim().toLowerCase(),
  });
};

// ==================================================
// FIND USER BY CLERK ID
// ==================================================

export const findUserByClerkId = async (clerkId) => {
  return User.findOne({
    clerkId,
  });
};
