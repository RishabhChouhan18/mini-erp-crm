import { Router } from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
} from "../controllers/customer.controller.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "ACCOUNTS"
  ),
  getCustomers
);

router.get(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "ACCOUNTS"
  ),
  getCustomerById
);

router.post(
  "/",
  authorizeRoles(
    "ADMIN",
    "SALES"
  ),
  createCustomer
);

router.put(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "SALES"
  ),
  updateCustomer
);

router.post(
  "/:id/followups",
  authorizeRoles(
    "ADMIN",
    "SALES"
  ),
  addFollowUp
);

export default router;