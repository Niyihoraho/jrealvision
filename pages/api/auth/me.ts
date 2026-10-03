// GET  /api/auth/me      — returns the current authenticated user (NextAuth session or JWT)
// POST /api/auth/logout  — clears auth cookies

import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser, getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Logout: clear cookies
    res.setHeader("Set-Cookie", [
      "jreal_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
      "next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      "__Secure-next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0",
    ]);
    return res.status(200).json({ success: true });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authUser = (await getSessionUser(req, res)) || getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Return fresh user data from DB if id exists
    if (authUser.id && !authUser.id.startsWith("usr_")) {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (user) {
        return res.status(200).json({ user });
      }
    }

    return res.status(200).json({
      user: {
        id: authUser.id,
        name: authUser.name || authUser.email.split("@")[0].toUpperCase(),
        email: authUser.email,
        role: authUser.role,
        phone: authUser.phone || null,
      },
    });
  } catch (error) {
    console.error("[me]", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
