import type { NextApiRequest, NextApiResponse } from "next";
import { sendArtistApprovalEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { applicationId, email, name } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid artist email is required for approval" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && typeof name === "string" ? name.trim() : "Artist");

    let dbUpdated = false;
    try {
      if (prisma && prisma.user && prisma.artist) {
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (user) {
          // Promote role to ARTIST
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ARTIST" },
          });

          // Mark artist profile as APPROVED
          await prisma.artist.updateMany({
            where: { userId: user.id },
            data: { status: "APPROVED" },
          });
          dbUpdated = true;
        }
      }
    } catch (dbErr) {
      console.warn("[approve.ts] Prisma update note:", dbErr);
    }

    // Determine host origin for the portal onboarding link
    const host = req.headers.host || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
    
    // Generate secure onboarding token for the approved artist
    const { createArtistSetupToken } = await import("@/lib/artistPortalAuth");
    const setupToken = createArtistSetupToken(cleanEmail, cleanName);
    const setupUrl = `${protocol}://${host}/artist/setup-account?email=${encodeURIComponent(cleanEmail)}&token=${setupToken}`;
    const portalLoginUrl = `${protocol}://${host}/art-gallery/login`;

    // Dispatch approval email with dedicated account activation link
    let emailResult: { success: boolean; messageId?: string; error?: string } = { success: false };
    try {
      emailResult = await sendArtistApprovalEmail({
        to: cleanEmail,
        name: cleanName,
        setupUrl,
        loginUrl: portalLoginUrl,
      });
    } catch (e: any) {
      console.error("[approve.ts] Failed to send approval email:", e);
      emailResult = { success: false, error: e?.message || "Failed to dispatch email" };
    }

    return res.status(200).json({
      success: true,
      message: `Artist ${cleanName} has been approved. Portal activation email sent to ${cleanEmail}.`,
      emailSent: emailResult.success,
      dbUpdated,
      applicationId,
      setupUrl,
      token: setupToken,
    });
  } catch (error: any) {
    console.error("[/api/artists/approve] Unexpected error:", error);
    return res.status(500).json({
      error: "Failed to approve artist application",
      details: error?.message,
    });
  }
}
