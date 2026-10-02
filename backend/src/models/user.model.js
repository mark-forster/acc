import mongoose from "mongoose";

const { Schema } = mongoose;

// ==================================================
// USER SCHEMA
// ==================================================

const userSchema = new Schema(
  {
    // ==================================================
    // CLERK IDENTITY
    // ==================================================

    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ==================================================
    // BASIC PROFILE
    // ==================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      maxlength: 320,
    },

    // ==================================================
    // APPLICATION ROLE
    // ==================================================

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
      required: true,
    },

    // ==================================================
    // ACCOUNT STATUS
    // ==================================================

    isActive: {
      type: Boolean,
      default: true,
      // index: true,
    },

    // ==================================================
    // REFERRAL
    // ==================================================

    // User who referred this user
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // index: true,
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

userSchema.index({
  role: 1,
  isActive: 1,
});

userSchema.index({
  referredBy: 1,
});

// ==================================================
// MODEL
// ==================================================

const User = mongoose.model("User", userSchema);

export default User;
