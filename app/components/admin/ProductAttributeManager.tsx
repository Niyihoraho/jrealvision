"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ProductAttribute,
  ProductAttributeValue,
  PRESET_ATTRIBUTES,
  getStoredGlobalAttributes,
  saveStoredGlobalAttributes,
} from "@/lib/productAttributes";
import {
  Plus,
  Trash2,
  X,
  Layers,
  Check,
  Sparkles,
} from "lucide-react";

interface ProductAttributeManagerProps {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
  // Kept for backwards compatibility
  onSyncTotalStock?: (totalStock: number) => void;
  totalStock?: number;
}

export default function ProductAttributeManager({
  attributes,
  onChange,
}: ProductAttributeManagerProps) {
  // Global dynamic presets list (retrieved from localStorage and DB)
  const [availablePresets, setAvailablePresets] = useState<ProductAttribute[]>([]);
  
  // Custom Attribute Name input state
  const [isAddingCustomAttr, setIsAddingCustomAttr] = useState(false);
  const [customAttrName, setCustomAttrName] = useState("");

  // Adding value inputs per attribute: key is attrId -> { name, colorCode }
  const [newValueInputs, setNewValueInputs] = useState<
    Record<string, { name: string; colorCode: string }>
  >({});

  // Preview interactive state
  const [previewSelections, setPreviewSelections] = useState<Record<string, string>>({});

  // Load and synchronize global presets (from localStorage + all products in DB)
  const refreshPresets = useCallback(() => {
    const current = getStoredGlobalAttributes();
    setAvailablePresets(current);
  }, []);

  useEffect(() => {
    refreshPresets();

    // Also fetch products from API to discover any custom attributes previously created
    let isMounted = true;
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.products) return;
        const currentSaved = getStoredGlobalAttributes();
        const mergedMap = new Map<string, ProductAttribute>();

        // Seed with current saved presets
        for (const p of currentSaved) {
          mergedMap.set(p.name.toLowerCase().trim(), p);
        }

        // Scan all products in database for any attributes (like size.finish, etc.)
        for (const prod of data.products) {
          if (Array.isArray(prod.attributes)) {
            for (const attr of prod.attributes) {
              if (attr && attr.name) {
                const key = attr.name.toLowerCase().trim();
                const existing = mergedMap.get(key);
                if (!existing) {
                  mergedMap.set(key, {
                    id: attr.id || `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    name: attr.name.trim(),
                    values: Array.isArray(attr.values) ? attr.values : [],
                    isCustom: true,
                  });
                } else if (Array.isArray(attr.values) && attr.values.length > existing.values.length) {
                  // Merge new choices if product has more choices
                  mergedMap.set(key, {
                    ...existing,
                    values: attr.values,
                  });
                }
              }
            }
          }
        }

        const updatedPresets = Array.from(mergedMap.values());
        if (updatedPresets.length > currentSaved.length) {
          saveStoredGlobalAttributes(updatedPresets);
          setAvailablePresets(updatedPresets);
        }
      })
      .catch((err) => {
        console.warn("[attribute sync warning]:", err);
      });

    const handleUpdate = () => {
      refreshPresets();
    };

    window.addEventListener("product_attributes_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("product_attributes_updated", handleUpdate);
    };
  }, [refreshPresets]);

  // Sync choices back into global presets whenever choices change
  const syncAttrValuesToPresets = (attrName: string, updatedValues: ProductAttributeValue[]) => {
    const current = getStoredGlobalAttributes();
    const updated = current.map((p) => {
      if (p.name.toLowerCase() === attrName.toLowerCase()) {
        return { ...p, values: updatedValues };
      }
      return p;
    });
    saveStoredGlobalAttributes(updated);
    setAvailablePresets(updated);
  };

  // Toggle preset: if already in attributes, toggle remove; if not, add with default choices
  const handleTogglePreset = (preset: ProductAttribute) => {
    const existingIndex = attributes.findIndex(
      (a) => a.name.toLowerCase() === preset.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Toggle off / remove
      const updated = attributes.filter((_, idx) => idx !== existingIndex);
      onChange(updated);
    } else {
      // Add preset
      const newAttr: ProductAttribute = {
        id: `attr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: preset.name,
        values: (preset.values || []).map((v) => ({
          id: `val_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: v.name,
          colorCode: v.colorCode,
        })),
      };
      onChange([...attributes, newAttr]);
    }
  };

  // Delete preset permanently from global list (for custom presets)
  const handleDeletePresetGlobally = (e: React.MouseEvent, presetId: string, presetName: string) => {
    e.stopPropagation();
    const isBasePreset = ["size", "color", "finish", "material"].includes(presetName.toLowerCase());
    if (isBasePreset) return;

    const current = getStoredGlobalAttributes();
    const filtered = current.filter(
      (p) => p.id !== presetId && p.name.toLowerCase() !== presetName.toLowerCase()
    );
    saveStoredGlobalAttributes(filtered);
    setAvailablePresets(filtered);
  };

  // Add custom attribute (e.g. "size.finish", "Paper Weight", etc.)
  const handleAddCustomAttribute = () => {
    const trimmed = customAttrName.trim();
    if (!trimmed) return;

    // Check if already in current product
    const inProduct = attributes.find(
      (a) => a.name.toLowerCase() === trimmed.toLowerCase()
    );

    // Check if exists in global presets
    const inPresets = availablePresets.find(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );

    const initialValues = inPresets?.values || [];

    if (!inProduct) {
      const newAttr: ProductAttribute = {
        id: `attr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        values: initialValues.map((v) => ({
          id: `val_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: v.name,
          colorCode: v.colorCode,
        })),
      };
      onChange([...attributes, newAttr]);
    }

    // Always ensure it's saved in the global presets list so user can choose it across all products
    if (!inPresets) {
      const newPreset: ProductAttribute = {
        id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        values: [],
        isCustom: true,
      };
      const updatedPresets = [...availablePresets, newPreset];
      saveStoredGlobalAttributes(updatedPresets);
      setAvailablePresets(updatedPresets);
    }

    setCustomAttrName("");
    setIsAddingCustomAttr(false);
  };

  // Remove attribute from current product
  const handleRemoveAttribute = (attrId: string) => {
    const updated = attributes.filter((a) => a.id !== attrId);
    onChange(updated);
  };

  // Add choice/value to attribute
  const handleAddValue = (attrId: string) => {
    const input = newValueInputs[attrId];
    if (!input || !input.name.trim()) return;

    const targetAttr = attributes.find((a) => a.id === attrId);
    if (!targetAttr) return;

    const valName = input.name.trim();
    // Prevent duplicate values in same attribute
    if (targetAttr.values.some((v) => v.name.toLowerCase() === valName.toLowerCase())) {
      setNewValueInputs((prev) => ({
        ...prev,
        [attrId]: { name: "", colorCode: "#000000" },
      }));
      return;
    }

    const newValue: ProductAttributeValue = {
      id: `val_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: valName,
      colorCode: input.colorCode || undefined,
    };

    const newValuesList = [...targetAttr.values, newValue];
    const updated = attributes.map((a) =>
      a.id === attrId ? { ...a, values: newValuesList } : a
    );
    onChange(updated);

    // Synchronize newly added choice value back to global presets so it's remembered everywhere
    syncAttrValuesToPresets(targetAttr.name, newValuesList);

    // Reset input
    setNewValueInputs((prev) => ({
      ...prev,
      [attrId]: { name: "", colorCode: "#000000" },
    }));
  };

  // Remove choice/value from attribute
  const handleRemoveValue = (attrId: string, valId: string) => {
    const targetAttr = attributes.find((a) => a.id === attrId);
    if (!targetAttr) return;

    const newValuesList = targetAttr.values.filter((v) => v.id !== valId);
    const updated = attributes.map((a) => {
      if (a.id !== attrId) return a;
      return { ...a, values: newValuesList };
    });
    onChange(updated);

    // Sync to global presets
    syncAttrValuesToPresets(targetAttr.name, newValuesList);
  };

  return (
    <div className="space-y-4">
      {/* Header and Dynamic Presets Selector */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-700" />
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Product Attributes & Variants
            </label>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure customer options (e.g. Size, Color, Finish, Material) for storefront selection.
          </p>
        </div>

        {/* Global Dynamic Presets Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {availablePresets.map((preset) => {
            const isAdded = attributes.some(
              (a) => a.name.toLowerCase() === preset.name.toLowerCase()
            );
            const isBase = ["size", "color", "finish", "material"].includes(preset.name.toLowerCase());

            return (
              <div
                key={preset.id || preset.name}
                className={`inline-flex items-center rounded-lg border transition-all text-xs font-medium ${
                  isAdded
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-600 hover:text-emerald-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleTogglePreset(preset)}
                  title={isAdded ? `Click to remove ${preset.name}` : `Click to add ${preset.name}`}
                  className="px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                >
                  {isAdded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{preset.name}</span>
                </button>

                {/* Allow removing custom preset from global list */}
                {!isBase && (
                  <button
                    type="button"
                    onClick={(e) => handleDeletePresetGlobally(e, preset.id, preset.name)}
                    title={`Delete "${preset.name}" preset from list`}
                    className="pr-1.5 pl-0.5 py-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setIsAddingCustomAttr(true)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Custom Option</span>
          </button>
        </div>

        {/* Custom Attribute Input Dialog */}
        {isAddingCustomAttr && (
          <div className="p-3 bg-white rounded-lg border border-emerald-300 flex items-center gap-2 shadow-2xs animate-in fade-in duration-150">
            <input
              type="text"
              autoFocus
              value={customAttrName}
              onChange={(e) => setCustomAttrName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomAttribute();
                } else if (e.key === "Escape") {
                  setIsAddingCustomAttr(false);
                }
              }}
              placeholder="e.g. Size.Finish, Paper Weight, Frame Style, Sleeve Length..."
              className="flex-1 text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleAddCustomAttribute}
              className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-2xs"
            >
              Add Option
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCustomAttr(false)}
              className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Attributes List */}
      {attributes.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-white text-center space-y-1">
          <p className="text-xs font-semibold text-slate-600">No options configured for this product yet.</p>
          <p className="text-[11px] text-slate-400">
            Click any preset above (e.g. <strong>Size</strong>, <strong>Finish</strong>, or <strong>Custom Option</strong>) to add customer choices.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attr) => {
            const isColor = attr.name.toLowerCase() === "color";
            const valInput = newValueInputs[attr.id] || {
              name: "",
              colorCode: "#000000",
            };

            return (
              <div
                key={attr.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs"
              >
                {/* Attribute Row Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                      Option: {attr.name}
                    </span>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {attr.values.length} choices
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(attr.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    title="Remove this option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Values List */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val) => (
                      <div
                        key={val.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs shadow-2xs"
                      >
                        {/* Color Dot if Color */}
                        {isColor && val.colorCode && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                            style={{ backgroundColor: val.colorCode }}
                          />
                        )}

                        <span className="font-semibold text-slate-900">
                          {val.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveValue(attr.id, val.id)}
                          className="text-slate-300 hover:text-rose-600 ml-1 cursor-pointer transition-colors"
                          title="Delete choice"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {attr.values.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No choices added yet. Type below to add choices.</span>
                    )}
                  </div>

                  {/* Add New Value to this Attribute Inline Form */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder={`Add ${attr.name} choice (e.g. ${
                        attr.name.toLowerCase() === "size"
                          ? "3XL"
                          : attr.name.toLowerCase() === "color"
                          ? "Navy Blue"
                          : attr.name.toLowerCase().includes("finish")
                          ? "Gloss UV, Matte..."
                          : "Option name"
                      })`}
                      value={valInput.name}
                      onChange={(e) =>
                        setNewValueInputs((prev) => ({
                          ...prev,
                          [attr.id]: {
                            ...valInput,
                            name: e.target.value,
                          },
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddValue(attr.id);
                        }
                      }}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                    />

                    {isColor && (
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={valInput.colorCode || "#000000"}
                          onChange={(e) =>
                            setNewValueInputs((prev) => ({
                              ...prev,
                              [attr.id]: {
                                ...valInput,
                                colorCode: e.target.value,
                              },
                            }))
                          }
                          className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                          title="Pick color"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddValue(attr.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Customer Selector Preview Box */}
      {attributes.length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Customer Selection Preview
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Live storefront view
            </span>
          </div>

          <div className="space-y-3">
            {attributes.map((attr) => {
              const selectedValName =
                previewSelections[attr.id] || attr.values[0]?.name;

              return (
                <div key={attr.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      {attr.name}
                    </span>
                    {selectedValName && (
                      <span className="text-[11px] text-slate-500">
                        Selected: <strong className="text-slate-800">{selectedValName}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((v) => {
                      const isSelected = selectedValName === v.name;

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() =>
                            setPreviewSelections((prev) => ({
                              ...prev,
                              [attr.id]: v.name,
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {v.colorCode && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          )}
                          <span>{v.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
