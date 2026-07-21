import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must contain at least 2 characters"),

  mobile: z
    .string()
    .trim()
    .min(10, "Please enter a valid mobile number"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),

  businessName: z
    .string()
    .trim()
    .min(2, "Business name is required"),

  gstNumber: z
    .string()
    .trim()
    .optional(),

  customerType: z.enum([
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ]),

  address: z
    .string()
    .trim()
    .min(3, "Address is required"),

  status: z
    .enum([
      "LEAD",
      "ACTIVE",
      "INACTIVE",
    ])
    .default("LEAD"),

  followUpDate: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  notes: z
    .string()
    .trim()
    .optional(),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();

export const followUpSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(1, "Follow-up note is required"),

  followUpDate: z
    .string()
    .datetime()
    .optional()
    .nullable(),
});