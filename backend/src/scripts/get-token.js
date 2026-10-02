import mongoose from "mongoose";

import { connectDB } from "../config/db.js";

import { clerkClient } from "../config/clerk.js";

import User from "../models/user.model.js";

// ==================================================
// TEST USER EMAIL
// ==================================================

const TEST_USER_EMAIL =
  "brettjonas2@gmail.com";

// ==================================================
// CREATE SESSION TOKEN
// ==================================================

const createSessionToken = async () => {
  try {
    console.log(
      "=========================================="
    );

    console.log(
      "Creating Clerk test session..."
    );

    console.log(
      "=========================================="
    );

    // ==================================================
    // CONNECT MONGODB
    // ==================================================

    await connectDB();

    console.log(
      "MongoDB connected."
    );

    // ==================================================
    // FIND MONGODB USER
    // ==================================================

    const mongoUser =
      await User.findOne({
        email:
          TEST_USER_EMAIL.toLowerCase(),
      });

    if (!mongoUser) {
      throw new Error(
        "MongoDB test user not found."
      );
    }

    console.log(
      "MongoDB User found:"
    );

    console.log(
      mongoUser._id.toString()
    );

    // ==================================================
    // GET CLERK USER ID
    // ==================================================

    const clerkUserId =
      mongoUser.clerkId;

    if (!clerkUserId) {
      throw new Error(
        "MongoDB user does not have a Clerk ID."
      );
    }

    console.log(
      "Clerk User ID:",
      clerkUserId
    );

    // ==================================================
    // FIND EXISTING ACTIVE SESSION
    // ==================================================

    console.log(
      "Checking existing Clerk sessions..."
    );

    const sessions =
      await clerkClient.sessions.getSessionList(
        {
          userId:
            clerkUserId,

          status: "active",
        }
      );

    let session = null;

    if (
      sessions.data &&
      sessions.data.length > 0
    ) {
      session =
        sessions.data[0];

      console.log(
        "Existing active session found."
      );
    }

    // ==================================================
    // CREATE NEW SESSION
    // ==================================================

    if (!session) {
      console.log(
        "Creating new Clerk session..."
      );

      session =
        await clerkClient.sessions.createSession(
          {
            userId:
              clerkUserId,
          }
        );

      console.log(
        "Clerk session created."
      );
    }

    // ==================================================
    // SESSION ID
    // ==================================================

    console.log(
      "Session ID:"
    );

    console.log(
      session.id
    );

    // ==================================================
    // GET SESSION TOKEN
    // ==================================================

    console.log(
      "Generating session token..."
    );

    const tokenResponse =
      await clerkClient.sessions.getToken(
        session.id
      );

    const sessionToken =
      tokenResponse.jwt;

    // ==================================================
    // CHECK TOKEN
    // ==================================================

    if (!sessionToken) {
      throw new Error(
        "Unable to generate session token."
      );
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "=========================================="
    );

    console.log(
      "SESSION TOKEN CREATED SUCCESSFULLY"
    );

    console.log(
      "=========================================="
    );

    console.log(
      "User ID:"
    );

    console.log(
      clerkUserId
    );

    console.log(
      "Session ID:"
    );

    console.log(
      session.id
    );

    console.log(
      ""
    );

    console.log(
      "SESSION TOKEN:"
    );

    console.log(
      sessionToken
    );

    console.log(
      ""
    );

    console.log(
      "=========================================="
    );

    console.log(
      "POSTMAN REQUEST"
    );

    console.log(
      "=========================================="
    );

    console.log(
      "POST http://localhost:5000/api/v1/referrals"
    );

    console.log(
      ""
    );

    console.log(
      "Authorization:"
    );

    console.log(
      `Bearer ${sessionToken}`
    );

    console.log(
      "=========================================="
    );

  } catch (error) {
    console.error(
      "=========================================="
    );

    console.error(
      "FAILED TO CREATE SESSION TOKEN"
    );

    console.error(
      "=========================================="
    );

    console.error(error);
  } finally {
    // ==================================================
    // CLOSE MONGODB
    // ==================================================

    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed."
    );
  }
};

// ==================================================
// RUN
// ==================================================

createSessionToken();