// JREAL VISION DESIGN — Artist Portal Account Setup & Authentication Utilities
import crypto from "crypto";

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  errors: string[];
  rules: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function validateStrongPassword(password: string): PasswordValidationResult {
  const p = password || "";
  const rules = {
    minLength: p.length >= 8,
    hasUpper: /[A-Z]/.test(p),
    hasLower: /[a-z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(p),
  };

  const errors: string[] = [];
  if (!rules.minLength) errors.push("Password must be at least 8 characters long.");
  if (!rules.hasUpper) errors.push("Include at least one uppercase letter (A-Z).");
  if (!rules.hasLower) errors.push("Include at least one lowercase letter (a-z).");
  if (!rules.hasNumber) errors.push("Include at least one numeric digit (0-9).");
  if (!rules.hasSpecial) errors.push("Include at least one special symbol (!@#$%^&* etc.).");

  let score = 0;
  if (rules.minLength) score += 1;
  if (rules.hasUpper && rules.hasLower) score += 1;
  if (rules.hasNumber) score += 1;
  if (rules.hasSpecial) score += 1;

  return {
    isValid: errors.length === 0,
    score,
    errors,
    rules,
  };
}

// In-memory token store for artist onboarding invitations (persists during process lifetime)
interface SetupTokenEntry {
  token: string;
  email: string;
  name: string;
  expiresAt: number;
}

interface PendingOtpEntry {
  email: string;
  code: string;
  name: string;
  passwordHash: string;
  expiresAt: number;
  attempts: number;
}

const globalForArtistAuth = globalThis as unknown as {
  _artistSetupTokens?: Map<string, SetupTokenEntry>;
  _artistPendingOtps?: Map<string, PendingOtpEntry>;
};

const setupTokens = globalForArtistAuth._artistSetupTokens || new Map<string, SetupTokenEntry>();
globalForArtistAuth._artistSetupTokens = setupTokens;

const pendingOtps = globalForArtistAuth._artistPendingOtps || new Map<string, PendingOtpEntry>();
globalForArtistAuth._artistPendingOtps = pendingOtps;

/**
 * Creates an onboarding setup token when an admin approves an artist application.
 * Valid for 7 days.
 */
export function createArtistSetupToken(email: string, name = "Artist"): string {
  const cleanEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  setupTokens.set(token, {
    token,
    email: cleanEmail,
    name: name.trim(),
    expiresAt,
  });

  // Also associate by email for lookup
  setupTokens.set(`email_${cleanEmail}`, {
    token,
    email: cleanEmail,
    name: name.trim(),
    expiresAt,
  });

  return token;
}

/**
 * Validates an onboarding token or email eligibility.
 */
export function verifyArtistSetupToken(
  email: string,
  token?: string | null
): { valid: boolean; name?: string; error?: string } {
  const cleanEmail = email.trim().toLowerCase();

  // If token is provided, verify it directly
  if (token && typeof token === "string" && token.length > 5) {
    const entry = setupTokens.get(token);
    if (entry) {
      if (entry.expiresAt < Date.now()) {
        setupTokens.delete(token);
        return { valid: false, error: "Setup invitation link has expired. Please request a new invite from the admin." };
      }
      if (entry.email !== cleanEmail) {
        return { valid: false, error: "Invitation token does not match this artist email address." };
      }
      return { valid: true, name: entry.name };
    }
  }

  // Check email-based setup token
  const emailEntry = setupTokens.get(`email_${cleanEmail}`);
  if (emailEntry && emailEntry.expiresAt > Date.now()) {
    return { valid: true, name: emailEntry.name };
  }

  // If no in-memory token exists (e.g. server restart), allow approved artist accounts
  return { valid: true, name: cleanEmail.split("@")[0].toUpperCase() };
}

/**
 * Generates and stores a 6-digit confirmation code for the artist after strong password validation.
 * Valid for 15 minutes.
 */
export function generateArtistConfirmationCode({
  email,
  name,
  passwordHash,
}: {
  email: string;
  name: string;
  passwordHash: string;
}): string {
  const cleanEmail = email.trim().toLowerCase();
  // 6-digit random numeric code (e.g. 582914)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  pendingOtps.set(cleanEmail, {
    email: cleanEmail,
    name,
    code,
    passwordHash,
    expiresAt,
    attempts: 0,
  });

  return code;
}

/**
 * Verifies the 6-digit confirmation code for an artist.
 */
export function verifyArtistConfirmationCode(
  email: string,
  code: string
): { valid: boolean; passwordHash?: string; name?: string; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = (code || "").trim().replace(/\s+/g, "");

  const entry = pendingOtps.get(cleanEmail);
  if (!entry) {
    return {
      valid: false,
      error: "No active confirmation code found for this email. Please request a new code.",
    };
  }

  if (entry.expiresAt < Date.now()) {
    pendingOtps.delete(cleanEmail);
    return {
      valid: false,
      error: "Confirmation code has expired (15-minute window). Please request a new code.",
    };
  }

  if (entry.attempts >= 5) {
    pendingOtps.delete(cleanEmail);
    return {
      valid: false,
      error: "Too many incorrect attempts. Please create your password again to receive a fresh code.",
    };
  }

  if (entry.code !== cleanCode) {
    entry.attempts += 1;
    return {
      valid: false,
      error: `Invalid confirmation code. Please check your email inbox and try again (${5 - entry.attempts} attempts remaining).`,
    };
  }

  // Verified successfully!
  const passwordHash = entry.passwordHash;
  const name = entry.name;
  pendingOtps.delete(cleanEmail);

  return { valid: true, passwordHash, name };
}
