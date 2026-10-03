// GET  /api/files — customer's files tied to projects and services
// POST /api/files — register or upload file record for a project/service

import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default requireAuth(async (req, res, user) => {
  if (req.method === "GET") {
    try {
      const { projectId } = req.query;

      const whereClause: any = { customerId: user.id };
      if (projectId && typeof projectId === "string") {
        whereClause.projectId = projectId;
      }

      const files = await prisma.file.findMany({
        where: whereClause,
        include: {
          project: { select: { title: true, projectNumber: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ files });
    } catch (error) {
      console.error("[files GET]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { filename, secureUrl, projectId, fileSize, fileType } = req.body;

      if (!filename || !secureUrl) {
        return res.status(400).json({ error: "Filename and URL are required" });
      }

      // Verify project ownership if project is specified
      if (projectId) {
        const project = await prisma.project.findFirst({
          where: { id: projectId, customerId: user.id },
        });
        if (!project) {
          return res.status(404).json({ error: "Project not found or not owned by you" });
        }
      }

      const file = await prisma.file.create({
        data: {
          customerId: user.id,
          projectId: projectId || null,
          filename,
          secureUrl,
          fileSize: fileSize || null,
          fileType: fileType || null,
        },
      });

      // Notification
      await prisma.notification.create({
        data: {
          customerId: user.id,
          title: "File Uploaded Successfully",
          message: `Your file "${filename}" was attached to your workspace.`,
        },
      });

      return res.status(201).json({ file, message: "File registered successfully" });
    } catch (error) {
      console.error("[files POST]", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
