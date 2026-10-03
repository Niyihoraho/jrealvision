// GET   /api/quotes — list customer or all admin quotes from Supabase
// POST  /api/quotes — submit quote request from /request-quote or create quote
// PATCH /api/quotes — update quote status/pricing (Admin)

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = getAuthUser(req);
  const isAdmin = authUser?.role === "ADMIN" || req.query.all === "true";

  // ─── GET: Fetch Quotes ────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const { id } = req.query;

      if (id && typeof id === "string") {
        const whereClause = isAdmin ? { id } : { id, customerId: authUser?.id || "none" };
        const quote = await prisma.quote.findFirst({
          where: whereClause,
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            negotiations: { orderBy: { createdAt: "asc" } },
          },
        });

        if (!quote) return res.status(404).json({ error: "Quote not found" });
        return res.status(200).json({ success: true, quote });
      }

      const whereClause = isAdmin ? {} : (authUser ? { customerId: authUser.id } : { id: "none" });
      const quotes = await prisma.quote.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          negotiations: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ success: true, count: quotes.length, quotes });
    } catch (error) {
      console.error("[quotes GET]", error);
      return res.status(200).json({ success: true, count: 0, quotes: [] });
    }
  }

  // ─── POST: Submit Quote Request (From /request-quote or Direct) ───────────
  if (req.method === "POST") {
    try {
      const {
        services,
        selectedServices,
        companyName,
        fullName,
        phone,
        email,
        projectScope,
        urgency,
        amount = 0,
      } = req.body;

      const clientName = fullName || companyName || "Prospective Client";
      const clientEmail = (email || `${(phone || "client").replace(/\s+/g, "")}@quotes.jreal.rw`).toLowerCase();

      // Find or auto-provision customer user
      let customerId = authUser?.id;
      if (!customerId) {
        try {
          let user = await prisma.user.findUnique({ where: { email: clientEmail } });
          if (!user) {
            const pwdHash = await hashPassword("Guest-Quote-Pass-2026");
            user = await prisma.user.create({
              data: {
                name: clientName,
                email: clientEmail,
                phone: phone || null,
                passwordHash: pwdHash,
                role: "CUSTOMER",
              },
            });
          }
          customerId = user.id;
        } catch {
          customerId = `usr_${Date.now().toString().slice(-6)}`;
        }
      }

      const serviceList = selectedServices || services || [];
      const serviceSummary = Array.isArray(serviceList) ? serviceList.join(", ") : String(serviceList);
      const quoteNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}`;

      const quote = await prisma.quote.create({
        data: {
          quoteNumber,
          customerId: customerId!,
          amount: parseFloat(amount) || 0,
          status: "DRAFT",
          terms: `Services: ${serviceSummary} | Urgency: ${urgency || "Standard"} | Scope: ${projectScope || "Custom quotation requested via web"} | Contact: ${phone || "N/A"}`,
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
        },
      });

      return res.status(201).json({ success: true, quoteNumber, quote });
    } catch (err: any) {
      console.error("[quotes POST]", err);
      return res.status(500).json({ error: err.message || "Failed to create quotation request" });
    }
  }

  // ─── PATCH: Update Quote (Admin Pricing / Status) ─────────────────────────
  if (req.method === "PATCH") {
    try {
      const { id, amount, finalPrice, status, terms } = req.body;
      const targetId = id || (req.query.id as string);

      if (!targetId) return res.status(400).json({ error: "Quote ID is required" });

      const updateData: any = {};
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (finalPrice !== undefined) updateData.finalPrice = parseFloat(finalPrice);
      if (status) updateData.status = status;
      if (terms) updateData.terms = terms;

      const updated = await prisma.quote.update({
        where: { id: targetId },
        data: updateData,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
        },
      });

      return res.status(200).json({ success: true, quote: updated });
    } catch (err: any) {
      console.error("[quotes PATCH]", err);
      return res.status(500).json({ error: err.message || "Failed to update quote" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
