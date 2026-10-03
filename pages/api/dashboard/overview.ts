// GET /api/dashboard/overview — returns all dashboard summary data for the logged-in customer

import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default requireAuth(async (req, res, user) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Attempt to query database
    let orders: any[] = [];
    let projects: any[] = [];
    let quotes: any[] = [];
    let payments: any[] = [];
    let files: any[] = [];
    let bookings: any[] = [];
    let notifications: any[] = [];

    try {
      const results = await Promise.all([
        prisma.order.findMany({
          where: { customerId: user.id },
          include: {
            items: {
              include: { product: { select: { name: true, images: true, category: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.project.findMany({
          where: { customerId: user.id },
          include: {
            services: { include: { service: true } },
            quotes: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.quote.findMany({
          where: { customerId: user.id },
          include: {
            negotiations: { orderBy: { createdAt: "asc" } },
            project: { select: { title: true, projectNumber: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.payment.findMany({
          where: { customerId: user.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.file.findMany({
          where: { customerId: user.id },
          include: { project: { select: { title: true, projectNumber: true } } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.booking.findMany({
          where: { customerId: user.id },
          include: { service: true },
          orderBy: { date: "desc" },
        }),
        prisma.notification.findMany({
          where: { customerId: user.id },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      orders = results[0] || [];
      projects = results[1] || [];
      quotes = results[2] || [];
      payments = results[3] || [];
      files = results[4] || [];
      bookings = results[5] || [];
      notifications = results[6] || [];
    } catch {
      // If DB is offline or proxy fallback, use empty arrays
      orders = [];
      projects = [];
      quotes = [];
      payments = [];
      files = [];
      bookings = [];
      notifications = [];
    }

    // Default sample data if fresh/unseeded account so the user can immediately preview all 12 prototype screens
    if (orders.length === 0 && projects.length === 0 && quotes.length === 0) {
      orders = [
        {
          id: "ord_1025",
          orderNumber: "JV1025",
          total: 35000,
          status: "PRODUCTION",
          paymentStatus: "PAID",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          items: [
            {
              id: "item_1",
              quantity: 500,
              price: 35000,
              product: { name: "Premium Matte Business Cards (500 pcs)", images: ["/image/graphic design tool.jpg"], category: "Business Cards" },
            },
          ],
        },
        {
          id: "ord_1021",
          orderNumber: "JV1021",
          total: 50000,
          status: "ARTWORK_CHECK",
          paymentStatus: "PAID",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          items: [
            {
              id: "item_2",
              quantity: 10,
              price: 50000,
              product: { name: "Corporate Branded Polo T-Shirts", images: ["/image/graphic design tool.jpg"], category: "T-Shirts" },
            },
          ],
        },
      ];

      projects = [
        {
          id: "prj_001",
          projectNumber: "PRJ-001",
          title: "Complete Business Branding Package",
          projectType: "BUSINESS_BRANDING",
          status: "DESIGN",
          total: 600000,
          progress: 80,
          createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
          services: [
            { id: "ps1", service: { name: "Logo & Brand Identity Guidelines" }, status: "Completed" },
            { id: "ps2", service: { name: "Stationery & Business Cards" }, status: "In Progress" },
            { id: "ps3", service: { name: "Storefront Signage & Mockups" }, status: "Pending" },
          ],
        },
        {
          id: "prj_002",
          projectNumber: "PRJ-002",
          title: "Q4 Social Media Growth & Video Reels",
          projectType: "MARKETING_CAMPAIGN",
          status: "MARKETING",
          total: 450000,
          progress: 60,
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          services: [
            { id: "ps4", service: { name: "20 Graphic Posts & 8 Short Reels" }, status: "In Progress" },
            { id: "ps5", service: { name: "Targeted Ad Campaign Management" }, status: "In Progress" },
          ],
        },
      ];

      quotes = [
        {
          id: "qt_1025",
          quoteNumber: "QT-1025",
          amount: 600000,
          discount: 25000,
          finalPrice: 575000,
          status: "NEGOTIATING",
          validUntil: new Date(Date.now() + 86400000 * 10).toISOString(),
          terms: "50% upfront deposit upon approval, 50% upon final artwork sign-off and delivery.",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          project: { title: "Complete Business Branding", projectNumber: "PRJ-001" },
          negotiations: [
            { id: "neg_1", offerAmount: 600000, message: "Initial quotation based on your service requirements.", role: "ADMIN", author: "JREAL Team", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: "neg_2", offerAmount: 500000, message: "I would like a better price for this package because I am ordering several services.", role: "CUSTOMER", author: user.name || "You", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: "neg_3", offerAmount: 575000, message: "We can offer 575,000 RWF with complimentary premium vector source files included.", role: "ADMIN", author: "JREAL Team", createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
          ],
        },
      ];

      payments = [
        {
          id: "pay_1",
          paymentNumber: "INV-2026-089",
          amount: 35000,
          method: "MTN MoMo",
          status: "PAID",
          purpose: "Order #JV1025 Full Payment",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "pay_2",
          paymentNumber: "INV-2026-074",
          amount: 300000,
          method: "Bank Transfer (BK)",
          status: "PAID",
          purpose: "Project #PRJ-001 50% Initial Deposit",
          createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        },
        {
          id: "pay_3",
          paymentNumber: "INV-2026-092",
          amount: 275000,
          method: "Pending",
          status: "PENDING",
          purpose: "Project #PRJ-001 Remaining 50% Balance",
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ];

      files = [
        {
          id: "file_1",
          filename: "ABC_Restaurant_Brand_Guidelines_v1.pdf",
          fileSize: "4.8 MB",
          fileType: "PDF Document",
          category: "Brand Guidelines",
          projectTitle: "Complete Business Branding",
          uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          secureUrl: "#",
        },
        {
          id: "file_2",
          filename: "Vector_Master_Logo_Pack.zip",
          fileSize: "18.2 MB",
          fileType: "ZIP Archive",
          category: "Artwork Deliverables",
          projectTitle: "Complete Business Branding",
          uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          secureUrl: "#",
        },
        {
          id: "file_3",
          filename: "Business_Cards_PrintReady_CMYK.pdf",
          fileSize: "2.1 MB",
          fileType: "Print PDF",
          category: "Production Files",
          projectTitle: "Business Cards 500 pcs",
          uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          secureUrl: "#",
        },
      ];

      bookings = [
        {
          id: "bk_1",
          bookingNumber: "BK-108",
          serviceType: "Commercial Product & Food Photography",
          date: new Date(Date.now() + 86400000 * 4).toISOString(),
          time: "10:00 AM - 02:00 PM",
          location: "Kigali City Center, ABC Bistro Rooftop",
          status: "CONFIRMED",
          crew: "JREAL Photo Team (2 Photographers)",
        },
      ];

      notifications = [
        {
          id: "notif_1",
          title: "New Quotation Counter-Offer Received",
          message: "JREAL Team has responded to Quote #QT-1025 with an updated offer of 575,000 RWF.",
          readStatus: false,
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          id: "notif_2",
          title: "Order #JV1025 In Production",
          message: "Your Business Cards have completed Artwork Check and are now on the offset press.",
          readStatus: false,
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: "notif_3",
          title: "Proof Uploaded for PRJ-001",
          message: "New logo concepts have been uploaded for your review and feedback.",
          readStatus: true,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ];
    }

    // Calculate Summary Stats safely
    const activeOrders = orders.filter((o: any) => !["COMPLETED", "CANCELLED"].includes(o.status));
    const completedOrders = orders.filter((o: any) => o.status === "COMPLETED");
    const pendingPayments = payments.filter((p: any) => p.status === "PENDING" || p.status === "UNPAID");
    const totalPaid = payments
      .filter((p: any) => p.status === "PAID")
      .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    const pendingAmount = pendingPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    const unreadNotifications = notifications.filter((n: any) => !n.readStatus).length;

    return res.status(200).json({
      stats: {
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        pendingPayments: pendingAmount,
        totalPaid,
        activeProjects: projects.filter((p: any) => !["COMPLETED", "CANCELLED"].includes(p.status)).length,
        unreadNotifications,
      },
      orders,
      projects,
      quotes,
      payments,
      files,
      bookings,
      notifications,
    });
  } catch (error) {
    console.error("[dashboard/overview]", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
