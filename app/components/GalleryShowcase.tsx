"use client";

import Image from "next/image";
import Link from "next/link";
import { initialArtworks } from "@/lib/galleryData";
import { resolveMediaUrl, FALLBACK_ARTWORK_IMAGE } from "@/lib/mediaUtils";

export default function GalleryShowcase() {
  const featuredArtworks = initialArtworks
    .filter((a) => a.featured && a.status === "Published")
    .slice(0, 3);

  return (
    <section className="py-20 bg-[#fafafa] border-y border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Curated Rwandan Fine Art
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1.5 max-w-xl mx-auto">
            Browse original paintings, Imigongo heritage fusion, and contemporary works created by verified artists across Rwanda
          </p>
        </div>

        {/* 3-Card Showcase Grid — Clean, Solid, Editorial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredArtworks.map((art) => (
            <article
              key={art.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
            >
              <Link href={`/gallery/${art.id}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                  src={resolveMediaUrl(art.images.front, FALLBACK_ARTWORK_IMAGE)}
                  alt={art.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[11px] font-semibold tracking-wide uppercase bg-[#0d0d0d] text-white px-2.5 py-1 rounded-sm">
                    {art.medium}
                  </span>
                </div>
              </Link>

              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="font-semibold text-gray-900">{art.artistName}</span>
                    <span className="text-gray-500">{art.artistCity}, Rwanda</span>
                  </div>

                  <Link href={`/gallery/${art.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 hover:text-[#128C38] transition-colors leading-snug mb-2">
                      {art.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {art.description}
                  </p>

                  <div className="text-xs text-gray-500 space-y-1 mb-4 pt-3 border-t border-gray-100">
                    <div><span className="text-gray-400">Dimensions:</span> <span className="font-medium text-gray-700">{art.dimensions}</span></div>
                    <div><span className="text-gray-400">Framing:</span> <span className="font-medium text-gray-700">{art.framing}</span></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block uppercase font-medium">Price</span>
                    <span className="text-lg font-extrabold text-gray-900">
                      {art.price.toLocaleString()} <span className="text-xs font-semibold text-gray-500">RWF</span>
                    </span>
                  </div>

                  <Link
                    href={`/gallery/${art.id}`}
                    className="px-4 py-2 border border-gray-300 hover:border-black text-gray-900 hover:text-black rounded-md text-xs font-bold transition-colors"
                  >
                    View Piece
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Collection */}
        <div className="text-center mb-12">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-[#128C38] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Explore Full Art Collection →
          </Link>
        </div>

        {/* Artist Onboarding & Escrow Strip — Solid, Clean, No Icons */}
        <div className="p-8 rounded-lg bg-white border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-wider text-[#128C38] uppercase block mb-1">
              For Rwandan Artists
            </span>
            <h4 className="text-base font-bold text-gray-900 mb-1">
              Sell your art directly to domestic and international collectors
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Connect your MTN MoMo or Airtel Money account. Receive 70% net proceeds with guaranteed escrow settlements upon verified delivery.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/join-as-artist"
              className="px-5 py-2.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-md transition-colors"
            >
              Apply as Artist
            </Link>
            <Link
              href="/artist/dashboard"
              className="px-5 py-2.5 border border-gray-300 hover:border-gray-900 text-gray-800 text-xs font-semibold rounded-md transition-colors"
            >
              Artist Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
