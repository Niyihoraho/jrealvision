import cloudinaryMapJson from "./cloudinaryMap.json";

const map = (cloudinaryMapJson as Record<string, string>) || {};

export const FALLBACK_SERVICE_IMAGE =
  "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043461/jreal/services/Minimal_Brand_Identity_Design_With_Maxim_1791043462393.jpg";

export const FALLBACK_PRODUCT_IMAGE =
  "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043478/jreal/products/printing_products_1791043479080.jpg";

export const FALLBACK_ARTWORK_IMAGE =
  "https://res.cloudinary.com/qfhbfsci/image/upload/v1793540396/jreal/gallery/imigongo-fusion_1793540396734.jpg";

/**
 * Resolves any image URL or local path to its high-resolution Cloudinary CDN URL.
 * Works seamlessly in client components and server code without Node fs/path dependencies.
 */
export function resolveMediaUrl(
  pathOrUrl?: string | null,
  fallback: string = FALLBACK_SERVICE_IMAGE
): string {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return fallback;
  const clean = pathOrUrl.trim();
  if (!clean) return fallback;

  // Already a full remote URL or data URI
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }

  // Exact match in Cloudinary map
  if (map[clean]) {
    return map[clean];
  }

  // Normalized key (ensure leading slash, decode URI components)
  const normalizedKey = clean.startsWith("/") ? clean : `/${clean}`;
  if (map[normalizedKey]) {
    return map[normalizedKey];
  }

  try {
    const decoded = decodeURIComponent(normalizedKey);
    if (map[decoded]) {
      return map[decoded];
    }
  } catch {}

  // If starts with /service/ or /image/gallery/ or /image/ and not found, check partial name
  const filename = clean.split("/").pop();
  if (filename) {
    for (const [mapKey, cdnUrl] of Object.entries(map)) {
      if (mapKey.endsWith(filename)) {
        return cdnUrl;
      }
    }
  }

  return clean || fallback;
}

