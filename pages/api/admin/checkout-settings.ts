import type { NextApiRequest, NextApiResponse } from "next";
import {
  DEFAULT_DELIVERY_OPTIONS,
  DEFAULT_PAYMENT_OPTIONS,
  DeliveryOption,
  PaymentOption,
  CheckoutSettings,
} from "@/lib/checkoutSettings";

// In-memory persistence for server lifecycle
let serverSettings: CheckoutSettings = {
  deliveryOptions: [...DEFAULT_DELIVERY_OPTIONS],
  paymentOptions: [...DEFAULT_PAYMENT_OPTIONS],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return res.status(200).json(serverSettings);
  }

  if (req.method === "POST" || req.method === "PUT") {
    const { deliveryOptions, paymentOptions } = req.body as Partial<CheckoutSettings>;

    if (Array.isArray(deliveryOptions)) {
      serverSettings.deliveryOptions = deliveryOptions as DeliveryOption[];
    }
    if (Array.isArray(paymentOptions)) {
      serverSettings.paymentOptions = paymentOptions as PaymentOption[];
    }

    return res.status(200).json({
      success: true,
      message: "Checkout settings updated successfully",
      settings: serverSettings,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
