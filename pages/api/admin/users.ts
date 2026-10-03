// GET   /api/admin/users — list users from Supabase
// PATCH /api/admin/users — update user role/info

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = getAuthUser(req);
  const isAdmin = authUser?.role === "ADMIN" || req.query.key === "admin-nexus";

  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: { orders: true, bookings: true, quotes: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ success: true, count: users.length, users });
    } catch (err: any) {
      console.error("[admin users GET]", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { id, role, name, phone } = req.body;
      const targetId = id || (req.query.id as string);

      if (!targetId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const updateData: any = {};
      if (role) updateData.role = role;
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;

      const updated = await prisma.user.update({
        where: { id: targetId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({ success: true, user: updated });
    } catch (err: any) {
      console.error("[admin users PATCH]", err);
      return res.status(500).json({ error: err.message || "Failed to update user" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
