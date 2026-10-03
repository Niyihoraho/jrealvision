import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Initialize Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "qfhbfsci";
const apiKey = process.env.CLOUDINARY_API_KEY || "711159128874623";
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Also parse CLOUDINARY_URL if provided
if (
  process.env.CLOUDINARY_URL &&
  !process.env.CLOUDINARY_URL.includes("PASTE_YOUR_API_SECRET_HERE") &&
  !process.env.CLOUDINARY_URL.includes("**********")
) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true,
  });
} else if (
  cloudName &&
  apiKey &&
  apiSecret &&
  apiSecret !== "PASTE_YOUR_API_SECRET_HERE" &&
  !apiSecret.includes("**********")
) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Returns true if valid Cloudinary credentials are provided in .env
 */
export function isCloudinaryConfigured(): boolean {
  if (
    process.env.CLOUDINARY_URL &&
    !process.env.CLOUDINARY_URL.includes("PASTE_YOUR_API_SECRET_HERE") &&
    !process.env.CLOUDINARY_URL.includes("**********") &&
    process.env.CLOUDINARY_URL.startsWith("cloudinary://")
  ) {
    return true;
  }

  const secret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(
    secret &&
    secret.trim().length > 0 &&
    secret !== "PASTE_YOUR_API_SECRET_HERE" &&
    !secret.includes("**********")
  );
}

/**
 * Upload an image (base64 string, local file path, or remote URL) to Cloudinary
 */
export async function uploadToCloudinary(
  fileOrBase64: string,
  options: {
    folder?: string;
    publicId?: string;
    tags?: string[];
  } = {}
): Promise<{ url: string; secureUrl: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured yet. Please add your CLOUDINARY_API_SECRET in the .env file."
    );
  }

  const uploadOptions: any = {
    folder: options.folder || "jreal/uploads",
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" }
    ],
  };

  if (options.publicId) {
    uploadOptions.public_id = options.publicId;
  }
  if (options.tags && options.tags.length > 0) {
    uploadOptions.tags = options.tags;
  }

  const result = await cloudinary.uploader.upload(fileOrBase64, uploadOptions);

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

import cloudinaryMapJson from "./cloudinaryMap.json";

/**
 * Load or update the local path -> Cloudinary CDN URL mapping cache
 */
export function getCloudinaryMap(): Record<string, string> {
  if (typeof window === "undefined") {
    try {
      const mapPath = path.join(process.cwd(), "lib", "cloudinaryMap.json");
      if (fs.existsSync(mapPath)) {
        return JSON.parse(fs.readFileSync(mapPath, "utf-8"));
      }
    } catch {}
  }
  return (cloudinaryMapJson as Record<string, string>) || {};
}

export function saveCloudinaryMap(map: Record<string, string>): void {
  if (typeof window === "undefined") {
    try {
      const mapPath = path.join(process.cwd(), "lib", "cloudinaryMap.json");
      fs.writeFileSync(mapPath, JSON.stringify(map, null, 2), "utf-8");
    } catch (e) {
      console.error("[cloudinary map save error]:", e);
    }
  }
}

/**
 * Returns the Cloudinary CDN URL for a given media path if available, or the original path
 */
export function getMediaUrl(localOrRemotePath: string): string {
  if (!localOrRemotePath) return "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043478/jreal/products/printing_products_1791043479080.jpg";
  if (localOrRemotePath.startsWith("https://res.cloudinary.com")) {
    return localOrRemotePath;
  }

  const cleanKey = localOrRemotePath.trim();
  const staticMap = (cloudinaryMapJson as Record<string, string>) || {};
  if (staticMap[cleanKey]) {
    return staticMap[cleanKey];
  }

  const dynamicMap = getCloudinaryMap();
  if (dynamicMap[cleanKey]) {
    return dynamicMap[cleanKey];
  }

  return localOrRemotePath;
}

export default cloudinary;
