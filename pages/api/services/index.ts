// GET    /api/services — list all services from Supabase
// POST   /api/services — create new service in Supabase
// PUT    /api/services — update service in Supabase
// DELETE /api/services — delete service from Supabase

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { category } = req.query;
      const where: any = { active: true };
      if (category && typeof category === "string") {
        where.category = { equals: category, mode: "insensitive" };
      }

      const services = await prisma.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ success: true, count: services.length, services });
    } catch (err: any) {
      console.error("[services GET]", err);
      return res.status(500).json({ error: "Failed to fetch services" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, category, description, basePrice } = req.body;
      if (!name || !category) {
        return res.status(400).json({ error: "Service name and category are required" });
      }

      const newService = await prisma.service.create({
        data: {
          name,
          category: category.toLowerCase(),
          description: description || null,
          basePrice: basePrice ? parseFloat(basePrice) : null,
          active: true,
        },
      });

      return res.status(201).json({ success: true, service: newService });
    } catch (err: any) {
      console.error("[services POST]", err);
      return res.status(500).json({ error: err.message || "Failed to create service" });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const { id, name, category, description, basePrice, active } = req.body;
      const targetId = id || (req.query.id as string);

      if (!targetId) return res.status(400).json({ error: "Service ID is required" });

      const updateData: any = {};
      if (name) updateData.name = name;
      if (category) updateData.category = category.toLowerCase();
      if (description !== undefined) updateData.description = description;
      if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
      if (active !== undefined) updateData.active = Boolean(active);

      const updated = await prisma.service.update({
        where: { id: targetId },
        data: updateData,
      });

      return res.status(200).json({ success: true, service: updated });
    } catch (err: any) {
      console.error("[services PUT]", err);
      return res.status(500).json({ error: err.message || "Failed to update service" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const targetId = (req.query.id as string) || req.body?.id;
      if (!targetId) return res.status(400).json({ error: "Service ID is required" });

      await prisma.service.delete({ where: { id: targetId } });
      return res.status(200).json({ success: true, message: "Service deleted successfully" });
    } catch (err: any) {
      console.error("[services DELETE]", err);
      return res.status(500).json({ error: err.message || "Failed to delete service" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
