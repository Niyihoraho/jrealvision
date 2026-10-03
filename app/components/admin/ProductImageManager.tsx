"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";

interface ProductImageManagerProps {
  images: string[];
  coverImage: string;
  onChange: (images: string[], coverImage: string) => void;
}

export interface UploadedPresetItem {
  id: string;
  url: string;
  label: string;
  preview?: string;
}

export const AVAILABLE_PRODUCT_IMAGE_PRESETS = [
  { label: "Apparel & Print", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043478/jreal/products/printing_products_1791043479080.jpg", tag: "Apparel" },
  { label: "Studio Product Shot", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043464/jreal/services/Product_Photography_1791043465274.jpg", tag: "Studio" },
  { label: "Fashion & Lookbook", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043454/jreal/services/Fashion___Lifestyle_Lookbooks_1791043455165.jpg", tag: "Lookbook" },
  { label: "Packaging & Labels", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043462/jreal/services/Packaging___Product_Labels_1791043463901.jpg", tag: "Packaging" },
  { label: "Custom Boxes", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043448/jreal/services/Custom_Packaging___Boxes_1791043449375.jpg", tag: "Boxes" },
  { label: "Stationery & Cards", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043444/jreal/services/Business_Cards___Stationery_1791043444960.jpg", tag: "Stationery" },
  { label: "Banners & Signage", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043460/jreal/services/Large_Format___Outdoor_Signage_1791043461259.jpg", tag: "Signage" },
  { label: "Design Kit", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043474/jreal/products/graphic_design_tool_1791043475137.jpg", tag: "Graphic" },
  { label: "Digital Marketing", url: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043472/jreal/products/digital_marketing_1791043473732.jpg", tag: "Marketing" },
];

export const STORAGE_KEY_UPLOADED_IMAGES = "jreal_uploaded_catalog_images_v2";

export function getStoredUploadedImages(): UploadedPresetItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UPLOADED_IMAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredUploadedImage(item: UploadedPresetItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUploadedImages();
    const filtered = current.filter((x) => x.url !== item.url);
    const updated = [item, ...filtered].slice(0, 30); // keep recent 30
    localStorage.setItem(STORAGE_KEY_UPLOADED_IMAGES, JSON.stringify(updated));
    window.dispatchEvent(new Event("catalog_images_updated"));
  } catch (err) {
    console.error("Failed to save uploaded image preset:", err);
  }
}

export function removeStoredUploadedImage(url: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUploadedImages();
    const updated = current.filter((x) => x.url !== url);
    localStorage.setItem(STORAGE_KEY_UPLOADED_IMAGES, JSON.stringify(updated));
    window.dispatchEvent(new Event("catalog_images_updated"));
  } catch (err) {}
}

export default function ProductImageManager({
  images,
  coverImage,
  onChange,
}: ProductImageManagerProps) {
  const [newUrlInput, setNewUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-memory data URL / blob preview cache to prevent image ghosting
  const [previewMap, setPreviewMap] = useState<Record<string, string>>({});

  // Dynamic user-uploaded presets list (retrieved from localStorage and DB)
  const [uploadedPresets, setUploadedPresets] = useState<UploadedPresetItem[]>([]);

  // Safe images array (fallback to cover or clean placeholder)
  const safeImages = images && images.length > 0 ? images : [coverImage || "/image/printing_products.jpg"];
  const currentCover = coverImage || safeImages[0];

  const refreshUploadedPresets = useCallback(() => {
    const stored = getStoredUploadedImages();
    setUploadedPresets(stored);
  }, []);

  useEffect(() => {
    refreshUploadedPresets();

    const handleUpdate = () => {
      refreshUploadedPresets();
    };

    window.addEventListener("catalog_images_updated", handleUpdate);
    return () => {
      window.removeEventListener("catalog_images_updated", handleUpdate);
    };
  }, [refreshUploadedPresets]);

  // Add an image from URL input
  const handleAddUrl = () => {
    const trimmed = newUrlInput.trim();
    if (!trimmed) return;
    if (safeImages.includes(trimmed)) {
      setUrlError("This image is already in the gallery.");
      return;
    }
    setUrlError(null);

    // Save to user presets list so it appears in the presets bar like other presets
    const filename = trimmed.split("/").pop() || "Custom URL";
    saveStoredUploadedImage({
      id: `url_${Date.now()}`,
      url: trimmed,
      label: filename.slice(0, 20),
    });

    const isOnlyDemo =
      safeImages.length === 1 &&
      (safeImages[0] === "/image/printing_products.jpg" || safeImages[0] === "/service/Product Photography.jpeg");

    const updated = isOnlyDemo ? [trimmed] : [...safeImages, trimmed];
    onChange(updated, trimmed);
    setNewUrlInput("");
  };

  // Toggle or select a preset
  const handleSelectPreset = (presetUrl: string) => {
    if (safeImages.includes(presetUrl)) {
      if (currentCover !== presetUrl) {
        // Switch cover to this preset
        onChange(safeImages, presetUrl);
      } else if (safeImages.length > 1) {
        // Toggle remove if already cover and more images exist
        const updated = safeImages.filter((img) => img !== presetUrl);
        onChange(updated, updated[0]);
      }
      return;
    }

    // If current images are just the initial default placeholders, replace them
    const isOnlyDemo =
      (safeImages.length === 1 && safeImages[0] === "/image/printing_products.jpg") ||
      (safeImages.length === 2 &&
        safeImages[0] === "/image/printing_products.jpg" &&
        safeImages[1] === "/service/Product Photography.jpeg");

    const updated = isOnlyDemo ? [presetUrl] : [...safeImages, presetUrl];
    onChange(updated, presetUrl);
  };

  // Delete uploaded preset from global list
  const handleDeleteUploadedPreset = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    removeStoredUploadedImage(url);
  };

  // Handle file upload with instant preview and anti-ghosting
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUrlError(null);
    setUploadProgress(`Processing ${files.length} photo${files.length > 1 ? "s" : ""}...`);

    try {
      const fileList = Array.from(files);
      const newUrls: string[] = [];
      const newPreviews: Record<string, string> = {};

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`Processing ${i + 1} of ${fileList.length}: ${file.name}`);

        // Read file as base64 data for instant local rendering
        const base64Data: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Store instant preview to prevent ghosting
        const tempKey = `upload_temp_${Date.now()}_${i}`;
        newPreviews[tempKey] = base64Data;

        // Upload to server endpoint
        let serverUrl = "";
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64Data,
              filename: file.name,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              serverUrl = data.url;
              newPreviews[serverUrl] = base64Data;
            }
          }
        } catch (uploadErr) {
          console.warn("[upload api warn, using local data uri]:", uploadErr);
        }

        // Use server URL if uploaded, fallback to base64 data to never fail
        const finalUrl = serverUrl || base64Data;
        newUrls.push(finalUrl);

        // Add to uploaded presets list so it shows up in the top list like the other presets!
        const cleanLabel = file.name.replace(/\.[^/.]+$/, "").slice(0, 18);
        saveStoredUploadedImage({
          id: `upload_${Date.now()}_${i}`,
          url: finalUrl,
          label: cleanLabel || `Photo ${i + 1}`,
          preview: base64Data,
        });
      }

      // Update in-memory preview cache
      setPreviewMap((prev) => ({ ...prev, ...newPreviews }));

      if (newUrls.length > 0) {
        // If current safeImages are just initial demo placeholders, replace them so user photo is cover #1
        const isDemoOnly =
          (safeImages.length === 1 && safeImages[0] === "/image/printing_products.jpg") ||
          (safeImages.length === 2 &&
            safeImages[0] === "/image/printing_products.jpg" &&
            safeImages[1] === "/service/Product Photography.jpeg");

        const combined = isDemoOnly ? newUrls : [...safeImages, ...newUrls];
        // The newly uploaded photo becomes the primary cover!
        const newCover = newUrls[0];
        onChange(combined, newCover);
      }
    } catch (err: any) {
      console.error("[upload error]:", err);
      setUrlError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetCover = (imgUrl: string) => {
    const filtered = safeImages.filter((img) => img !== imgUrl);
    const updated = [imgUrl, ...filtered];
    onChange(updated, imgUrl);
  };

  const handleRemoveImage = (imgUrl: string) => {
    if (safeImages.length <= 1) {
      alert("A product must have at least one photo.");
      return;
    }
    const updated = safeImages.filter((img) => img !== imgUrl);
    const newCover = currentCover === imgUrl ? updated[0] : currentCover;
    onChange(updated, newCover);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= safeImages.length) return;
    const reordered = [...safeImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    onChange(reordered, reordered[0]);
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
      {/* Header and Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Product Photos & Gallery ({safeImages.length})
            </label>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Upload multiple photos from different angles. First photo is used as main catalog cover.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-emerald-600 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Photos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {uploadProgress && (
        <div className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* URL Input Row */}
      <div className="space-y-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={newUrlInput}
            onChange={(e) => {
              setNewUrlInput(e.target.value);
              setUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Or paste image URL (e.g. /image/printing_products.jpg or https://...)"
            className="flex-1 text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-emerald-600"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add URL</span>
          </button>
        </div>
        {urlError && <p className="text-[11px] text-rose-600 font-medium">{urlError}</p>}
      </div>

      {/* ── Presets Chips: Uploaded Photos + Quick Catalog Presets ── */}
      <div className="space-y-2 pt-1">
        {/* Uploaded Photos Section (Shows up in the list like other presets) */}
        {uploadedPresets.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Your Uploaded Photos ({uploadedPresets.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {uploadedPresets.map((preset) => {
                const isAdded = safeImages.includes(preset.url);
                const isCover = currentCover === preset.url;
                const displaySrc = previewMap[preset.url] || preset.preview || preset.url;

                return (
                  <div
                    key={preset.id || preset.url}
                    className={`inline-flex items-center rounded-lg border transition-all text-xs font-medium ${
                      isCover
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold"
                        : isAdded
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      title={isCover ? "Current Cover Photo" : isAdded ? "Click to set as cover" : "Click to add to gallery"}
                      className="px-2 py-1 flex items-center gap-1.5 cursor-pointer"
                    >
                      {/* Mini thumbnail */}
                      <img
                        src={displaySrc}
                        alt=""
                        className="w-4 h-4 rounded object-cover border border-black/10"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span>{preset.label}</span>
                      {isCover ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : isAdded ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteUploadedPreset(e, preset.url)}
                      title="Remove from your uploaded presets"
                      className={`pr-1.5 pl-0.5 py-1 transition-colors cursor-pointer ${
                        isCover ? "text-emerald-100 hover:text-white" : "text-slate-300 hover:text-rose-600"
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Catalog Presets */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Quick Catalog Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_PRODUCT_IMAGE_PRESETS.map((preset) => {
              const isAdded = safeImages.includes(preset.url);
              const isCover = currentCover === preset.url;

              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                    isCover
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold"
                      : isAdded
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>{preset.label}</span>
                  {isCover ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : isAdded ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Plus className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Image Gallery Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
        {safeImages.map((imgUrl, idx) => {
          const isCover = currentCover === imgUrl || (idx === 0 && !safeImages.includes(currentCover));
          const displaySrc = previewMap[imgUrl] || imgUrl;

          return (
            <div
              key={`${imgUrl}-${idx}`}
              className={`relative group bg-white rounded-xl border overflow-hidden shadow-2xs transition-all ${
                isCover ? "border-emerald-600 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Thumbnail Container */}
              <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                <img
                  src={displaySrc}
                  alt={`Product view ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to preview cache or safe placeholder if URL load fails
                    if (previewMap[imgUrl] && e.currentTarget.src !== previewMap[imgUrl]) {
                      e.currentTarget.src = previewMap[imgUrl];
                    } else {
                      e.currentTarget.src = "/image/printing_products.jpg";
                    }
                  }}
                />

                {/* Cover Badge */}
                {isCover ? (
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Cover
                  </span>
                ) : (
                  <span className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-2xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                )}
              </div>

              {/* Action Toolbar on Card */}
              <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-slate-100">
                {!isCover ? (
                  <button
                    type="button"
                    onClick={() => handleSetCover(imgUrl)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold px-1.5 py-0.5 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    Set as Cover
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium px-1.5 py-0.5">
                    Main Photo
                  </span>
                )}

                <div className="flex items-center gap-0.5 ml-auto">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "left")}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                      title="Move earlier"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {idx < safeImages.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "right")}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                      title="Move later"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imgUrl)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer ml-0.5"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
