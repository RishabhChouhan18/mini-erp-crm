import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateStock,
  getStockMovements,
} from "../controllers/product.controller.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

// Everyone internally can view products
router.get(
  "/",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getProducts
);

router.get(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getProductById
);

// Admin / Warehouse manage products
router.post(
  "/",
  authorizeRoles(
    "ADMIN",
    "WAREHOUSE"
  ),
  createProduct
);

router.put(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "WAREHOUSE"
  ),
  updateProduct
);

// Inventory modification
router.post(
  "/:id/stock",
  authorizeRoles(
    "ADMIN",
    "WAREHOUSE"
  ),
  updateStock
);

router.get(
  "/:id/movements",
  authorizeRoles(
    "ADMIN",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getStockMovements
);

export default router;