/**
 * Standalone Migration Script: Uploads all product and service card images to Cloudinary
 * 
 * Usage:
 *   node scripts/migrate-to-cloudinary.js
 */

const fs = require("fs");
const path = require("path");

// Load .env
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const cloudinary = require("cloudinary").v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "qfhbfsci";
const apiKey = process.env.CLOUDINARY_API_KEY || "711159128874623";
const apiSecret = process.env.CLOUDINARY_API_SECRET;

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
} else {
  console.log("\n========================================================");
  console.log("❌ CLOUDINARY API SECRET MISSING");
  console.log("========================================================");
  console.log("Please open your .env file at:");
  console.log(envPath);
  console.log("\nReplace 'PASTE_YOUR_API_SECRET_HERE' with your Cloudinary API secret:");
  console.log("  CLOUDINARY_API_SECRET=your_secret_here");
  console.log("========================================================\n");
  process.exit(1);
}

const MAP_PATH = path.join(__dirname, "..", "lib", "cloudinaryMap.json");
let map = {};
try {
  if (fs.existsSync(MAP_PATH)) {
    map = JSON.parse(fs.readFileSync(MAP_PATH, "utf-8"));
  }
} catch (e) {}

async function run() {
  console.log("\n🚀 Starting Cloudinary migration for Products & Services cards...");
  console.log(`Cloud Name: ${cloudName}`);
  console.log(`API Key:    ${apiKey}\n`);

  const publicDir = path.join(__dirname, "..", "public");
  const folders = [
    { dir: path.join(publicDir, "service"), prefix: "service", folder: "jreal/services" },
    { dir: path.join(publicDir, "image"), prefix: "image", folder: "jreal/products" },
  ];

  let uploadedCount = 0;
  let skippedCount = 0;

  for (const item of folders) {
    if (!fs.existsSync(item.dir)) continue;
    const files = fs.readdirSync(item.dir);

    for (const file of files) {
      const fullPath = path.join(item.dir, file);
      if (fs.statSync(fullPath).isDirectory()) continue;

      const ext = path.extname(file).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext)) continue;

      const key = `/${item.prefix}/${file}`;
      if (map[key] && map[key].startsWith("https://res.cloudinary.com")) {
        console.log(`⚡ Already on Cloudinary: ${key} -> ${map[key]}`);
        skippedCount++;
        continue;
      }

      console.log(`📤 Uploading: ${key}...`);
      try {
        const cleanName = path.basename(file, ext).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
        const res = await cloudinary.uploader.upload(fullPath, {
          folder: item.folder,
          public_id: `${cleanName}_${Date.now()}`,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        });

        map[key] = res.secure_url;
        uploadedCount++;
        console.log(`✅ Success: ${res.secure_url}`);
      } catch (err) {
        console.error(`❌ Error uploading ${file}:`, err.message);
      }
    }
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2), "utf-8");
  console.log("\n========================================================");
  console.log(`✨ Migration Complete!`);
  console.log(`Uploaded: ${uploadedCount} images`);
  console.log(`Previously Synced: ${skippedCount} images`);
  console.log(`Saved mapping to: lib/cloudinaryMap.json`);
  console.log("========================================================\n");
}

run().catch(console.error);
