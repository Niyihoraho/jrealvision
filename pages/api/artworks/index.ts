// GET    /api/artworks — list curated artworks from Supabase (with auto-seed from gallery data)
// POST   /api/artworks — upload new artwork to gallery in Supabase
// PUT    /api/artworks — update artwork details, pricing, status
// DELETE /api/artworks — remove artwork from gallery

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { initialArtworks, Artwork } from "@/lib/galleryData";

// Helper to encode/decode rich artwork metadata in product description
function packMetadata(art: Partial<Artwork>): string {
  const meta = {
    medium: art.medium || "Acrylic on Canvas",
    artistName: art.artistName || "JREAL Curated Artist",
    artistCity: art.artistCity || "Kigali",
    dimensions: art.dimensions || "100 x 80 cm",
    framing: art.framing || "Framed (Solid Wood)",
    year: art.year || "2026",
    weight: art.weight || "3.5 kg",
    certificateOfAuthenticity: art.certificateOfAuthenticity !== false,
    curatorNotes: art.curatorNotes || "Curated original piece backed by JREAL escrow.",
    status: art.status || "Published",
    descText: art.description || "",
  };
  return `__ART_META__${JSON.stringify(meta)}__END_META__\n${art.description || ""}`;
}

function unpackMetadata(desc: string | null | undefined): Partial<Artwork> {
  if (!desc) return {};
  const match = desc.match(/__ART_META__([\s\S]*?)__END_META__/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      return {
        medium: parsed.medium,
        artistName: parsed.artistName,
        artistCity: parsed.artistCity,
        dimensions: parsed.dimensions,
        framing: parsed.framing,
        year: parsed.year,
        weight: parsed.weight,
        certificateOfAuthenticity: parsed.certificateOfAuthenticity,
        curatorNotes: parsed.curatorNotes,
        status: parsed.status,
        description: parsed.descText || desc.replace(/__ART_META__[\s\S]*?__END_META__\n?/, "").trim(),
      };
    } catch {
      return { description: desc };
    }
  }
  return { description: desc };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ─── GET: List Curated Artworks ─────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const { medium, city, status, search, featured } = req.query;

      // Check if artworks exist in Supabase products table
      const count = await prisma.product.count({
        where: { category: { startsWith: "art-gallery" } },
      }).catch(() => 0);

      // Auto-seed if none exist
      if (count === 0 && initialArtworks && initialArtworks.length > 0) {
        try {
          for (const art of initialArtworks) {
            const exists = await prisma.product.findUnique({ where: { id: art.id } }).catch(() => null);
            if (!exists) {
              await prisma.product.create({
                data: {
                  id: art.id,
                  name: art.title,
                  description: packMetadata(art),
                  category: "art-gallery",
                  price: Number(art.price) || 0,
                  stock: art.status === "Sold" ? 0 : 1,
                  images: [
                    art.images?.front || "/image/gallery/imigongo-fusion.jpg",
                    art.images?.detail || art.images?.front || "/image/gallery/imigongo-fusion.jpg",
                    art.images?.inRoom || art.images?.front || "/image/gallery/imigongo-fusion.jpg",
                  ],
                  featured: Boolean(art.featured),
                  active: art.status !== "Draft",
                },
              });
            }
          }
        } catch (seedErr) {
          console.warn("[artworks auto-seed warning]:", seedErr);
        }
      }

      // Fetch from Supabase
      const products = await prisma.product.findMany({
        where: {
          category: { startsWith: "art-gallery" },
        },
        orderBy: { createdAt: "desc" },
      });

      // Map back to full Artwork objects
      let mappedArtworks: Artwork[] = (products as any[]).map((p: any) => {
        const meta = unpackMetadata(p.description);
        const frontImg = p.images[0] || "/image/gallery/imigongo-fusion.jpg";
        const detailImg = p.images[1] || frontImg;
        const inRoomImg = p.images[2] || frontImg;

        return {
          id: p.id,
          title: p.name,
          artistId: "artist-jreal",
          artistName: meta.artistName || "Verified Rwandan Artist",
          artistCity: meta.artistCity || "Kigali",
          artistAvatar: "/image/photography/wedding.jpg",
          artistBio: "Curated contemporary artist represented on JREAL Fine Art Marketplace.",
          artistPhone: "+250 788 123 456",
          artistVerified: true,
          description: meta.description || p.description || "",
          medium: meta.medium || "Acrylic on Canvas",
          dimensions: meta.dimensions || "100 x 80 cm",
          framing: (meta.framing || "Framed (Solid Wood)") as any,
          price: Number(p.price) || 0,
          images: {
            front: frontImg,
            detail: detailImg,
            inRoom: inRoomImg,
          },
          status: p.stock === 0 ? "Sold" : (p.active ? "Published" : "Draft"),
          year: meta.year || "2026",
          certificateOfAuthenticity: meta.certificateOfAuthenticity !== false,
          featured: p.featured,
          views: 350,
          likes: 45,
          weight: meta.weight || "4.0 kg",
          curatorNotes: meta.curatorNotes || "Certified authentic and protected by platform escrow.",
        };
      });

      // If database returned fewer items or none, merge with initialArtworks ensuring uniqueness
      if (mappedArtworks.length < initialArtworks.length) {
        const existingIds = new Set(mappedArtworks.map((a) => a.id));
        const missing = initialArtworks.filter((a) => !existingIds.has(a.id));
        mappedArtworks = [...mappedArtworks, ...missing];
      }

      // In-memory filters if query params provided
      if (medium && typeof medium === "string" && medium !== "All Mediums") {
        mappedArtworks = mappedArtworks.filter((a) => a.medium.toLowerCase().includes(medium.toLowerCase()));
      }
      if (city && typeof city === "string" && city !== "All Cities") {
        mappedArtworks = mappedArtworks.filter((a) => a.artistCity.toLowerCase() === city.toLowerCase());
      }
      if (featured === "true") {
        mappedArtworks = mappedArtworks.filter((a) => a.featured);
      }
      if (search && typeof search === "string" && search.trim()) {
        const q = search.trim().toLowerCase();
        mappedArtworks = mappedArtworks.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.artistName.toLowerCase().includes(q) ||
            a.medium.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q)
        );
      }

      return res.status(200).json({ success: true, count: mappedArtworks.length, artworks: mappedArtworks });
    } catch (err: any) {
      console.error("[artworks GET]", err);
      return res.status(200).json({ success: true, count: initialArtworks.length, artworks: initialArtworks });
    }
  }

  // ─── POST: Upload New Artwork to Supabase ──────────────────────────────────
  if (req.method === "POST") {
    try {
      const {
        title,
        artistName,
        artistCity = "Kigali",
        medium = "Acrylic on Canvas",
        dimensions = "100 x 80 cm",
        framing = "Framed (Solid Wood)",
        price,
        year = "2026",
        weight = "3.5 kg",
        certificateOfAuthenticity = true,
        image,
        images,
        description,
        status = "Published",
        featured = false,
      } = req.body;

      if (!title || !price) {
        return res.status(400).json({ error: "Artwork title and price are required" });
      }

      const imageList = Array.isArray(images) && images.length > 0
        ? images
        : image
        ? [image, image, image]
        : ["/image/gallery/imigongo-fusion.jpg", "/image/gallery/imigongo-fusion.jpg", "/image/gallery/imigongo-fusion.jpg"];

      const packedDesc = packMetadata({
        description,
        artistName,
        artistCity,
        medium,
        dimensions,
        framing,
        year,
        weight,
        certificateOfAuthenticity: Boolean(certificateOfAuthenticity),
        status,
      });

      const newProduct = await prisma.product.create({
        data: {
          name: title,
          description: packedDesc,
          category: "art-gallery",
          price: Number(price) || 0,
          stock: status === "Sold" ? 0 : 1,
          images: imageList,
          featured: Boolean(featured),
          active: status !== "Draft",
        },
      });

      const createdArtwork: Artwork = {
        id: newProduct.id,
        title: newProduct.name,
        artistId: "artist-jreal",
        artistName,
        artistCity,
        artistAvatar: "/image/photography/wedding.jpg",
        artistBio: "Curated contemporary artist represented on JREAL Fine Art Marketplace.",
        artistPhone: "+250 788 123 456",
        artistVerified: true,
        description: description || "",
        medium,
        dimensions,
        framing: framing as any,
        price: Number(newProduct.price),
        images: {
          front: imageList[0],
          detail: imageList[1] || imageList[0],
          inRoom: imageList[2] || imageList[0],
        },
        status: status as any,
        year,
        certificateOfAuthenticity: Boolean(certificateOfAuthenticity),
        featured: Boolean(featured),
        views: 1,
        likes: 0,
        weight,
        curatorNotes: "Verified original artwork backed by platform escrow.",
      };

      return res.status(201).json({ success: true, artwork: createdArtwork });
    } catch (err: any) {
      console.error("[artworks POST]", err);
      return res.status(500).json({ error: err.message || "Failed to create artwork in database" });
    }
  }

  // ─── PUT / PATCH: Update Artwork ───────────────────────────────────────────
  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const {
        id,
        title,
        artistName,
        artistCity,
        medium,
        dimensions,
        framing,
        price,
        year,
        weight,
        certificateOfAuthenticity,
        image,
        images,
        description,
        status,
        featured,
      } = req.body;

      const targetId = id || (req.query.id as string);
      if (!targetId) {
        return res.status(400).json({ error: "Artwork ID is required" });
      }

      const updateData: any = {};
      if (title) updateData.name = title;
      if (price !== undefined) updateData.price = Number(price);
      if (featured !== undefined) updateData.featured = Boolean(featured);
      if (status !== undefined) {
        updateData.active = status !== "Draft";
        updateData.stock = status === "Sold" ? 0 : 1;
      }
      if (images) {
        updateData.images = Array.isArray(images) ? images : [images];
      } else if (image) {
        updateData.images = [image, image, image];
      }

      // Re-pack metadata
      const packedDesc = packMetadata({
        description,
        artistName,
        artistCity,
        medium,
        dimensions,
        framing,
        year,
        weight,
        certificateOfAuthenticity,
        status,
      });
      updateData.description = packedDesc;

      const updated = await prisma.product.update({
        where: { id: targetId },
        data: updateData,
      });

      return res.status(200).json({ success: true, product: updated });
    } catch (err: any) {
      console.error("[artworks PUT]", err);
      return res.status(500).json({ error: err.message || "Failed to update artwork in database" });
    }
  }

  // ─── DELETE: Remove Artwork ────────────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const targetId = (req.query.id as string) || req.body?.id;
      if (!targetId) {
        return res.status(400).json({ error: "Artwork ID is required" });
      }

      await prisma.product.delete({
        where: { id: targetId },
      });

      return res.status(200).json({ success: true, message: "Artwork deleted successfully" });
    } catch (err: any) {
      console.error("[artworks DELETE]", err);
      return res.status(500).json({ error: err.message || "Failed to delete artwork" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
