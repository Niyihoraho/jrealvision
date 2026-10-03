import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendArtistApplicationConfirmationEmail,
  sendAdminArtistApplicationNotificationEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const {
      name,
      email,
      phone,
      city = "Kigali",
      medium,
      bio,
      portfolioUrl,
      sampleArtworkUrl,
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Artist name is required" });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({ error: "Phone / WhatsApp number is required" });
    }

    if (!medium || typeof medium !== "string" || !medium.trim()) {
      return res.status(400).json({ error: "Primary artistic medium is required" });
    }

    if (!bio || typeof bio !== "string" || !bio.trim()) {
      return res.status(400).json({ error: "Artist statement or bio is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanCity = city.trim();
    const cleanMedium = medium.trim();
    const cleanBio = bio.trim();
    const cleanPortfolio = portfolioUrl ? String(portfolioUrl).trim() : undefined;
    const cleanSample = sampleArtworkUrl ? String(sampleArtworkUrl).trim() : undefined;

    const applicationId = `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const appliedAt = new Date().toISOString();

    // Attempt to persist in Database if Prisma is available
    let dbSuccess = false;
    try {
      if (prisma && prisma.user && prisma.artist) {
        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
              passwordHash: "unverified_applicant_pending",
              role: "CUSTOMER", // NOT ARTIST until approved by admin!
            },
          });
        }

        // Upsert artist record with PENDING status
        await prisma.artist.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            statement: cleanBio,
            city: cleanCity,
            payoutMethod: "MTN MoMo",
            payoutNumber: cleanPhone,
            payoutAccountName: cleanName.toUpperCase(),
            status: "PENDING", // STRICT: Portal blocked until admin approval
            portfolio: cleanPortfolio || null,
          },
          update: {
            statement: cleanBio,
            city: cleanCity,
            portfolio: cleanPortfolio || null,
            status: "PENDING",
          },
        });
        dbSuccess = true;
      }
    } catch (dbErr) {
      console.warn("[apply.ts] Prisma persist note (falling back to storage mode):", dbErr);
    }

    // 1. Send confirmation email to applicant (acknowledgement & informing them access is pending curatorial review)
    let applicantEmailSent = false;
    try {
      const emailRes = await sendArtistApplicationConfirmationEmail({
        to: cleanEmail,
        name: cleanName,
        medium: cleanMedium,
        city: cleanCity,
      });
      applicantEmailSent = emailRes.success;
    } catch (e) {
      console.error("[apply.ts] Error dispatching artist confirmation email:", e);
    }

    // 2. Send notification email to the Platform Owner / Admin with applicant details
    let adminEmailSent = false;
    try {
      const adminRes = await sendAdminArtistApplicationNotificationEmail({
        artistName: cleanName,
        artistEmail: cleanEmail,
        artistPhone: cleanPhone,
        city: cleanCity,
        medium: cleanMedium,
        portfolioUrl: cleanPortfolio,
        bio: cleanBio,
      });
      adminEmailSent = adminRes.success;
    } catch (e) {
      console.error("[apply.ts] Error dispatching admin notification email:", e);
    }

    const applicationRecord = {
      id: applicationId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      city: cleanCity,
      medium: cleanMedium,
      bio: cleanBio,
      portfolioUrl: cleanPortfolio,
      sampleArtworkUrl: cleanSample,
      status: "PENDING" as const,
      appliedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully. Awaiting curatorial board review.",
      application: applicationRecord,
      applicantEmailSent,
      adminEmailSent,
      persistedInDb: dbSuccess,
    });
  } catch (error: any) {
    console.error("[/api/artists/apply] Unexpected error:", error);
    return res.status(500).json({
      error: "An unexpected error occurred while processing your application. Please try again.",
      details: error?.message,
    });
  }
}
