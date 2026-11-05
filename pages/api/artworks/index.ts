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

function mapProductToArtwork(p: any): Artwork {
  const meta = unpackMetadata(p.description);
  const frontImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || "/image/gallery/imigongo-fusion.jpg");
  const detailImg = Array.isArray(p.images) && p.images[1] ? p.images[1] : frontImg;
  const inRoomImg = Array.isArray(p.images) && p.images[2] ? p.images[2] : frontImg;

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
    status: p.stock === 0 ? "Sold" : (p.active ? (meta.status || "Published") : "Draft"),
    year: meta.year || "2026",
    certificateOfAuthenticity: meta.certificateOfAuthenticity !== false,
    featured: Boolean(p.featured),
    views: 350,
    likes: 45,
    weight: meta.weight || "4.0 kg",
    curatorNotes: meta.curatorNotes || "Certified authentic and protected by platform escrow.",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Prevent any browser or intermediary proxy caching for dynamic API responses
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // ─── GET: List Curated Artworks ─────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const { id, medium, city, status, search, featured } = req.query;

      // Single item query
      if (id && typeof id === "string") {
        const product = await prisma.product.findUnique({ where: { id } }).catch(() => null);
        if (product && product.category === "art-gallery") {
          return res.status(200).json({ success: true, artwork: mapProductToArtwork(product) });
        }
        const fallback = initialArtworks.find((a) => a.id === id);
        if (fallback) {
          return res.status(200).json({ success: true, artwork: fallback });
        }
        return res.status(404).json({ error: "Artwork not found" });
      }

      // Check if artworks exist in Supabase products table
      const count = await prisma.product.count({
        where: { category: "art-gallery" },
      }).catch(() => 0);

      // Auto-seed ONLY when table is completely empty on fresh setup
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

      // Fetch active gallery artworks from Supabase
      const products = await prisma.product.findMany({
        where: {
          category: "art-gallery",
        },
        orderBy: { createdAt: "desc" },
      });

      // Map back to full Artwork objects
      let mappedArtworks: Artwork[] = (products as any[]).map(mapProductToArtwork);

      // Fallback only if database returned zero items
      if (mappedArtworks.length === 0) {
        mappedArtworks = [...initialArtworks];
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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    try {
      const {
        title,
        name,
        artistName = "Jean Luc Habimana",
        artistCity = "Kigali",
        medium = "Acrylic on Canvas",
        dimensions = "100 x 80 cm",
        framing = "Framed (Solid Wood)",
        price,
        year = "2026",
        weight = "3.8 kg",
        certificateOfAuthenticity = true,
        image,
        images,
        description,
        status = "Published",
        featured = false,
      } = req.body;

      const artworkTitle = title || name;
      if (!artworkTitle || !price) {
        return res.status(400).json({ error: "Artwork title and price are required" });
      }

      const imageList = Array.isArray(images) && images.length > 0
        ? images
        : image
        ? [image, image, image]
        : ["/image/gallery/imigongo-fusion.jpg", "/image/gallery/imigongo-fusion.jpg", "/image/gallery/imigongo-fusion.jpg"];

      const packedDesc = packMetadata({
        description: description || "",
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
          name: artworkTitle,
          description: packedDesc,
          category: "art-gallery",
          price: Number(price) || 0,
          stock: status === "Sold" ? 0 : 1,
          images: imageList,
          featured: Boolean(featured),
          active: status !== "Draft",
        },
      });

      const createdArtwork = mapProductToArtwork(newProduct);

      return res.status(201).json({ success: true, artwork: createdArtwork, product: newProduct });
    } catch (err: any) {
      console.error("[artworks POST]", err);
      return res.status(500).json({ error: err.message || "Failed to create artwork in database" });
    }
  }

  // ─── PUT / PATCH: Update Artwork ───────────────────────────────────────────
  if (req.method === "PUT" || req.method === "PATCH") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    try {
      const {
        id,
        title,
        name,
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

      // Check if record exists
      const existing = await prisma.product.findUnique({ where: { id: targetId } }).catch(() => null);

      if (!existing) {
        // Fallback: If record was in initialArtworks or not yet saved, upsert it
        const fallbackArt = initialArtworks.find((a) => a.id === targetId);
        const fallbackTitle = title || name || fallbackArt?.title || "Curated Artwork";
        const fallbackPrice = price !== undefined ? Number(price) : (fallbackArt?.price || 200000);
        const fallbackImages = images
          ? (Array.isArray(images) ? images : [images])
          : image
          ? [image, image, image]
          : [fallbackArt?.images?.front || "/image/gallery/imigongo-fusion.jpg"];

        const packedDesc = packMetadata({
          description: description !== undefined ? description : (fallbackArt?.description || ""),
          artistName: artistName || fallbackArt?.artistName || "Jean Luc Habimana",
          artistCity: artistCity || fallbackArt?.artistCity || "Kigali",
          medium: medium || fallbackArt?.medium || "Acrylic on Canvas",
          dimensions: dimensions || fallbackArt?.dimensions || "100 x 80 cm",
          framing: framing || fallbackArt?.framing || "Framed (Solid Wood)",
          year: year || fallbackArt?.year || "2026",
          weight: weight || fallbackArt?.weight || "3.8 kg",
          certificateOfAuthenticity: certificateOfAuthenticity !== undefined ? Boolean(certificateOfAuthenticity) : true,
          status: status || fallbackArt?.status || "Published",
        });

        const created = await prisma.product.create({
          data: {
            id: targetId,
            name: fallbackTitle,
            description: packedDesc,
            category: "art-gallery",
            price: fallbackPrice,
            stock: status === "Sold" ? 0 : 1,
            images: fallbackImages,
            featured: Boolean(featured ?? fallbackArt?.featured),
            active: status !== "Draft",
          },
        });

        return res.status(200).json({ success: true, artwork: mapProductToArtwork(created), product: created });
      }

      // Existing record found: merge fields over existing metadata
      const existingMeta = unpackMetadata(existing.description);
      const updateData: any = {};

      const artworkTitle = title || name;
      if (artworkTitle) updateData.name = artworkTitle;
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

      // Merge metadata values
      const mergedMeta = {
        description: description !== undefined ? description : (existingMeta.description || ""),
        artistName: artistName !== undefined ? artistName : (existingMeta.artistName || "Jean Luc Habimana"),
        artistCity: artistCity !== undefined ? artistCity : (existingMeta.artistCity || "Kigali"),
        medium: medium !== undefined ? medium : (existingMeta.medium || "Acrylic on Canvas"),
        dimensions: dimensions !== undefined ? dimensions : (existingMeta.dimensions || "100 x 80 cm"),
        framing: framing !== undefined ? framing : (existingMeta.framing || "Framed (Solid Wood)"),
        year: year !== undefined ? year : (existingMeta.year || "2026"),
        weight: weight !== undefined ? weight : (existingMeta.weight || "3.8 kg"),
        certificateOfAuthenticity: certificateOfAuthenticity !== undefined ? Boolean(certificateOfAuthenticity) : (existingMeta.certificateOfAuthenticity !== false),
        status: status !== undefined ? status : (existingMeta.status || "Published"),
        curatorNotes: existingMeta.curatorNotes || "Certified authentic and protected by platform escrow.",
      };

      updateData.description = packMetadata(mergedMeta);

      const updated = await prisma.product.update({
        where: { id: targetId },
        data: updateData,
      });

      return res.status(200).json({ success: true, artwork: mapProductToArtwork(updated), product: updated });
    } catch (err: any) {
      console.error("[artworks PUT]", err);
      return res.status(500).json({ error: err.message || "Failed to update artwork in database" });
    }
  }

  // ─── DELETE: Remove Artwork ────────────────────────────────────────────────
  if (req.method === "DELETE") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    try {
      const targetId = (req.query.id as string) || req.body?.id;
      if (!targetId) {
        return res.status(400).json({ error: "Artwork ID is required" });
      }

      // Try hard delete or soft delete if linked to orders
      try {
        await prisma.product.delete({
          where: { id: targetId },
        });
      } catch {
        await prisma.product.update({
          where: { id: targetId },
          data: { active: false, category: "art-gallery-deleted" },
        });
      }

      return res.status(200).json({ success: true, message: "Artwork deleted successfully" });
    } catch (err: any) {
      console.error("[artworks DELETE]", err);
      return res.status(500).json({ error: err.message || "Failed to delete artwork" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
