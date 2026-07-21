import type { Response } from "express";

import prisma from "../lib/prisma.js";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
  followUpSchema,
} from "../validators/customer.validator.js";






export const createCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validation =
      createCustomerSchema.safeParse(req.body);

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
      followUpDate,
      email,
      ...data
    } = validation.data;

    const customer = await prisma.customer.create({
      data: {
        ...data,

        email: email || null,

        followUpDate: followUpDate
          ? new Date(followUpDate)
          : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const getCustomers = async (
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

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const customerType =
      typeof req.query.customerType === "string"
        ? req.query.customerType
        : undefined;

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
          businessName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          mobile: {
            contains: search,
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    const [customers, total] =
      await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: limit,

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.customer.count({
          where,
        }),
      ]);

    res.status(200).json({
      success: true,

      data: customers,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};







export const getCustomerById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    //const { id } = req.params;

const id = req.params.id as string;

    const customer =
      await prisma.customer.findUnique({
        where: {
          id,
        },

        include: {
          followUps: {
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

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(
      "Get customer detail error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const updateCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
   // const { id } = req.params;

  
const id = req.params.id as string;

    const validation =
      updateCustomerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validation.error.flatten().fieldErrors,
      });

      return;
    }

    const existingCustomer =
      await prisma.customer.findUnique({
        where: {
          id,
        },
      });

    if (!existingCustomer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    const {
      followUpDate,
      email,
      ...data
    } = validation.data;

    const customer =
      await prisma.customer.update({
        where: {
          id,
        },

        data: {
          ...data,

          ...(email !== undefined && {
            email: email || null,
          }),

          ...(followUpDate !== undefined && {
            followUpDate: followUpDate
              ? new Date(followUpDate)
              : null,
          }),
        },
      });

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addFollowUp = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    //const { id } = req.params;
    
    const id = req.params.id as string;
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const validation =
      followUpSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validation.error.flatten().fieldErrors,
      });

      return;
    }

    const customer =
      await prisma.customer.findUnique({
        where: {
          id,
        },
      });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    const { notes, followUpDate } =
      validation.data;

    const followUp =
      await prisma.$transaction(
        async (tx) => {

          const createdFollowUp =
            await tx.followUp.create({
              data: {
                customerId: id,
                note : notes,
                createdBy: req.user!.userId,
              },
            });

          if (followUpDate !== undefined) {
            await tx.customer.update({
              where: {
                id,
              },

              data: {
                followUpDate: followUpDate
                  ? new Date(followUpDate)
                  : null,
              },
            });
          }

          return createdFollowUp;
        }
      );

    res.status(201).json({
      success: true,
      message: "Follow-up added successfully",
      data: followUp,
    });
  } catch (error) {
    console.error("Add follow-up error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};








