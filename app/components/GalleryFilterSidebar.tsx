import React, { useState } from "react";
import { SlidersHorizontal, Check, ChevronDown, ChevronUp, X, Sparkles, ShieldCheck } from "lucide-react";

export interface GalleryFilterProps {
  mediums: { name: string; count: number }[];
  selectedMediums: string[];
  onToggleMedium: (medium: string) => void;

  cities: { name: string; count: number }[];
  selectedCities: string[];
  onToggleCity: (city: string) => void;

  priceRange: number;
  maxPrice: number;
  onChangePriceRange: (val: number) => void;

  onlyAvailable: boolean;
  onToggleOnlyAvailable: () => void;
  availableCount: number;

  onlyWithCertificate: boolean;
  onToggleOnlyWithCertificate: () => void;
  certificateCount: number;

  onlyFramed: boolean;
  onToggleOnlyFramed: () => void;
  framedCount: number;

  onClearAll: () => void;
  hasActiveFilters: boolean;
  totalFilteredCount: number;
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export default function GalleryFilterSidebar({
  mediums,
  selectedMediums,
  onToggleMedium,
  cities,
  selectedCities,
  onToggleCity,
  priceRange,
  maxPrice,
  onChangePriceRange,
  onlyAvailable,
  onToggleOnlyAvailable,
  availableCount,
  onlyWithCertificate,
  onToggleOnlyWithCertificate,
  certificateCount,
  onlyFramed,
  onToggleOnlyFramed,
  framedCount,
  onClearAll,
  hasActiveFilters,
  totalFilteredCount,
  onCloseMobile,
  isMobileDrawer = false,
}: GalleryFilterProps) {
  const [showAllMediums, setShowAllMediums] = useState(false);

  const visibleMediums = showAllMediums ? mediums : mediums.slice(0, 5);

  const sliderPercent = maxPrice > 0 ? Math.min(100, Math.max(0, (priceRange / maxPrice) * 100)) : 100;

  const totalSelections =
    selectedMediums.length +
    selectedCities.length +
    (onlyAvailable ? 1 : 0) +
    (onlyWithCertificate ? 1 : 0) +
    (onlyFramed ? 1 : 0) +
    (priceRange < maxPrice ? 1 : 0);

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
        isMobileDrawer ? "p-5" : "p-6"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-900">
            <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Filters</h2>
            {totalSelections > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#128C38]/10 text-[#128C38] text-[11px] font-bold flex items-center justify-center">
                {totalSelections}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className={`text-xs font-semibold transition-colors ${
              hasActiveFilters
                ? "text-[#128C38] hover:text-[#0B5424] hover:underline cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            Clear All
          </button>
          {isMobileDrawer && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Art Mediums Section (Category equivalent for Gallery) */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Mediums</h3>
          {selectedMediums.length > 0 && (
            <button
              onClick={() => selectedMediums.forEach((m) => onToggleMedium(m))}
              className="text-[11px] font-medium text-gray-400 hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {visibleMediums.map((med) => {
            const isChecked = selectedMediums.includes(med.name);
            return (
              <label
                key={med.name}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleMedium(med.name);
                }}
                className="flex items-center gap-3 cursor-pointer group select-none py-0.5"
              >
                {/* Modern Custom Checkbox */}
                <div
                  className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center shrink-0 ${
                    isChecked
                      ? "bg-[#128C38] border-[#128C38] text-white shadow-xs"
                      : "border-gray-300 bg-white group-hover:border-gray-400"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                {/* Label + Count */}
                <div className="flex items-center gap-1.5 text-sm">
                  <span
                    className={`font-medium transition-colors ${
                      isChecked ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {med.name}
                  </span>
                  <span className="text-gray-400 font-normal text-xs">({med.count})</span>
                </div>
              </label>
            );
          })}
        </div>

