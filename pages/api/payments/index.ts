// GET  /api/payments — customer payments & invoices
// POST /api/payments — record payment for an order or quote/project

import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default requireAuth(async (req, res, user) => {
  if (req.method === "GET") {
    try {
      const { id } = req.query;

      if (id && typeof id === "string") {
        const payment = await prisma.payment.findFirst({
          where: { id, customerId: user.id },
          include: {
            order: {
              include: { items: { include: { product: true } } },
            },
            quote: {
              include: { project: true },
            },
          },
        });

        if (!payment) {
          return res.status(404).json({ error: "Payment record not found" });
        }

        return res.status(200).json({ payment });
      }

      const payments = await prisma.payment.findMany({
        where: { customerId: user.id },
        include: {
          order: { select: { orderNumber: true, total: true } },
          quote: { select: { quoteNumber: true, finalPrice: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ payments });
    } catch (error) {
      console.error("[payments GET]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { orderId, quoteId, amount, method } = req.body;

      if (!amount || amount <= 0 || !method) {
        return res.status(400).json({ error: "Valid amount and payment method are required" });
      }

      // Check if paying for Order or Quote
      let order = null;
      let quote = null;

      if (orderId) {
        order = await prisma.order.findFirst({
          where: { id: orderId, customerId: user.id },
        });
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
      }

      if (quoteId) {
        quote = await prisma.quote.findFirst({
          where: { id: quoteId, customerId: user.id },
        });
        if (!quote) {
          return res.status(404).json({ error: "Quote not found" });
        }
      }

      const payment = await prisma.payment.create({
        data: {
          customerId: user.id,
          orderId: orderId || null,
          quoteId: quoteId || null,
          amount: Number(amount),
          method,
          status: "PAID",
        },
      });

      // Update Order or Quote status upon payment
      if (order) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "ARTWORK_CHECK",
          },
        });
      }

      if (quote) {
        // If deposit paid, update quote and linked project to DEPOSIT_PAID
        if (quote.projectId) {
          await prisma.project.update({
            where: { id: quote.projectId },
            data: { status: "DEPOSIT_PAID" },
          });
        }
      }

      // Create notification for customer
      await prisma.notification.create({
        data: {
          customerId: user.id,
          title: "Payment Confirmed",
          message: `Payment of ${Number(amount).toLocaleString()} RWF via ${method} has been received and verified.`,
        },
      });

      return res.status(201).json({ payment, message: "Payment recorded successfully" });
    } catch (error) {
      console.error("[payments POST]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
