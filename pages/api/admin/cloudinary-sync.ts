import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
  getCloudinaryMap,
  saveCloudinaryMap,
} from "@/lib/cloudinary";

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET to check status or POST to trigger migration
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
  }

  const configured = isCloudinaryConfigured();
  const currentMap = getCloudinaryMap();

  if (req.method === "GET") {
    return res.status(200).json({
      configured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "qfhbfsci",
      apiKey: process.env.CLOUDINARY_API_KEY || "711159128874623",
      hasSecret: configured,
      syncedCount: Object.keys(currentMap).length,
      syncedImages: currentMap,
    });
  }

  if (!configured) {
    return res.status(400).json({
      success: false,
      error:
        "Cloudinary is not configured yet. Please open your .env file and set CLOUDINARY_API_SECRET with your Cloudinary API secret.",
    });
  }

  try {
    const publicDir = path.join(process.cwd(), "public");
    const serviceDir = path.join(publicDir, "service");
    const imageDir = path.join(publicDir, "image");

    const updatedMap = { ...currentMap };
    const results: { file: string; url: string; folder: string }[] = [];

    // Helper to upload a directory of images
    async function processDirectory(dir: string, folderName: string, prefix: string) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) continue;

        const ext = path.extname(file).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext)) continue;

        const localUrl = `/${prefix}/${file}`;

        // Skip if already uploaded and in map
        if (updatedMap[localUrl] && updatedMap[localUrl].startsWith("https://res.cloudinary.com")) {
          results.push({ file: localUrl, url: updatedMap[localUrl], folder: folderName });
          continue;
        }

        try {
          const cleanName = path.basename(file, ext).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
          const uploadRes = await uploadToCloudinary(fullPath, {
            folder: `jreal/${folderName}`,
            publicId: `${cleanName}_${Date.now()}`,
          });

          updatedMap[localUrl] = uploadRes.secureUrl;
          results.push({ file: localUrl, url: uploadRes.secureUrl, folder: folderName });
        } catch (uploadErr) {
          console.error(`Failed to upload ${localUrl} to Cloudinary:`, uploadErr);
        }
      }
    }

    // Process Services Cards Images
    await processDirectory(serviceDir, "services", "service");

    // Process Product & General Images
    await processDirectory(imageDir, "products", "image");

    // Save map
    saveCloudinaryMap(updatedMap);

    return res.status(200).json({
      success: true,
      message: `Successfully synced ${results.length} images to Cloudinary!`,
      totalSynced: Object.keys(updatedMap).length,
      syncedImages: updatedMap,
    });
  } catch (err: any) {
    console.error("[cloudinary-sync error]:", err);
    return res.status(500).json({ error: err.message || "Failed to sync images to Cloudinary" });
  }
}
