// GET /api/categories  — list product categories
// POST /api/categories — add or update product category

import type { NextApiRequest, NextApiResponse } from "next";
import { productCategories, type ProductCategory } from "@/lib/data";

// In-memory store initialized with default categories
let inMemoryCategories: any[] = productCategories.map((c, i) => ({
  ...c,
  description: c.name,
  startingPrice: "From 5,000 RWF",
  showOnHomeSlider: true,
  order: i + 1,
  featuredProductIds: [],
}));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ categories: inMemoryCategories });
  }

  if (req.method === "POST") {
    try {
      const payload = req.body;

      // Case 1: Bulk array replacement (synced from admin)
      if (Array.isArray(payload)) {
        inMemoryCategories = payload;
        return res.status(200).json({ success: true, categories: inMemoryCategories });
      }

      // Case 2: Single category add or update
      const categoryData = payload;
      if (!categoryData?.name || !categoryData?.id) {
        return res.status(400).json({ error: "Category name and ID are required" });
      }

      const existingIndex = inMemoryCategories.findIndex((c) => c.id === categoryData.id);
      if (existingIndex >= 0) {
        inMemoryCategories[existingIndex] = {
          ...inMemoryCategories[existingIndex],
          ...categoryData,
        };
      } else {
        inMemoryCategories.push({
          ...categoryData,
          order: inMemoryCategories.length + 1,
          showOnHomeSlider: categoryData.showOnHomeSlider ?? true,
        });
      }

      return res.status(200).json({ success: true, categories: inMemoryCategories });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to save category" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Category ID is required" });
    }

    inMemoryCategories = inMemoryCategories.filter((c) => c.id !== id);
    return res.status(200).json({ success: true, categories: inMemoryCategories });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
