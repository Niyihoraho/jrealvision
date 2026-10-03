// POST /api/auth/send-code
// Generates and emails a 6-digit confirmation code for account registration

import type { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, savePendingRegistration } from "@/lib/otpStore";
import { sendVerificationEmail } from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password, phone, role } = req.body;

    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists in DB
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "An account with this email already exists. Please sign in instead.",
        });
      }
    } catch {
      // If DB has a temporary glitch, continue with registration
    }

    // Hash the password for secure storage in the pending store
    const passwordHash = await hashPassword(password);

    // Generate 6-digit verification code
    const code = generateOtpCode();

    // Store in pending registration store
    savePendingRegistration({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      phone: cleanPhone || undefined,
      role: role || "CUSTOMER",
      code,
    });

    // Send the confirmation email
    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      name: cleanName,
      code,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        error: `Failed to deliver email to ${cleanEmail}: ${emailResult.error || "Please check the email address and try again."}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit confirmation code was sent to ${cleanEmail}`,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error("[send-code]", error);
    return res.status(500).json({ error: "Failed to send confirmation code. Please try again." });
  }
}
