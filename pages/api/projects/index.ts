// GET /api/projects — customer's own projects list/detail
// POST /api/projects — create a new business/NGO project

import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateProjectNumber } from "@/lib/auth";

export default requireAuth(async (req, res, user) => {
  if (req.method === "GET") {
    try {
      const { id } = req.query;

      if (id && typeof id === "string") {
        const project = await prisma.project.findFirst({
          where: { id, customerId: user.id },
          include: {
            services: { include: { service: true } },
            quotes: {
              orderBy: { createdAt: "desc" },
              include: { negotiations: { orderBy: { createdAt: "desc" } } },
            },
            files: true,
            messages: {
              include: { sender: { select: { name: true, role: true, avatar: true } } },
              orderBy: { createdAt: "asc" },
            },
            payments: true,
          },
        });

        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        return res.status(200).json({ project });
      }

      const projects = await prisma.project.findMany({
        where: { customerId: user.id },
        include: {
          quotes: { select: { id: true, status: true, finalPrice: true, amount: true } },
          services: { include: { service: { select: { name: true, category: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ projects });
    } catch (error) {
      console.error("[projects GET]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, projectType, serviceIds } = req.body;

      if (!title || !projectType) {
        return res.status(400).json({ error: "Title and project type are required" });
      }

      const projectNumber = await generateProjectNumber();

      const project = await prisma.project.create({
        data: {
          projectNumber,
          customerId: user.id,
          title,
          description: description || null,
          projectType,
          status: "QUOTATION",
          ...(serviceIds?.length
            ? {
                services: {
                  create: serviceIds.map((serviceId: string) => ({ serviceId })),
                },
              }
            : {}),
        },
        include: {
          services: { include: { service: true } },
        },
      });

      return res.status(201).json({ project });
    } catch (error) {
      console.error("[projects POST]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
