import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

// Allow up to 30MB for high-resolution product photography & large assets
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "30mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { image, images, filename: customFilename, folder } = req.body;

    const filesToProcess: { data: string; name?: string }[] = [];

    if (Array.isArray(images) && images.length > 0) {
      for (const item of images) {
        if (typeof item === "string" && item.trim()) {
          filesToProcess.push({ data: item });
        }
      }
    } else if (image && typeof image === "string") {
      filesToProcess.push({ data: image, name: customFilename });
    }

    if (filesToProcess.length === 0) {
      return res.status(400).json({ error: "No image payload provided" });
    }

    const savedUrls: string[] = [];
    const useCloudinary = isCloudinaryConfigured();

    if (useCloudinary) {
      // ── UPLOAD DIRECTLY TO CLOUDINARY ──
      for (let i = 0; i < filesToProcess.length; i++) {
        const fileItem = filesToProcess[i];
        let base64 = fileItem.data;
        if (!base64.startsWith("data:")) {
          base64 = `data:image/jpeg;base64,${base64}`;
        }

        try {
          const cleanName = (fileItem.name || `img_${Date.now()}_${i}`)
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "_");

          const result = await uploadToCloudinary(base64, {
            folder: folder || "jreal/products",
            publicId: `${cleanName}_${Date.now()}`,
          });

          savedUrls.push(result.secureUrl);
        } catch (cloudErr: any) {
          console.error("[cloudinary upload error, falling back to local]:", cloudErr);
          // Fallback to local if individual upload hits an issue
          const localUrl = await saveFileLocally(fileItem.data);
          savedUrls.push(localUrl);
        }
      }

      return res.status(200).json({
        success: true,
        source: "cloudinary",
        url: savedUrls[0],
        urls: savedUrls,
      });
    }

    // ── FALLBACK TO LOCAL STORAGE IF CLOUDINARY SECRET NOT CONFIGURED YET ──
    for (const fileItem of filesToProcess) {
      const localUrl = await saveFileLocally(fileItem.data);
      savedUrls.push(localUrl);
    }

    return res.status(200).json({
      success: true,
      source: "local",
      url: savedUrls[0],
      urls: savedUrls,
      notice: "Image saved locally. Set CLOUDINARY_API_SECRET in your .env to upload directly to Cloudinary.",
    });
  } catch (err: any) {
    console.error("[upload handler error]:", err);
    return res.status(500).json({ error: err.message || "Failed to process image upload" });
  }
}

async function saveFileLocally(base64Data: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  let cleanData = base64Data;
  let extension = "jpg";

  const match = cleanData.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
  if (match) {
    const rawExt = match[1].toLowerCase();
    extension =
      rawExt === "jpeg"
        ? "jpg"
        : rawExt.includes("png")
        ? "png"
        : rawExt.includes("webp")
        ? "webp"
        : rawExt.includes("svg")
        ? "svg"
        : "jpg";
    cleanData = cleanData.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  }

  const buffer = Buffer.from(cleanData, "base64");
  const safeRandom = Math.random().toString(36).substring(2, 9);
  const filename = `jreal_prod_${Date.now()}_${safeRandom}.${extension}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}
