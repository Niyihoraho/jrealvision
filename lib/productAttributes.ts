export interface ProductAttributeValue {
  id: string;
  name: string;
  stock?: number;
  colorCode?: string;
  priceOffset?: number;
  inStock?: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string; // e.g. "Size", "Color", "Finish", "Material"
  values: ProductAttributeValue[];
  isCustom?: boolean;
}

export const PRESET_ATTRIBUTES: ProductAttribute[] = [
  {
    id: "attr_size",
    name: "Size",
    values: [
      { id: "val_s", name: "S" },
      { id: "val_m", name: "M" },
      { id: "val_l", name: "L" },
      { id: "val_xl", name: "XL" },
      { id: "val_2xl", name: "2XL" },
    ],
  },
  {
    id: "attr_color",
    name: "Color",
    values: [
      { id: "val_white", name: "White", colorCode: "#FFFFFF" },
      { id: "val_black", name: "Black", colorCode: "#0F172A" },
      { id: "val_navy", name: "Navy", colorCode: "#1E3A8A" },
      { id: "val_red", name: "Red", colorCode: "#DC2626" },
      { id: "val_grey", name: "Grey", colorCode: "#9CA3AF" },
    ],
  },
  {
    id: "attr_finish",
    name: "Finish",
    values: [
      { id: "val_standard", name: "Standard Matte" },
      { id: "val_gloss", name: "Glossy UV" },
      { id: "val_softtouch", name: "Soft-Touch Velvet" },
      { id: "val_goldfoil", name: "Gold Foil Embossed" },
    ],
  },
  {
    id: "attr_material",
    name: "Material",
    values: [
      { id: "val_cotton220", name: "100% Pique Cotton (220 GSM)" },
      { id: "val_polyblend", name: "Poly-Cotton Breathable Blend" },
      { id: "val_organic", name: "Organic Eco Cotton" },
    ],
  },
];

export const STORAGE_KEY_GLOBAL_ATTRIBUTES = "jreal_global_attributes_v2";

export function getStoredGlobalAttributes(): ProductAttribute[] {
  if (typeof window === "undefined") return PRESET_ATTRIBUTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GLOBAL_ATTRIBUTES);
    if (!raw) {
      // Check legacy v1 key
      const legacyRaw = localStorage.getItem("jreal_global_attributes_v1");
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return PRESET_ATTRIBUTES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return PRESET_ATTRIBUTES;

    // Ensure all base presets exist
    const merged = [...PRESET_ATTRIBUTES];
    for (const item of parsed) {
      const idx = merged.findIndex(
        (m) => m.name.toLowerCase() === item.name.toLowerCase()
      );
      if (idx >= 0) {
        // Merge values if custom values were added
        if (Array.isArray(item.values) && item.values.length > 0) {
          merged[idx] = { ...merged[idx], values: item.values };
        }
      } else {
        merged.push({ ...item, isCustom: true });
      }
    }
    return merged;
  } catch {
    return PRESET_ATTRIBUTES;
  }
}

export function saveStoredGlobalAttributes(attrs: ProductAttribute[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_GLOBAL_ATTRIBUTES, JSON.stringify(attrs));
    window.dispatchEvent(new Event("product_attributes_updated"));
  } catch (err) {
    console.error("Failed to save global attributes:", err);
  }
}

/**
 * Returns total stock sum across all attribute values
 */
export function calculateAttributeStock(attributes?: ProductAttribute[]): number {
  if (!attributes || attributes.length === 0) return 0;
  const primaryWithStock = attributes.find((a) =>
    a.values.some((v) => typeof v.stock === "number" && v.stock > 0)
  );
  if (!primaryWithStock) return 0;
  return primaryWithStock.values.reduce((sum, v) => sum + (v.stock || 0), 0);
}

export function createDefaultApparelAttributes(): ProductAttribute[] {
  return [
    {
      id: "attr_size",
      name: "Size",
      values: [
        { id: "val_s", name: "S" },
        { id: "val_m", name: "M" },
        { id: "val_l", name: "L" },
        { id: "val_xl", name: "XL" },
        { id: "val_2xl", name: "2XL" },
      ],
    },
    {
      id: "attr_color",
      name: "Color",
      values: [
        { id: "val_white", name: "White", colorCode: "#FFFFFF" },
        { id: "val_black", name: "Black", colorCode: "#0F172A" },
        { id: "val_navy", name: "Navy", colorCode: "#1E3A8A" },
        { id: "val_red", name: "Red", colorCode: "#DC2626" },
        { id: "val_grey", name: "Grey", colorCode: "#9CA3AF" },
      ],
    },
  ];
}

