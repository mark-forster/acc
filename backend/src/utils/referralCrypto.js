import crypto from "crypto";

// ==================================================
// CONFIG
// ==================================================

const ALGORITHM = "aes-256-gcm";

const IV_LENGTH = 12;

const KEY_LENGTH = 32;

// ==================================================
// GET ENCRYPTION KEY
// ==================================================

const getEncryptionKey = () => {
  const secret = process.env.REFERRAL_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error("REFERRAL_ENCRYPTION_KEY is not configured.");
  }

  const key = Buffer.from(secret, "hex");

  if (key.length !== KEY_LENGTH) {
    throw new Error("REFERRAL_ENCRYPTION_KEY must be exactly 32 bytes.");
  }

  return key;
};

// ==================================================
// ENCRYPT REFERRAL CODE
// ==================================================

export const encryptReferralCode = (plainText) => {
  const key = getEncryptionKey();

  // Random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  // Authentication tag
  const authTag = cipher.getAuthTag();

  // Store as:
  //
  // iv:authTag:cipherText
  //
  return [
    iv.toString("hex"),

    authTag.toString("hex"),

    encrypted.toString("hex"),
  ].join(":");
};

// ==================================================
// DECRYPT REFERRAL CODE
// ==================================================

export const decryptReferralCode = (encryptedText) => {
  const key = getEncryptionKey();

  const parts = encryptedText.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted referral code.");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex, "hex");

  const authTag = Buffer.from(authTagHex, "hex");

  const encrypted = Buffer.from(encryptedHex, "hex");

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  // Set authentication tag
  decipher.setAuthTag(authTag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
