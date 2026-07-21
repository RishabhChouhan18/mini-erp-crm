import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
  stockMovementSchema,
} from "../validators/product.validator.js";



export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation =
      createProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validation.error.flatten().fieldErrors,
      });
      return;
    }

    const data = validation.data;

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          sku: data.sku,
        },
      });

    if (existingProduct) {
      res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
      return;
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        currentStock: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    const lowStock =
      req.query.lowStock === "true";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    const [products, total] =
      await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.product.count({
          where,
        }),
      ]);

    let result = products;

    if (lowStock) {
      result = products.filter(
        (product) =>
          product.currentStock <=
          product.minimumStock
      );
    }

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





export const getProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },

        include: {
          stockMovements: {
            orderBy: {
              createdAt: "desc",
            },

            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const validation =
      updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validation.error.flatten().fieldErrors,
      });
      return;
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (
      validation.data.sku &&
      validation.data.sku !== existingProduct.sku
    ) {
      const duplicateSku =
        await prisma.product.findUnique({
          where: {
            sku: validation.data.sku,
          },
        });

      if (duplicateSku) {
        res.status(409).json({
          success: false,
          message: "A product with this SKU already exists",
        });
        return;
      }
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const updateStock = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validation =
      stockMovementSchema.safeParse(req.body);

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
      quantity,
      type,
      reason,
    } = validation.data;

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (
      type === "OUT" &&
      product.currentStock < quantity
    ) {
      res.status(409).json({
        success: false,
        message:
          `Insufficient stock. Available: ${product.currentStock}, Requested: ${quantity}`,
      });
      return;
    }

    const result =
      await prisma.$transaction(
        async (tx) => {

          const updatedProduct =
            await tx.product.update({
              where: {
                id,
              },

              data: {
                currentStock:
                  type === "IN"
                    ? {
                        increment: quantity,
                      }
                    : {
                        decrement: quantity,
                      },
              },
            });

          const movement =
            await tx.stockMovement.create({
              data: {
                productId: id,
                quantity,
                type,
                reason,
                createdBy: req.user!.userId,
              },
            });

          return {
            product: updatedProduct,
            movement,
          };
        }
      );

    res.status(200).json({
      success: true,
      message:
        type === "IN"
          ? "Stock added successfully"
          : "Stock removed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Stock update error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};







export const getStockMovements = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          sku: true,
        },
      });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const movements =
      await prisma.stockMovement.findMany({
        where: {
          productId: id,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          creator: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

    res.status(200).json({
      success: true,
      data: {
        product,
        movements,
      },
    });
  } catch (error) {
    console.error(
      "Get stock movements error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




