import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name is required"),

  sku: z
    .string()
    .trim()
    .min(2, "SKU is required"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required"),

  unitPrice: z
    .number()
    .positive("Unit price must be greater than 0"),

  minimumStock: z
    .number()
    .int()
    .min(0, "Minimum stock cannot be negative"),

  warehouse: z
    .string()
    .trim()
    .min(2, "Warehouse/location is required"),
});

export const updateProductSchema =
  createProductSchema.partial();

export const stockMovementSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive("Quantity must be greater than 0"),

  type: z.enum(["IN", "OUT"]),

  reason: z
    .string()
    .trim()
    .min(2, "Reason is required"),
});