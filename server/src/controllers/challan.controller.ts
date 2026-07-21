import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createChallanSchema,
} from "../validators/challan.validator.js";

import {
  generateChallanNumber,
} from "../utils/challanNumber.js";




export const createChallan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation =
      createChallanSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validation.error.flatten().fieldErrors,
      });
      return;
    }

    const {
      customerId,
      status,
      items,
    } = validation.data;

    // Prevent duplicate products in same challan
    const productIds = items.map(
      (item) => item.productId
    );

    if (
      new Set(productIds).size !==
      productIds.length
    ) {
      res.status(400).json({
        success: false,
        message:
          "Duplicate products are not allowed in a challan",
      });
      return;
    }

    // Validate customer
    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    // Fetch products from DB
    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

    if (products.length !== productIds.length) {
      res.status(404).json({
        success: false,
        message:
          "One or more products were not found",
      });
      return;
    }

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    // Check stock only when confirming
    if (status === "CONFIRMED") {
      for (const item of items) {
        const product =
          productMap.get(item.productId);

        if (!product) {
          res.status(404).json({
            success: false,
            message: "Product not found",
          });
          return;
        }

        if (
          product.currentStock <
          item.quantity
        ) {
          res.status(409).json({
            success: false,
            message:
              `Insufficient stock for ${product.name}. ` +
              `Available: ${product.currentStock}, ` +
              `Requested: ${item.quantity}`,
          });
          return;
        }
      }
    }

    const totalQuantity = items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

    const challanNumber =
      generateChallanNumber();

    const challan =
      await prisma.$transaction(
        async (tx) => {

          // Create challan
          const createdChallan =
            await tx.challan.create({
              data: {
                challanNumber,
                customerId,
                totalQuantity,
                status,
                createdBy:
                  req.user!.userId,

                items: {
                  create: items.map(
                    (item) => {
                      const product =
                        productMap.get(
                          item.productId
                        )!;

                      return {
                        productId:
                          product.id,

                        quantity:
                          item.quantity,

                        productNameSnapshot:
                          product.name,

                        skuSnapshot:
                          product.sku,

                        unitPriceSnapshot:
                          product.unitPrice,
                      };
                    }
                  ),
                },
              },

              include: {
                items: true,
                customer: true,
              },
            });

          // DRAFT does NOT affect stock
          if (status === "CONFIRMED") {

            for (const item of items) {
              const product =
                productMap.get(
                  item.productId
                )!;

              await tx.product.update({
                where: {
                  id: product.id,
                },

                data: {
                  currentStock: {
                    decrement:
                      item.quantity,
                  },
                },
              });

              await tx.stockMovement.create({
                data: {
                  productId:
                    product.id,

                  quantity:
                    item.quantity,

                  type: "OUT",

                  reason:
                    `Sales Challan ${challanNumber}`,

                  createdBy:
                    req.user!.userId,
                },
              });
            }
          }

          return createdChallan;
        }
      );

    res.status(201).json({
      success: true,

      message:
        status === "CONFIRMED"
          ? "Challan confirmed and inventory updated successfully"
          : "Challan saved as draft successfully",

      data: challan,
    });

  } catch (error) {
    console.error(
      "Create challan error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};






export const getChallans = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const skip =
      (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          challanNumber: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          customer: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },

        {
          customer: {
            businessName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [challans, total] =
      await Promise.all([
        prisma.challan.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            createdAt: "desc",
          },

          include: {
            customer: {
              select: {
                id: true,
                name: true,
                businessName: true,
              },
            },

            creator: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },

            _count: {
              select: {
                items: true,
              },
            },
          },
        }),

        prisma.challan.count({
          where,
        }),
      ]);

    res.status(200).json({
      success: true,

      data: challans,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error(
      "Get challans error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};






export const getChallanById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id =
      req.params.id as string;

    const challan =
      await prisma.challan.findUnique({
        where: {
          id,
        },

        include: {
          customer: true,

          creator: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },

          items: true,
        },
      });

    if (!challan) {
      res.status(404).json({
        success: false,
        message: "Challan not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: challan,
    });

  } catch (error) {
    console.error(
      "Get challan error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};






export const confirmChallan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id =
      req.params.id as string;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const challan =
      await prisma.challan.findUnique({
        where: {
          id,
        },

        include: {
          items: true,
        },
      });

    if (!challan) {
      res.status(404).json({
        success: false,
        message: "Challan not found",
      });
      return;
    }

    if (challan.status !== "DRAFT") {
      res.status(409).json({
        success: false,
        message:
          "Only draft challans can be confirmed",
      });
      return;
    }

    // Fetch latest product stock
    const productIds =
      challan.items.map(
        (item) => item.productId
      );

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    // Re-check stock at confirmation time
    for (const item of challan.items) {
      const product =
        productMap.get(item.productId);

      if (!product) {
        res.status(404).json({
          success: false,
          message:
            `Product linked to challan no longer exists`,
        });
        return;
      }

      if (
        product.currentStock <
        item.quantity
      ) {
        res.status(409).json({
          success: false,

          message:
            `Insufficient stock for ${product.name}. ` +
            `Available: ${product.currentStock}, ` +
            `Requested: ${item.quantity}`,
        });

        return;
      }
    }

    const confirmedChallan =
      await prisma.$transaction(
        async (tx) => {

          for (
            const item of challan.items
          ) {
            await tx.product.update({
              where: {
                id: item.productId,
              },

              data: {
                currentStock: {
                  decrement:
                    item.quantity,
                },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId:
                  item.productId,

                quantity:
                  item.quantity,

                type: "OUT",

                reason:
                  `Sales Challan ${challan.challanNumber}`,

                createdBy:
                  req.user!.userId,
              },
            });
          }

          return tx.challan.update({
            where: {
              id,
            },

            data: {
              status: "CONFIRMED",
            },

            include: {
              items: true,
              customer: true,
            },
          });
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Challan confirmed and inventory updated successfully",
      data: confirmedChallan,
    });

  } catch (error) {
    console.error(
      "Confirm challan error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};