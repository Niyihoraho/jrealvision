// POST /api/auth/resend-code
// Re-generates and re-sends a confirmation code for a pending registration

import type { NextApiRequest, NextApiResponse } from "next";
import { getPendingRegistration, savePendingRegistration, generateOtpCode } from "@/lib/otpStore";
import { sendVerificationEmail } from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email address is required" });
    }

    const pending = getPendingRegistration(cleanEmail);
    if (!pending) {
      return res.status(404).json({
        error: "No active registration request found for this email. Please re-enter your details.",
      });
    }

    // Generate fresh code
    const newCode = generateOtpCode();

    // Re-save with fresh 10-minute expiry
    savePendingRegistration({
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      phone: pending.phone,
      role: pending.role,
      code: newCode,
    });

    // Re-send verification email
    const emailResult = await sendVerificationEmail({
      to: pending.email,
      name: pending.name,
      code: newCode,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        error: `Could not send code to ${pending.email}: ${emailResult.error || "Please try again."}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `A fresh 6-digit code was sent to ${pending.email}`,
    });
  } catch (error: any) {
    console.error("[resend-code]", error);
    return res.status(500).json({ error: "Failed to resend confirmation code." });
  }
}
