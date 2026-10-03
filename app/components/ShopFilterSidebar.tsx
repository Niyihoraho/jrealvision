import React, { useState } from "react";
import { SlidersHorizontal, Check, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";

export interface ShopFilterProps {
  categories: { id: string; name: string; count: number }[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  priceRange: number;
  maxPrice: number;
  onChangePriceRange: (val: number) => void;
  onlyCustomizable: boolean;
  onToggleCustomizable: () => void;
  onlyBudget: boolean;
  onToggleBudget: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  customizableCount: number;
  budgetCount: number;
  totalFilteredCount: number;
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export default function ShopFilterSidebar({
  categories,
  selectedCategories,
  onToggleCategory,
  priceRange,
  maxPrice,
  onChangePriceRange,
  onlyCustomizable,
  onToggleCustomizable,
  onlyBudget,
  onToggleBudget,
  onClearAll,
  hasActiveFilters,
  customizableCount,
  budgetCount,
  totalFilteredCount,
  onCloseMobile,
  isMobileDrawer = false,
}: ShopFilterProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Filter categories by local micro-search if present
  const filteredCategoryList = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const visibleCategories = showAllCategories
    ? filteredCategoryList
    : filteredCategoryList.slice(0, 6);

  // Compute percentage for slider gradient
  const sliderPercent = maxPrice > 0 ? Math.min(100, Math.max(0, (priceRange / maxPrice) * 100)) : 100;

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
            {selectedCategories.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#128C38]/10 text-[#128C38] text-[11px] font-bold flex items-center justify-center">
                {selectedCategories.length}
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

      {/* Categories Section */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Categories</h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => selectedCategories.forEach((id) => onToggleCategory(id))}
              className="text-[11px] font-medium text-gray-400 hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>

        {/* Micro Category Filter if > 6 categories */}
        {categories.length > 6 && showAllCategories && (
          <div className="mb-3">
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Filter categories..."
              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#128C38] focus:bg-white"
            />
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-2.5">
          {visibleCategories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);
            return (
              <label
                key={cat.id}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleCategory(cat.id);
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
                    {cat.name}
                  </span>
                  <span className="text-gray-400 font-normal text-xs">({cat.count})</span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Show More / Show Less Toggle */}
        {categories.length > 6 && (
          <button
            onClick={() => {
              setShowAllCategories(!showAllCategories);
              if (showAllCategories) setCategorySearch("");
            }}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#128C38] hover:text-[#0B5424] transition-colors"
          >
            {showAllCategories ? (
              <>
                Show less <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Show all ({categories.length}) <ChevronDown className="w-3.5 h-3.5" />
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

        {/* Range Slider Track */}
        <div className="relative py-2">
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={1000}
            value={priceRange}
            onChange={(e) => onChangePriceRange(Number(e.target.value))}
            className="jreal-slider w-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #128C38 0%, #128C38 ${sliderPercent}%, #E5E7EB ${sliderPercent}%, #E5E7EB 100%)`,
            }}
            aria-label="Price range filter"
          />
        </div>

        {/* Price Boundary Labels */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-1">
          <span>0 RWF</span>
          <span>{priceRange.toLocaleString()} RWF</span>
        </div>
      </div>

      {/* Product Features & Availability */}
      <div className="pt-5 space-y-2.5">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-3">Features</h3>

        {/* Customizable Toggle */}
        <label
          onClick={(e) => {
            e.preventDefault();
            onToggleCustomizable();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none py-0.5"
        >
          <div
            className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center shrink-0 ${
              onlyCustomizable
                ? "bg-[#128C38] border-[#128C38] text-white shadow-xs"
                : "border-gray-300 bg-white group-hover:border-gray-400"
            }`}
          >
            {onlyCustomizable && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={`font-medium transition-colors ${
                onlyCustomizable ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"
              }`}
            >
              Customizable Only
            </span>
            <span className="text-gray-400 font-normal text-xs">({customizableCount})</span>
          </div>
        </label>

        {/* Budget Friendly Toggle */}
        <label
          onClick={(e) => {
            e.preventDefault();
            onToggleBudget();
          }}
          className="flex items-center gap-3 cursor-pointer group select-none py-0.5"
        >
          <div
            className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center shrink-0 ${
              onlyBudget
                ? "bg-[#128C38] border-[#128C38] text-white shadow-xs"
                : "border-gray-300 bg-white group-hover:border-gray-400"
            }`}
          >
            {onlyBudget && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={`font-medium transition-colors ${
                onlyBudget ? "text-gray-900 font-semibold" : "text-gray-700 group-hover:text-gray-900"
              }`}
            >
              Budget (&lt; 15,000 RWF)
            </span>
            <span className="text-gray-400 font-normal text-xs">({budgetCount})</span>
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
            Show {totalFilteredCount} Products
          </button>
        </div>
      )}
    </div>
  );
}
