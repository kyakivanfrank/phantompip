import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const ALGORITHM = "aes-256-gcm";

// Validate that encryption key is configured
function validateEncryptionKey(): void {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.trim() === "") {
    throw new Error(
      "ENCRYPTION_KEY environment variable is not set. This is required for password encryption."
    );
  }
}

// Derive a proper key from the environment variable
function getEncryptionKey(): Buffer {
  validateEncryptionKey();
  const key = Buffer.from(
    crypto
      .createHash("sha256")
      .update(String(ENCRYPTION_KEY))
      .digest()
  );
  return key;
}

export function encryptMt5Password(password: string): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    let encrypted = cipher.update(password, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  } catch (error) {
    throw new Error(
      `Failed to encrypt password: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function decryptMt5Password(
  encrypted: string,
  iv: string,
  authTag: string
): string {
  if (!encrypted || !iv || !authTag) {
    throw new Error("Encrypted password, IV, and auth tag are required");
  }

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(
      `Failed to decrypt password: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
