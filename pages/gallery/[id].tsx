import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/components/CartProvider";
import {
  initialArtworks,
  initialArtists,
  calculateFinancialBreakdown,
  type Artwork,
} from "@/lib/galleryData";

export default function ArtworkDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<"front" | "inRoom" | "detail">("front");
  const [isAdded, setIsAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live artworks state
  const [allArtworks, setAllArtworks] = useState<Artwork[]>(initialArtworks);

  useEffect(() => {
    fetch("/api/artworks")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.artworks && Array.isArray(data.artworks) && data.artworks.length > 0) {
          setAllArtworks(data.artworks);
        }
      })
      .catch((err) => console.warn("Failed to load artworks for detail view:", err));
  }, []);

  const artwork = useMemo(() => {
    return (
      allArtworks.find((a) => a.id === id) ||
      initialArtworks.find((a) => a.id === id) ||
      allArtworks[0] ||
      initialArtworks[0]
    );
  }, [allArtworks, id]);

  const artist = useMemo(() => {
    const found = initialArtists.find((ar) => ar.id === artwork.artistId);
    if (found) return found;
    return {
      id: "artist-curated",
      name: artwork.artistName || "Verified Rwandan Artist",
      statement: "Curated contemporary artist represented by JREAL Fine Art Marketplace.",
      city: (artwork.artistCity || "Kigali") as any,
      avatar: artwork.artistAvatar || "/image/gallery/african-woman-portrait.jpg",
      phone: artwork.artistPhone || "+250 788 123 456",
      email: "curator@jreal.rw",
      payoutMethod: "MTN MoMo" as const,
      payoutNumber: "+250 788 123 456",
      payoutAccountName: artwork.artistName || "Verified Artist",
      payoutLocked: true,
      status: "Approved" as const,
      joinedDate: "2024",
      totalGrossSales: 0,
      commissionPaid: 0,
      taxWithheld: 0,
      netPaid: 0,
      pendingBalance: 0,
      socialLinks: {},
    };
  }, [artwork]);

  const relatedArtworks = useMemo(() => {
    return allArtworks
      .filter((a) => a.id !== artwork.id && (a.medium === artwork.medium || a.artistCity === artwork.artistCity))
      .slice(0, 3);
  }, [allArtworks, artwork]);

  const isSold = artwork.status === "Sold";

  const handleAddToCart = () => {
    if (isSold) return;
    addItem({
      id: artwork.id,
      name: `${artwork.title} (${artwork.medium})`,
      price: artwork.price,
      quantity: 1,
      image: artwork.images?.front || "/image/gallery/imigongo-fusion.jpg",
      options: `${artwork.dimensions} • ${artwork.framing} • Artist: ${artwork.artistName}`,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>{artwork.title} by {artwork.artistName} | Rwandan Fine Art Gallery</title>
        <meta name="description" content={artwork.description} />
      </Head>
      <Header />

      <main className="min-h-screen bg-[#fafafa] pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Breadcrumb Navigation — Clean & Minimal */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 py-4 mb-6 border-b border-gray-200">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/gallery" className="hover:text-black transition-colors">
              Art Gallery
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900 truncate">
              {artwork.title}
            </span>
          </nav>

          {/* Main Artwork Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
            {/* Left Column: Image Stage & Multi-View Tabs (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-[#f0f0ed] border border-gray-200 rounded-md overflow-hidden">
                <Image
                  src={
                    activeTab === "front"
                      ? artwork.images?.front || "/image/gallery/imigongo-fusion.jpg"
                      : activeTab === "detail"
                      ? artwork.images?.detail || artwork.images?.front || "/image/gallery/imigongo-fusion.jpg"
                      : artwork.images?.inRoom || artwork.images?.front || "/image/gallery/imigongo-fusion.jpg"
                  }
                  alt={artwork.title}
                  fill
                  priority
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-[#0d0d0d] text-white text-[11px] font-semibold px-3 py-1 rounded-sm uppercase tracking-wider">
                    {artwork.medium}
                  </span>
                  {isSold ? (
                    <span className="bg-red-700 text-white text-[11px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                      Sold
                    </span>
                  ) : (
                    <span className="bg-[#128C38] text-white text-[11px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                      Available
                    </span>
                  )}
                </div>

                {/* Share Action */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleShare}
                    className="px-3 py-1 bg-white/95 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-black rounded-sm transition-colors"
                  >
                    {copiedLink ? "Link Copied ✓" : "Share"}
                  </button>
                </div>
              </div>

              {/* Multi-Angle View Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveTab("front")}
                  className={`py-2 px-3 text-xs font-bold border transition-colors rounded-sm ${
                    activeTab === "front"
                      ? "bg-[#0d0d0d] text-white border-[#0d0d0d]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  Direct View
                </button>
                <button
                  onClick={() => setActiveTab("detail")}
                  className={`py-2 px-3 text-xs font-bold border transition-colors rounded-sm ${
                    activeTab === "detail"
                      ? "bg-[#0d0d0d] text-white border-[#0d0d0d]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  Detail & Texture
                </button>
                <button
                  onClick={() => setActiveTab("inRoom")}
                  className={`py-2 px-3 text-xs font-bold border transition-colors rounded-sm ${
                    activeTab === "inRoom"
                      ? "bg-[#0d0d0d] text-white border-[#0d0d0d]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  Wall Scale
                </button>
              </div>

              {/* Provenance & Certificate Notice */}
              <div className="p-4 bg-white border border-gray-200 rounded-md">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                  Certificate of Authenticity Included
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Every original piece acquired through JREAL VISION DESIGN arrives with an official certificate of authenticity signed by the artist and stamped by our Kigali gallery curator.
                </p>
              </div>
            </div>

            {/* Right Column: Details, Artist, Escrow, and Acquisition (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Header Info */}
              <div>
                <p className="text-xs font-semibold text-[#128C38] uppercase tracking-wider mb-1">
                  {artwork.artistCity}, Rwanda · Created in {artwork.year}
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1612] tracking-tight leading-tight mb-3">
                  {artwork.title}
                </h1>

                {/* Artist Bio Bar */}
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md">
                  <div className="relative w-12 h-12 bg-gray-100 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={artwork.artistAvatar}
                      alt={artwork.artistName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {artwork.artistName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Studio Artist · {artwork.artistCity}, Rwanda
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Acquisition Box */}
              <div className="p-6 bg-white border border-gray-200 rounded-md">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Acquisition Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">
                    {artwork.price.toLocaleString()} <span className="text-xs font-semibold text-gray-500">RWF</span>
                  </span>
                </div>

                {/* Escrow Notice */}
                <div className="p-3 bg-gray-50 border border-gray-200 text-xs text-gray-700 rounded-sm mb-5 leading-relaxed">
                  <strong className="text-gray-900 block mb-0.5">Escrow Buyer Protection</strong>
                  Payment is locked securely in escrow and only released to the artist once you receive the artwork and complete a 48-hour inspection period.
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isSold ? (
                    <button
                      disabled
                      className="w-full py-3.5 px-4 bg-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed rounded-md text-center"
                    >
                      Artwork Collected (Sold Out)
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleAddToCart}
                        className={`w-full py-3.5 px-4 rounded-md font-bold text-xs uppercase tracking-wider transition-colors ${
                          isAdded
                            ? "bg-[#0E6C2B] text-white"
                            : "bg-[#0d0d0d] hover:bg-[#128C38] text-white"
                        }`}
                      >
                        {isAdded ? "Added to Cart ✓" : "Acquire with Escrow"}
                      </button>

                      <Link
                        href="/cart"
                        onClick={handleAddToCart}
                        className="block w-full py-3 px-4 border border-[#128C38] text-[#128C38] hover:bg-[#128C38] hover:text-white font-bold text-xs uppercase tracking-wider text-center transition-colors rounded-md cursor-pointer"
                      >
                        Proceed to Checkout
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Specifications Table */}
              <div className="bg-white border border-gray-200 p-5 rounded-md">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Artwork Specifications
                </h3>
                <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <dt className="text-gray-400 font-medium">Medium</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{artwork.medium}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 font-medium">Dimensions</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{artwork.dimensions}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 font-medium">Framing</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{artwork.framing}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 font-medium">Weight</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{artwork.weight || "3.5 kg"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 font-medium">Origin</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{artwork.artistCity}, Rwanda</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 font-medium">Year</dt>
                    <dd className="font-semibold text-gray-900 mt-0.5">{artwork.year}</dd>
                  </div>
                </dl>
              </div>

              {/* Curatorial Statement */}
              <div className="bg-white border border-gray-200 p-5 rounded-md space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Curatorial Statement
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {artwork.description}
                </p>
                {artwork.curatorNotes && (
                  <div className="p-3 bg-gray-50 border-l-2 border-[#128C38] text-xs text-gray-700">
                    <strong className="block text-gray-900 mb-0.5">Gallery Note:</strong>
                    {artwork.curatorNotes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Artist Bio & Studio Philosophy Section */}
          <div className="bg-white border border-gray-200 rounded-md p-6 sm:p-8 mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={artist.avatar}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{artist.name}</h3>
                  <p className="text-xs text-gray-500">
                    Contemporary Visual Artist · {artist.city}, Rwanda · Gallery Member since {artist.joinedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/gallery"
                  className="px-4 py-2 border border-gray-300 hover:border-black text-xs font-semibold text-gray-700 transition-colors rounded-md"
                >
                  View Collection
                </Link>
                <Link
                  href="/join-as-artist"
                  className="px-4 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold transition-colors rounded-md"
                >
                  Join as an Artist
                </Link>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Artist Statement
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{artist.statement}&rdquo;
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm text-xs space-y-2">
                <span className="font-bold text-gray-900 block">Empowering Rwandan Creators</span>
                <p className="text-gray-600 leading-relaxed">
                  Upon verified delivery, 70% of gross proceeds are disbursed directly to the artist’s MTN MoMo or Airtel Money account, fostering fair economic sustainability for Rwandan creative talent.
                </p>
              </div>
            </div>
          </div>

          {/* Related Artworks Section */}
          {relatedArtworks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Related Artworks</h3>
                  <p className="text-xs text-gray-500">More works in contemporary Rwandan medium</p>
                </div>
                <Link
                  href="/gallery"
                  className="text-xs font-bold text-[#128C38] hover:underline"
                >
                  View All Works →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedArtworks.map((item) => (
                  <Link
                    key={item.id}
                    href={`/gallery/${item.id}`}
                    className="group bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col hover:border-gray-400 transition-colors"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <Image
                        src={item.images?.front || "/image/gallery/imigongo-fusion.jpg"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded-sm">
                          {item.medium}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{item.artistName} · {item.artistCity}</p>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#128C38] transition-colors line-clamp-1 mb-2">
                          {item.title}
                        </h4>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">
                          {item.price.toLocaleString()} RWF
                        </span>
                        <span className="text-xs font-bold text-[#128C38]">View Piece →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
