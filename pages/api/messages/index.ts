// GET  /api/messages — get messages for a project
// POST /api/messages — post a message for a project

import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default requireAuth(async (req, res, user) => {
  if (req.method === "GET") {
    try {
      const { projectId } = req.query;

      if (!projectId || typeof projectId !== "string") {
        return res.status(400).json({ error: "projectId is required" });
      }

      // Check project ownership
      const project = await prisma.project.findFirst({
        where: { id: projectId, customerId: user.id },
      });

      if (!project && user.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await prisma.message.findMany({
        where: { projectId },
        include: {
          sender: { select: { id: true, name: true, role: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      return res.status(200).json({ messages });
    } catch (error) {
      console.error("[messages GET]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { projectId, message } = req.body;

      if (!projectId || !message?.trim()) {
        return res.status(400).json({ error: "projectId and message are required" });
      }

      const project = await prisma.project.findFirst({
        where: { id: projectId, customerId: user.id },
      });

      if (!project && user.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied" });
      }

      const newMsg = await prisma.message.create({
        data: {
          projectId,
          senderId: user.id,
          message: message.trim(),
        },
        include: {
          sender: { select: { id: true, name: true, role: true, avatar: true } },
        },
      });

      return res.status(201).json({ message: newMsg });
    } catch (error) {
      console.error("[messages POST]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
