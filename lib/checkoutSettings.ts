export interface DeliveryOption {
  id: string;
  name: string;
  code: string;
  type: "delivery" | "pickup";
  fee: number;
  estimatedTime: string;
  description: string;
  icon?: string; // 'truck' | 'zap' | 'store' | 'package'
  isActive: boolean;
}

export interface PaymentOption {
  id: string;
  name: string;
  code: string; // 'momo' | 'airtel' | 'bank' | 'cod' | custom
  subtitle: string;
  accountNumber?: string; // e.g. merchant code or bank account
  recipientName?: string;
  instructions?: string;
  badgeText?: string;
  badgeBg?: string;
  badgeTextColor?: string;
  isActive: boolean;
}

export interface CheckoutSettings {
  deliveryOptions: DeliveryOption[];
  paymentOptions: PaymentOption[];
}

export const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "del_standard",
    name: "Standard Delivery",
    code: "standard",
    type: "delivery",
    fee: 2500,
    estimatedTime: "1–2 business days",
    description: "Door-to-door delivery across Kigali and nearby districts",
    icon: "package",
    isActive: true,
  },
  {
    id: "del_express",
    name: "Express Same-Day",
    code: "express",
    type: "delivery",
    fee: 5000,
    estimatedTime: "2–4 hours",
    description: "Priority dispatch with instant dedicated courier",
    icon: "zap",
    isActive: true,
  },
  {
    id: "del_pickup",
    name: "Studio Pickup",
    code: "pickup",
    type: "pickup",
    fee: 0,
    estimatedTime: "Ready in 24 hrs",
    description: "Pick up at JREAL VISION DESIGN Studio, KG 14 Ave, Kicukiro Centre",
    icon: "store",
    isActive: true,
  },
];

export const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "pay_momo",
    name: "MTN Mobile Money",
    code: "momo",
    subtitle: "Instant MoMo prompt & merchant code",
    accountNumber: "*182*8*1*052980#",
    recipientName: "JREAL VISION DESIGN LTD",
    instructions: "Dial the merchant code *182*8*1*052980# or approve the push notification on your MTN line.",
    badgeText: "MoMo",
    badgeBg: "#FFCC00",
    badgeTextColor: "#000000",
    isActive: true,
  },
  {
    id: "pay_airtel",
    name: "Airtel Money",
    code: "airtel",
    subtitle: "Instant mobile wallet transfer",
    accountNumber: "*182*8*...#",
    recipientName: "JREAL VISION DESIGN LTD",
    instructions: "Transfer to merchant code using Airtel Money menu or approve instant request.",
    badgeText: "AIR",
    badgeBg: "#DC2626",
    badgeTextColor: "#FFFFFF",
    isActive: true,
  },
  {
    id: "pay_bank",
    name: "Bank Wire Transfer",
    code: "bank",
    subtitle: "BK, I&M, Equity, Cogebanque",
    accountNumber: "BK: 00040-0694938-22",
    recipientName: "Bank of Kigali — JREAL VISION LTD",
    instructions: "Deposit or transfer to the account above. Upload or share proof of payment on WhatsApp.",
    badgeText: "BANK",
    badgeBg: "#2563EB",
    badgeTextColor: "#FFFFFF",
    isActive: true,
  },
  {
    id: "pay_cod",
    name: "Pay on Delivery",
    code: "cod",
    subtitle: "Cash or MoMo to courier on arrival",
    accountNumber: "Pay courier directly",
    recipientName: "Authorized Courier",
    instructions: "Inspect your items when courier arrives, then settle via cash or MoMo.",
    badgeText: "COD",
    badgeBg: "#4B5563",
    badgeTextColor: "#FFFFFF",
    isActive: true,
  },
  {
    id: "pay_sandbox_test",
    name: "🧪 Instant Test Simulation",
    code: "test_sandbox",
    subtitle: "Simulate purchase · Test email & dashboard alerts",
    accountNumber: "SANDBOX-MODE-2026",
    recipientName: "JREAL Gateway Simulation",
    instructions: "Instant order completion with simulated payment. Dispatches customer confirmation and admin sales alerts to test order tracking while provider gateway credentials are being configured.",
    badgeText: "TEST",
    badgeBg: "#10B981",
    badgeTextColor: "#FFFFFF",
    isActive: true,
  },
];

export const STORAGE_KEY_CHECKOUT_SETTINGS = "jreal_checkout_settings_v1";

export function getStoredCheckoutSettings(): CheckoutSettings {
  if (typeof window === "undefined") {
    return {
      deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
      paymentOptions: DEFAULT_PAYMENT_OPTIONS,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKOUT_SETTINGS);
    if (!raw) {
      return {
        deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
        paymentOptions: DEFAULT_PAYMENT_OPTIONS,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      deliveryOptions:
        Array.isArray(parsed.deliveryOptions) && parsed.deliveryOptions.length > 0
          ? parsed.deliveryOptions
          : DEFAULT_DELIVERY_OPTIONS,
      paymentOptions:
        Array.isArray(parsed.paymentOptions) && parsed.paymentOptions.length > 0
          ? parsed.paymentOptions
          : DEFAULT_PAYMENT_OPTIONS,
    };
  } catch {
    return {
      deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
      paymentOptions: DEFAULT_PAYMENT_OPTIONS,
    };
  }
}

export function saveStoredCheckoutSettings(settings: CheckoutSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CHECKOUT_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event("checkout_settings_updated"));
  } catch (err) {
    console.error("Failed to save checkout settings:", err);
  }
}
