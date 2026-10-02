import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import { clerkClient } from "../config/clerk.js";

import User from "../models/user.model.js";

import {
  createReferralCode,
} from "../services/referral.service.js";

// ==================================================
// TEST USER CONFIGURATION
// ==================================================

const TEST_USER = {
  firstName: "Brett",

  lastName: "Admin",

  username: "brettjonas",

  email: "brettjonas2@gmail.com",

  password: "Qv7!mR2#xL9@pK4$zN8",
};

// ==================================================
// CREATE TEST USER
// ==================================================

const createTestUser = async () => {
  let clerkUser = null;

  try {
    // ------------------------------------------------
    // CONNECT DATABASE
    // ------------------------------------------------

    await connectDB();

    console.log(
      "Database connected."
    );

    // ------------------------------------------------
    // CHECK MONGODB USER
    // ------------------------------------------------

    const existingUser =
      await User.findOne({
        email: TEST_USER.email,
      });

    if (existingUser) {
      console.log(
        "MongoDB test user already exists."
      );

      // ----------------------------------------------
      // CHECK REFERRAL CODE
      // ----------------------------------------------

      const referralResult =
        await createReferralCode(
          existingUser._id
        );

      console.log(
        "Referral code:",
        referralResult.data
      );

      return;
    }

    // ------------------------------------------------
    // CHECK CLERK USER
    // ------------------------------------------------

    try {
      clerkUser =
        await clerkClient.users.createUser({
          emailAddress: [
            TEST_USER.email,
          ],

          username:
            TEST_USER.username,

          firstName:
            TEST_USER.firstName,

          lastName:
            TEST_USER.lastName,

          password:
            TEST_USER.password,
        });

      console.log(
        "Clerk test user created."
      );

      console.log(
        "Clerk User ID:",
        clerkUser.id
      );
    } catch (error) {
      console.error(
        "Failed to create Clerk user:",
        error
      );

      return;
    }

    // ------------------------------------------------
    // CREATE MONGODB USER
    // ------------------------------------------------

    let user;

    try {
      user =
        await User.create({
          clerkId:
            clerkUser.id,

          firstName:
            TEST_USER.firstName,

          lastName:
            TEST_USER.lastName,

          username:
            TEST_USER.username,

          email:
            TEST_USER.email,
        });

      console.log(
        "MongoDB test user created."
      );

      console.log(
        "MongoDB User ID:",
        user._id
      );
    } catch (error) {
      // ----------------------------------------------
      // ROLLBACK CLERK USER
      // ----------------------------------------------

      console.error(
        "Failed to create MongoDB user:",
        error
      );

      if (clerkUser) {
        try {
          await clerkClient.users.deleteUser(
            clerkUser.id
          );

          console.log(
            "Clerk user rollback completed."
          );
        } catch (
          rollbackError
        ) {
          console.error(
            "Failed to rollback Clerk user:",
            rollbackError
          );
        }
      }

      return;
    }

    // ------------------------------------------------
    // CREATE REFERRAL CODE
    // ------------------------------------------------

    const referralResult =
      await createReferralCode(
        user._id
      );

    console.log(
      "Referral code created."
    );

    console.log(
      "Referral code:",
      referralResult.data.code
    );

    console.log(
      "Referral code preview:",
      referralResult.data.codePreview
    );

    console.log(
      "Referral usage:",
      `${referralResult.data.usedCount}/${referralResult.data.maxUses}`
    );

    // ------------------------------------------------
    // COMPLETE
    // ------------------------------------------------

    console.log(
      "Test user creation completed successfully."
    );
  } catch (error) {
    console.error(
      "Create test user error:",
      error
    );
  } finally {
    // ------------------------------------------------
    // DISCONNECT DATABASE
    // ------------------------------------------------

    await mongoose.connection.close();

    console.log(
      "Database connection closed."
    );
  }
};

// ==================================================
// RUN SCRIPT
// ==================================================

createTestUser();