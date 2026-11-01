// GET    /api/products — list products from Supabase (with auto-seed & attribute parsing)
// POST   /api/products — create new product in Supabase (Admin Dashboard)
// PUT    /api/products — update product in Supabase
// DELETE /api/products — delete product from Supabase

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { products as defaultProducts } from "@/lib/data";

const ATTR_PREFIX = "<!-- JREAL_ATTRIBUTES_JSON:";
const ATTR_SUFFIX = "-->";

export function embedAttributesInDescription(description: string | null | undefined, attributes: any): string {
  const baseDesc = (description || "").replace(/<!-- JREAL_ATTRIBUTES_JSON:[\s\S]*?-->/g, "").trim();
  if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
    return baseDesc;
  }
  return `${baseDesc}\n\n${ATTR_PREFIX}${JSON.stringify(attributes)}${ATTR_SUFFIX}`;
}

export function extractAttributesFromDescription(description: string | null | undefined): {
  attributes: any[] | null;
  cleanDescription: string;
} {
  if (!description) return { attributes: null, cleanDescription: "" };
  const match = description.match(/<!-- JREAL_ATTRIBUTES_JSON:([\s\S]*?)-->/);
  if (!match) return { attributes: null, cleanDescription: description.trim() };
  try {
    const parsed = JSON.parse(match[1]);
    const clean = description.replace(/<!-- JREAL_ATTRIBUTES_JSON:[\s\S]*?-->/g, "").trim();
    return { attributes: Array.isArray(parsed) ? parsed : null, cleanDescription: clean };
  } catch {
    return { attributes: null, cleanDescription: description.trim() };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ─── GET: Fetch products from Supabase DB ────────────────────────────────────
  if (req.method === "GET") {
    try {
      const { category, search, featured, limit, id } = req.query;

      // Single product query by ID
      if (id && typeof id === "string") {
        res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
        const product = await prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          // Check default products fallback
          const fallback = defaultProducts.find((p) => p.id === id);
          if (fallback) {
            return res.status(200).json({
              success: true,
              product: {
                ...fallback,
                attributes: (fallback as any).attributes || [],
              },
            });
          }
          return res.status(404).json({ error: "Product not found" });
        }

        const { attributes, cleanDescription } = extractAttributesFromDescription(product.description);
        return res.status(200).json({
          success: true,
          product: {
            ...product,
            description: cleanDescription,
            attributes: attributes || [],
          },
        });
      }

      // Auto-seed if database products table has only test items or seed is requested
      const count = await prisma.product.count().catch(() => 0);
      if ((count <= 1 || req.query.seed === "true") && defaultProducts && defaultProducts.length > 0) {
        try {
          for (const dp of defaultProducts) {
            const exists = await prisma.product.findUnique({ where: { id: dp.id } }).catch(() => null);
            if (!exists) {
              await prisma.product.create({
                data: {
                  id: dp.id,
                  name: dp.name,
                  description: dp.description || `${dp.name} — high quality customized product by JREAL VISION DESIGN.`,
                  category: dp.category,
                  price: dp.price,
                  stock: 100,
                  images: dp.image ? [dp.image] : ["/image/printing_products.jpg"],
                  featured: (dp as any).featured || false,
                  active: true,
                },
              });
            }
          }
        } catch (seedErr) {
          console.warn("[products auto-seed warning]:", seedErr);
        }
      }

      // Set Edge Caching headers (Next.js Edge Cache / CDN)
      // Store listing is cached at the edge for 60s; served stale up to 300s while revalidating
      if (!req.query.nocache) {
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      } else {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      }

      // Build filter
      const where: any = { active: true };
      if (category && category !== "all" && typeof category === "string") {
        where.category = { equals: category, mode: "insensitive" };
      }
      if (featured === "true") {
        where.featured = true;
      }
      if (search && typeof search === "string" && search.trim()) {
        where.OR = [
          { name: { contains: search.trim(), mode: "insensitive" } },
          { description: { contains: search.trim(), mode: "insensitive" } },
          { category: { contains: search.trim(), mode: "insensitive" } },
        ];
      }

      // 20-Product Pagination logic
      const isFetchAll = req.query.all === "true" || limit === "all";
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limitVal = isFetchAll
        ? undefined
        : Math.max(1, parseInt(limit as string, 10) || 20);
      const skip = !isFetchAll && limitVal ? (page - 1) * limitVal : undefined;

      const [totalCount, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limitVal,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const mapped = products.map((p: any) => {
        const { attributes, cleanDescription } = extractAttributesFromDescription(p.description);
        return {
          ...p,
          description: cleanDescription,
          attributes: attributes || [],
        };
      });

      return res.status(200).json({
        success: true,
        count: mapped.length,
        total: totalCount,
        page: isFetchAll ? 1 : page,
        totalPages: isFetchAll || !limitVal ? 1 : Math.ceil(totalCount / limitVal),
        limit: limitVal || totalCount,
        products: mapped,
      });
    } catch (err: any) {
      console.error("[products GET]", err);
      // Fallback to in-memory default products if DB connection error
      const isFetchAll = req.query.all === "true" || req.query.limit === "all";
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limitVal = isFetchAll ? undefined : Math.max(1, parseInt(req.query.limit as string, 10) || 20);
      const skip = !isFetchAll && limitVal ? (page - 1) * limitVal : 0;
      const paginated = isFetchAll || !limitVal
        ? defaultProducts
        : defaultProducts.slice(skip, skip + limitVal);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total: defaultProducts.length,
        page: isFetchAll ? 1 : page,
        totalPages: isFetchAll || !limitVal ? 1 : Math.ceil(defaultProducts.length / (limitVal || 20)),
        limit: limitVal || defaultProducts.length,
        products: paginated,
      });
    }
  }

  // ─── POST: Create product in Supabase DB ─────────────────────────────────────
  if (req.method === "POST") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    try {
      const {
        name,
        title,
        category,
        price,
        stock = 100,
        images,
        image,
        description,
        attributes,
        featured = false,
        active = true,
      } = req.body;

      const productName = name || title;
      if (!productName || !category) {
        return res.status(400).json({ error: "Product name and category are required" });
      }

      const parsedPrice = parseFloat(price) || 0;
      const parsedStock = parseInt(stock, 10) || 100;
      const imageList = Array.isArray(images) && images.length > 0
        ? images
        : image
        ? [image]
        : ["/image/printing_products.jpg"];

      // Embed variant attributes in description column for full DB persistence
      const finalDescription = embedAttributesInDescription(description, attributes);

      const newProduct = await prisma.product.create({
        data: {
          name: productName,
          description: finalDescription,
          category,
          price: parsedPrice,
          stock: parsedStock,
          images: imageList,
          featured: Boolean(featured),
          active: Boolean(active),
        },
      });

      return res.status(201).json({
        success: true,
        product: {
          ...newProduct,
          description: description || "",
          attributes: attributes || [],
        },
      });
    } catch (err: any) {
      console.error("[products POST]", err);
      return res.status(500).json({ error: err.message || "Failed to create product in database" });
    }
  }

  // ─── PUT / PATCH: Update product in Supabase DB ──────────────────────────────
  if (req.method === "PUT" || req.method === "PATCH") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    try {
      const {
        id,
        name,
        title,
        category,
        price,
        stock,
        images,
        image,
        description,
        attributes,
        featured,
        active,
      } = req.body;

      const targetId = id || (req.query.id as string);

      if (!targetId) {
        return res.status(400).json({ error: "Product ID is required for update" });
      }

      const dataToUpdate: any = {};
      if (name || title) dataToUpdate.name = name || title;
      if (category) dataToUpdate.category = category;
      if (price !== undefined) dataToUpdate.price = parseFloat(price);
      if (stock !== undefined) dataToUpdate.stock = parseInt(stock, 10);
      if (featured !== undefined) dataToUpdate.featured = Boolean(featured);
      if (active !== undefined) dataToUpdate.active = Boolean(active);
      if (images) {
        dataToUpdate.images = Array.isArray(images) ? images : [images];
      } else if (image) {
        dataToUpdate.images = [image];
      }

      // Handle description and attributes update
      if (description !== undefined || attributes !== undefined) {
        let currentDesc = description;
        if (currentDesc === undefined) {
          const current = await prisma.product.findUnique({ where: { id: targetId } });
          const extracted = extractAttributesFromDescription(current?.description);
          currentDesc = extracted.cleanDescription;
        }
        dataToUpdate.description = embedAttributesInDescription(currentDesc, attributes);
      }

      const updated = await prisma.product.update({
        where: { id: targetId },
        data: dataToUpdate,
      });

      const { attributes: savedAttrs, cleanDescription } = extractAttributesFromDescription(updated.description);

      return res.status(200).json({
        success: true,
        product: {
          ...updated,
          description: cleanDescription,
          attributes: savedAttrs || [],
        },
      });
    } catch (err: any) {
      console.error("[products PUT]", err);
      return res.status(500).json({ error: err.message || "Failed to update product in database" });
    }
  }

  // ─── DELETE: Remove or soft-delete product ──────────────────────────────────
  if (req.method === "DELETE") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    try {
      const targetId = (req.query.id as string) || req.body?.id;
      if (!targetId) {
        return res.status(400).json({ error: "Product ID is required for deletion" });
      }

      // Soft delete by deactivating or hard delete if not linked to existing orders
      try {
        await prisma.product.delete({ where: { id: targetId } });
      } catch {
        await prisma.product.update({
          where: { id: targetId },
          data: { active: false },
        });
      }

      return res.status(200).json({ success: true, message: "Product removed from database" });
    } catch (err: any) {
      console.error("[products DELETE]", err);
      return res.status(500).json({ error: err.message || "Failed to delete product" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
