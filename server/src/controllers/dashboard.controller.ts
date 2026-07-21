import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      totalChallans,
      confirmedChallans,
      recentChallans,
      products,
      upcomingFollowUps,
    ] = await Promise.all([
      // Total customers
      prisma.customer.count(),

      // Active customers
      prisma.customer.count({
        where: {
          status: "ACTIVE",
        },
      }),

      // Total products
      prisma.product.count(),

      // Total challans
      prisma.challan.count(),

      // Confirmed challans
      prisma.challan.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      // Latest 5 challans
      prisma.challan.findMany({
        take: 5,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          challanNumber: true,
          status: true,
          totalQuantity: true,
          createdAt: true,

          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
            },
          },
        },
      }),

      // Products needed for low-stock calculation
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          currentStock: true,
          minimumStock: true,
          warehouse: true,
        },
      }),

      // Upcoming CRM follow-ups
      prisma.customer.findMany({
        where: {
          followUpDate: {
            not: null,
          },

          status: {
            not: "INACTIVE",
          },
        },

        take: 5,

        orderBy: {
          followUpDate: "asc",
        },

        select: {
          id: true,
          name: true,
          businessName: true,
          mobile: true,
          status: true,
          followUpDate: true,
        },
      }),
    ]);

    const lowStockProducts = products.filter(
      (product) =>
        product.currentStock <=
        product.minimumStock
    );

    res.status(200).json({
      success: true,

      data: {
        stats: {
          totalCustomers,
          activeCustomers,
          totalProducts,
          lowStockCount:
            lowStockProducts.length,
          totalChallans,
          confirmedChallans,
        },

        recentChallans,

        lowStockProducts:
          lowStockProducts.slice(0, 5),

        upcomingFollowUps,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};