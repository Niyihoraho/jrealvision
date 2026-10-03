// JREAL VISION DESIGN — In-Memory OTP Store
// Stores pending email confirmation codes and registration data securely

export interface PendingRegistration {
  code: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role?: string;
  expiresAt: number;
  attempts: number;
}

// Global store to persist across API route re-evaluations in Next.js dev
const globalForOtp = globalThis as unknown as {
  __jreal_otp_store?: Map<string, PendingRegistration>;
};

if (!globalForOtp.__jreal_otp_store) {
  globalForOtp.__jreal_otp_store = new Map<string, PendingRegistration>();
}

const store = globalForOtp.__jreal_otp_store;

// Helper to generate a cryptographically strong 6-digit confirmation code
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save or update pending registration with 10-minute expiry
export function savePendingRegistration(data: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role?: string;
  code: string;
}): PendingRegistration {
  const cleanEmail = data.email.trim().toLowerCase();
  const entry: PendingRegistration = {
    code: data.code,
    name: data.name,
    email: cleanEmail,
    passwordHash: data.passwordHash,
    phone: data.phone,
    role: data.role || "CUSTOMER",
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  };

  store.set(cleanEmail, entry);
  return entry;
}

// Retrieve pending registration by email
export function getPendingRegistration(email: string): PendingRegistration | null {
  const cleanEmail = email.trim().toLowerCase();
  const entry = store.get(cleanEmail);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(cleanEmail);
    return null;
  }

  return entry;
}

// Verify code: returns user data on success, throws error on mismatch or expiry
export function verifyConfirmationCode(
  email: string,
  inputCode: string
): { valid: boolean; error?: string; registration?: PendingRegistration } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = inputCode.trim();
  const entry = store.get(cleanEmail);

  if (!entry) {
    return {
      valid: false,
      error: "Verification code expired or not found. Please request a new code.",
    };
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(cleanEmail);
    return {
      valid: false,
      error: "Verification code has expired. Please click Resend Code.",
    };
  }

  if (entry.attempts >= 5) {
    store.delete(cleanEmail);
    return {
      valid: false,
      error: "Too many failed attempts. Please request a new code.",
    };
  }

  if (entry.code !== cleanCode) {
    entry.attempts += 1;
    store.set(cleanEmail, entry);
    const remaining = 5 - entry.attempts;
    return {
      valid: false,
      error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Code is valid! Remove from store to prevent replay
  store.delete(cleanEmail);

  return {
    valid: true,
    registration: entry,
  };
}

// Clean up expired registrations periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.expiresAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);