        {mediums.length > 5 && (
          <button
            onClick={() => setShowAllMediums(!showAllMediums)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#128C38] hover:text-[#0B5424] transition-colors"
          >
            {showAllMediums ? (
              <>
                Show less <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Show all ({mediums.length}) <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Price Range Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Price Range</h3>
          <span className="text-[11px] font-semibold text-[#128C38] bg-[#128C38]/10 px-2 py-0.5 rounded-md">
            Up to {priceRange.toLocaleString()} RWF
          </span>
        </div>

        <div className="relative py-2">
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={10000}
            value={priceRange}
            onChange={(e) => onChangePriceRange(Number(e.target.value))}
            className="jreal-slider w-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #128C38 0%, #128C38 ${sliderPercent}%, #E5E7EB ${sliderPercent}%, #E5E7EB 100%)`,
            }}
            aria-label="Art price range filter"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-1">
          <span>0 RWF</span>
          <span>{priceRange.toLocaleString()} RWF</span>
        </div>
      </div>

      {/* Artist Origin / Cities */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Artist Location</h3>
          {selectedCities.length > 0 && (
            <button
              onClick={() => selectedCities.forEach((c) => onToggleCity(c))}
              className="text-[11px] font-medium text-gray-400 hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {cities.map((city) => {
            const isChecked = selectedCities.includes(city.name);
            return (
              <label
                key={city.name}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleCity(city.name);
                }}
                className="flex items-center gap-3 cursor-pointer group select-none py-0.5"
              >
                <div
                  className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center shrink-0 ${
                    isChecked
                      ? "bg-[#128C38] border-[#128C38] text-white shadow-xs"
                      : "border-gray-300 bg-white group-hover:border-gray-400"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                <div className="flex items-center gap-1.5 text-sm">
                  <span
                    className={`font-medium transition-colors ${
                      isChecked ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {city.name}
                  </span>
                  <span className="text-gray-400 font-normal text-xs">({city.count})</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Artwork Status & Details */}
      <div className="pt-5 space-y-2.5">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-3">Artwork Status</h3>

        {/* Available only */}
        <label
          onClick={(e) => {
            e.preventDefault();
            onToggleOnlyAvailable();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none py-0.5"
        >
          <div
            className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center shrink-0 ${
              onlyAvailable
                ? "bg-[#128C38] border-[#128C38] text-white shadow-xs"
                : "border-gray-300 bg-white group-hover:border-gray-400"
            }`}
          >
            {onlyAvailable && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={`font-medium transition-colors ${
                onlyAvailable ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"
              }`}
            >
              Available Now
            </span>
            <span className="text-gray-400 font-normal text-xs">({availableCount})</span>
          </div>
        </label>

        {/* Certificate included */}
        <label
          onClick={(e) => {
            e.preventDefault();
            onToggleOnlyWithCertificate();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none py-0.5"
        >
          <div
            className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center shrink-0 ${
              onlyWithCertificate
                ? "bg-[#128C38] border-[#128C38] text-white shadow-xs"
                : "border-gray-300 bg-white group-hover:border-gray-400"
            }`}
          >
            {onlyWithCertificate && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={`font-medium transition-colors ${
                onlyWithCertificate ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"
              }`}
            >
              COA Certificate
            </span>
            <span className="text-gray-400 font-normal text-xs">({certificateCount})</span>
          </div>
        </label>

        {/* Framed Only */}
        <label
          onClick={(e) => {
            e.preventDefault();
            onToggleOnlyFramed();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none py-0.5"
        >
          <div
            className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center shrink-0 ${
              onlyFramed
                ? "bg-[#128C38] border-[#128C38] text-white shadow-xs"
                : "border-gray-300 bg-white group-hover:border-gray-400"
            }`}
          >
            {onlyFramed && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={`font-medium transition-colors ${
                onlyFramed ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"
              }`}
            >
              Framed Artwork
            </span>
            <span className="text-gray-400 font-normal text-xs">({framedCount})</span>
          </div>
        </label>
      </div>

      {/* Mobile Drawer Bottom Apply Button */}
      {isMobileDrawer && onCloseMobile && (
        <div className="mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={onCloseMobile}
            className="w-full py-3 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold text-sm rounded-xl shadow-md transition-colors"
          >
            Show {totalFilteredCount} Artworks
          </button>
        </div>
      )}
    </div>
  );
}
