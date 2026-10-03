"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  Package,
  Zap,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
} from "lucide-react";
import {
  DeliveryOption,
  PaymentOption,
  CheckoutSettings,
  DEFAULT_DELIVERY_OPTIONS,
  DEFAULT_PAYMENT_OPTIONS,
  getStoredCheckoutSettings,
  saveStoredCheckoutSettings,
} from "@/lib/checkoutSettings";

export default function AdminCheckoutSettings() {
  const [activeTab, setActiveTab] = useState<"delivery" | "payment" | "preview">("delivery");
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delivery Modal
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [editingDeliveryId, setEditingDeliveryId] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<Omit<DeliveryOption, "id">>({
    name: "",
    code: "",
    type: "delivery",
    fee: 2500,
    estimatedTime: "",
    description: "",
    icon: "truck",
    isActive: true,
  });

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<Omit<PaymentOption, "id">>({
    name: "",
    code: "momo",
    subtitle: "",
    accountNumber: "",
    recipientName: "",
    instructions: "",
    badgeText: "PAY",
    badgeBg: "#128C38",
    badgeTextColor: "#FFFFFF",
    isActive: true,
  });

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "delivery" | "payment";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "delivery",
    id: "",
    name: "",
  });

  // Load settings on mount
  useEffect(() => {
    // 1. From local storage or default
    const local = getStoredCheckoutSettings();
    setDeliveryOptions(local.deliveryOptions);
    setPaymentOptions(local.paymentOptions);

    // 2. Fetch from server API
    fetch("/api/admin/checkout-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CheckoutSettings | null) => {
        if (data) {
          if (Array.isArray(data.deliveryOptions) && data.deliveryOptions.length > 0) {
            setDeliveryOptions(data.deliveryOptions);
          }
          if (Array.isArray(data.paymentOptions) && data.paymentOptions.length > 0) {
            setPaymentOptions(data.paymentOptions);
          }
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save changes locally and to API
  const handleSaveAll = async (
    customDeliveries?: DeliveryOption[],
    customPayments?: PaymentOption[]
  ) => {
    const dels = customDeliveries || deliveryOptions;
    const pays = customPayments || paymentOptions;

    setIsSaving(true);
    const settings: CheckoutSettings = {
      deliveryOptions: dels,
      paymentOptions: pays,
    };

    saveStoredCheckoutSettings(settings);

    try {
      await fetch("/api/admin/checkout-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      showToast("Checkout & Payment settings saved successfully!");
    } catch {
      showToast("Saved to browser storage successfully!");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Delivery Active
  const handleToggleDeliveryActive = (id: string) => {
    const updated = deliveryOptions.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setDeliveryOptions(updated);
    handleSaveAll(updated, paymentOptions);
  };

  // Toggle Payment Active
  const handleTogglePaymentActive = (id: string) => {
    const updated = paymentOptions.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setPaymentOptions(updated);
    handleSaveAll(deliveryOptions, updated);
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset Delivery and Payment methods to Rwandan standard defaults?"
      )
    ) {
      setDeliveryOptions(DEFAULT_DELIVERY_OPTIONS);
      setPaymentOptions(DEFAULT_PAYMENT_OPTIONS);
      handleSaveAll(DEFAULT_DELIVERY_OPTIONS, DEFAULT_PAYMENT_OPTIONS);
      showToast("Reset to default methods successfully!");
    }
  };

  // Open Delivery Modal (Add or Edit)
  const handleOpenDeliveryModal = (item?: DeliveryOption) => {
    if (item) {
      setEditingDeliveryId(item.id);
      setDeliveryForm({
        name: item.name,
        code: item.code,
        type: item.type,
        fee: item.fee,
        estimatedTime: item.estimatedTime,
        description: item.description,
        icon: item.icon || "truck",
        isActive: item.isActive,
      });
    } else {
      setEditingDeliveryId(null);
      setDeliveryForm({
        name: "",
        code: `method_${Date.now().toString(36)}`,
        type: "delivery",
        fee: 3000,
        estimatedTime: "24–48 hours",
        description: "",
        icon: "truck",
        isActive: true,
      });
    }
    setIsDeliveryModalOpen(true);
  };

  const handleSaveDeliveryModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryForm.name.trim()) return;

    let updated: DeliveryOption[];
    if (editingDeliveryId) {
      updated = deliveryOptions.map((item) =>
        item.id === editingDeliveryId
          ? {
              ...item,
              ...deliveryForm,
              name: deliveryForm.name.trim(),
              fee: Number(deliveryForm.fee) || 0,
            }
          : item
      );
    } else {
      const newItem: DeliveryOption = {
        id: `del_${Date.now()}`,
        ...deliveryForm,
        name: deliveryForm.name.trim(),
        fee: Number(deliveryForm.fee) || 0,
      };
      updated = [...deliveryOptions, newItem];
    }

    setDeliveryOptions(updated);
    setIsDeliveryModalOpen(false);
    handleSaveAll(updated, paymentOptions);
    showToast(editingDeliveryId ? "Delivery method updated!" : "New delivery method added!");
  };

  // Open Payment Modal (Add or Edit)
  const handleOpenPaymentModal = (item?: PaymentOption) => {
    if (item) {
      setEditingPaymentId(item.id);
      setPaymentForm({
        name: item.name,
        code: item.code,
        subtitle: item.subtitle,
        accountNumber: item.accountNumber || "",
        recipientName: item.recipientName || "",
        instructions: item.instructions || "",
        badgeText: item.badgeText || "PAY",
        badgeBg: item.badgeBg || "#128C38",
        badgeTextColor: item.badgeTextColor || "#FFFFFF",
        isActive: item.isActive,
      });
    } else {
      setEditingPaymentId(null);
      setPaymentForm({
        name: "",
        code: "custom",
        subtitle: "",
        accountNumber: "",
        recipientName: "JREAL VISION DESIGN LTD",
        instructions: "",
        badgeText: "PAY",
        badgeBg: "#128C38",
        badgeTextColor: "#FFFFFF",
        isActive: true,
      });
    }
    setIsPaymentModalOpen(true);
  };

  const handleSavePaymentModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.name.trim()) return;

    let updated: PaymentOption[];
    if (editingPaymentId) {
      updated = paymentOptions.map((item) =>
        item.id === editingPaymentId
          ? {
              ...item,
              ...paymentForm,
              name: paymentForm.name.trim(),
            }
          : item
      );
    } else {
      const newItem: PaymentOption = {
        id: `pay_${Date.now()}`,
        ...paymentForm,
        name: paymentForm.name.trim(),
      };
      updated = [...paymentOptions, newItem];
    }

    setPaymentOptions(updated);
    setIsPaymentModalOpen(false);
    handleSaveAll(deliveryOptions, updated);
    showToast(editingPaymentId ? "Payment method updated!" : "New payment method added!");
  };

  // Delete Action Confirm
  const executeDelete = () => {
    if (deleteConfirm.type === "delivery") {
      const updated = deliveryOptions.filter((d) => d.id !== deleteConfirm.id);
      setDeliveryOptions(updated);
      handleSaveAll(updated, paymentOptions);
      showToast(`Removed delivery method "${deleteConfirm.name}"`);
    } else {
      const updated = paymentOptions.filter((p) => p.id !== deleteConfirm.id);
      setPaymentOptions(updated);
      handleSaveAll(deliveryOptions, updated);
      showToast(`Removed payment method "${deleteConfirm.name}"`);
    }
    setDeleteConfirm({ isOpen: false, type: "delivery", id: "", name: "" });
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "store":
        return <Store className="w-4 h-4 text-emerald-600" />;
      case "package":
        return <Package className="w-4 h-4 text-blue-500" />;
      default:
        return <Truck className="w-4 h-4 text-[#128C38]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Checkout Delivery & Payment Methods
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, enable/disable delivery speeds and payment options visible to customers at checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Reset to default Rwandan standards"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveAll()}
            className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving…" : "Save All"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "delivery"
              ? "text-[#128C38] border-b-2 border-[#128C38]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery Methods ({deliveryOptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payment")}
          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "payment"
              ? "text-[#128C38] border-b-2 border-[#128C38]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Methods ({paymentOptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 transition-all relative ${
            activeTab === "preview"
              ? "text-[#128C38] border-b-2 border-[#128C38]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Live Customer View</span>
        </button>
      </div>

      {/* ── TAB 1: DELIVERY METHODS ── */}
      {activeTab === "delivery" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage shipping rates, turnaround times, and studio pickup options.
            </p>
            <button
              type="button"
              onClick={() => handleOpenDeliveryModal()}
              className="px-3.5 py-1.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Delivery Method</span>
            </button>
          </div>

          <div className="grid gap-3">
            {deliveryOptions.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.isActive
                    ? "border-slate-200 shadow-2xs"
                    : "border-dashed border-slate-300 bg-slate-50/60 opacity-75"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {renderIcon(item.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === "pickup"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.type === "pickup" ? "Studio Pickup" : "Door Delivery"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isActive ? "Active (Visible)" : "Hidden from Checkout"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.estimatedTime || "Standard turnaround"}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-[#128C38]">
                        <span>Fee:</span>
                        <span>{item.fee === 0 ? "FREE" : `${item.fee.toLocaleString()} RWF`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleDeliveryActive(item.id)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
                      item.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title={item.isActive ? "Click to hide from checkout" : "Click to show on checkout"}
                  >
                    {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{item.isActive ? "Active" : "Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDeliveryModal(item)}
                    className="p-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Edit Delivery Method"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: true,
                        type: "delivery",
                        id: item.id,
                        name: item.name,
                      })
                    }
                    className="p-2 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Delete Delivery Method"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: PAYMENT METHODS ── */}
      {activeTab === "payment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage MTN MoMo merchant code, Airtel Money, Bank Transfer accounts, and Pay on Delivery.
            </p>
            <button
              type="button"
              onClick={() => handleOpenPaymentModal()}
              className="px-3.5 py-1.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payment Method</span>
            </button>
          </div>

          <div className="grid gap-3">
            {paymentOptions.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.isActive
                    ? "border-slate-200 shadow-2xs"
                    : "border-dashed border-slate-300 bg-slate-50/60 opacity-75"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs shadow-2xs"
                    style={{
                      backgroundColor: item.badgeBg || "#128C38",
                      color: item.badgeTextColor || "#FFFFFF",
                    }}
                  >
                    {item.badgeText || "PAY"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Code: {item.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isActive ? "Active (Visible)" : "Hidden from Checkout"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>

                    {item.accountNumber && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 inline-flex flex-wrap items-center gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                            Account / Merchant Code
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {item.accountNumber}
                          </span>
                        </div>
                        {item.recipientName && (
                          <div className="border-l border-slate-200 pl-3">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                              Recipient
                            </span>
                            <span className="font-medium text-slate-700">{item.recipientName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.instructions && (
                      <p className="text-[11px] text-slate-400 mt-1.5 italic">
                        {item.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleTogglePaymentActive(item.id)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
                      item.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title={item.isActive ? "Click to hide from checkout" : "Click to show on checkout"}
                  >
                    {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{item.isActive ? "Active" : "Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPaymentModal(item)}
                    className="p-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Edit Payment Method"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: true,
                        type: "payment",
                        id: item.id,
                        name: item.name,
                      })
                    }
                    className="p-2 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Delete Payment Method"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: LIVE CHECKOUT CUSTOMER VIEW ── */}
      {activeTab === "preview" && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#128C38]" />
              <h2 className="text-sm font-bold text-slate-900">
                Customer Checkout Screen Preview
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Only active methods are shown to buyers
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Methods Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#128C38]" />
                Customer Delivery Options
              </h3>
              <div className="space-y-2">
                {deliveryOptions
                  .filter((d) => d.isActive)
                  .map((opt, i) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                        i === 0
                          ? "border-[#128C38] bg-[#128C38]/5"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#128C38]/10 flex items-center justify-center">
                          {renderIcon(opt.icon)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                          <div className="text-[11px] text-slate-500">{opt.estimatedTime}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#128C38]">
                        {opt.fee === 0 ? "FREE" : `${opt.fee.toLocaleString()} RWF`}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Payment Methods Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#128C38]" />
                Customer Payment Options
              </h3>
              <div className="space-y-2">
                {paymentOptions
                  .filter((p) => p.isActive)
                  .map((opt, i) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                        i === 0
                          ? "border-[#128C38] bg-[#128C38]/5"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold"
                          style={{
                            backgroundColor: opt.badgeBg || "#128C38",
                            color: opt.badgeTextColor || "#FFFFFF",
                          }}
                        >
                          {opt.badgeText || "PAY"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {opt.subtitle}
                          </div>
                        </div>
                      </div>
                      {opt.accountNumber && (
                        <div className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {opt.accountNumber}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT DELIVERY METHOD ── */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#128C38]" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingDeliveryId ? "Edit Delivery Method" : "Add New Delivery Method"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeliveryModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Method Name *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryForm.name}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                  placeholder="e.g. Standard Home Delivery, Express Moto, Studio Pickup"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Method Type
                  </label>
                  <select
                    value={deliveryForm.type}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        type: e.target.value as "delivery" | "pickup",
                        fee: e.target.value === "pickup" ? 0 : deliveryForm.fee,
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  >
                    <option value="delivery">Door Delivery (Requires Address)</option>
                    <option value="pickup">Studio Pickup (Free)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Fee (RWF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={deliveryForm.fee}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, fee: Number(e.target.value) || 0 })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Turnaround Time
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.estimatedTime}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, estimatedTime: e.target.value })
                    }
                    placeholder="e.g. 1–2 days, 2–4 hours, Ready in 24 hrs"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Icon Style
                  </label>
                  <select
                    value={deliveryForm.icon}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, icon: e.target.value })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  >
                    <option value="truck">Truck (Standard Delivery)</option>
                    <option value="zap">Zap (Express Speed)</option>
                    <option value="store">Store (Studio Pickup)</option>
                    <option value="package">Package (Box Parcel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Customer Instructions
                </label>
                <textarea
                  rows={2}
                  value={deliveryForm.description}
                  onChange={(e) =>
                    setDeliveryForm({ ...deliveryForm, description: e.target.value })
                  }
                  placeholder="e.g. Available across Kigali, Nyarugenge, Gasabo & Kicukiro."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="deliveryActive"
                  checked={deliveryForm.isActive}
                  onChange={(e) =>
                    setDeliveryForm({ ...deliveryForm, isActive: e.target.checked })
                  }
                  className="rounded border-slate-300 text-[#128C38] focus:ring-[#128C38]"
                />
                <label htmlFor="deliveryActive" className="text-xs font-medium text-slate-700">
                  Enable and show this method immediately on checkout
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-xl shadow-2xs"
                >
                  {editingDeliveryId ? "Update Method" : "Add Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT PAYMENT METHOD ── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#128C38]" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingPaymentId ? "Edit Payment Method" : "Add New Payment Method"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method Title *
                </label>
                <input
                  type="text"
                  required
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  placeholder="e.g. MTN MoMo, Airtel Money, Bank Wire, Pay on Delivery"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Code
                  </label>
                  <input
                    type="text"
                    value={paymentForm.code}
                    onChange={(e) => setPaymentForm({ ...paymentForm, code: e.target.value })}
                    placeholder="momo, airtel, bank, cod, custom"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge Short Text
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={paymentForm.badgeText}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, badgeText: e.target.value })
                    }
                    placeholder="MoMo, AIR, BK, COD"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={paymentForm.badgeBg || "#128C38"}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, badgeBg: e.target.value })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0"
                    />
                    <input
                      type="text"
                      value={paymentForm.badgeBg}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, badgeBg: e.target.value })
                      }
                      className="flex-1 text-xs p-2 rounded-lg border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={paymentForm.subtitle}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, subtitle: e.target.value })
                    }
                    placeholder="e.g. Instant push prompt on phone"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Merchant Code / Account Number
                  </label>
                  <input
                    type="text"
                    value={paymentForm.accountNumber}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, accountNumber: e.target.value })
                    }
                    placeholder="*182*8*1*052980# or 00040-0694938-22"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={paymentForm.recipientName}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, recipientName: e.target.value })
                    }
                    placeholder="JREAL VISION DESIGN LTD"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Instructions Shown to Buyer
                </label>
                <textarea
                  rows={2}
                  value={paymentForm.instructions}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, instructions: e.target.value })
                  }
                  placeholder="e.g. Dial the code, enter your PIN when prompted, or show proof of payment to the rider."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#128C38]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paymentActive"
                  checked={paymentForm.isActive}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, isActive: e.target.checked })
                  }
                  className="rounded border-slate-300 text-[#128C38] focus:ring-[#128C38]"
                />
                <label htmlFor="paymentActive" className="text-xs font-medium text-slate-700">
                  Enable and show this method immediately on checkout
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-xl shadow-2xs"
                >
                  {editingPaymentId ? "Update Method" : "Add Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE ── */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Delete Method</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove{" "}
              <strong className="text-slate-900">"{deleteConfirm.name}"</strong>? It will no longer
              be offered to customers on the checkout page.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm({ isOpen: false, type: "delivery", id: "", name: "" })
                }
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
