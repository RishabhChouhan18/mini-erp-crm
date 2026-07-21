import { Router } from "express";

import {
  createChallan,
  getChallans,
  getChallanById,
  confirmChallan,
} from "../controllers/challan.controller.js";

import {
  authenticate,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

// View challans
router.get(
  "/",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getChallans
);

router.get(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getChallanById
);

// Sales operations
router.post(
  "/",
  authorizeRoles(
    "ADMIN",
    "SALES"
  ),
  createChallan
);

router.patch(
  "/:id/confirm",
  authorizeRoles(
    "ADMIN",
    "SALES"
  ),
  confirmChallan
);

// router.get(
//   "/:id",
//   authorizeRoles(
//     "ADMIN",
//     "SALES",
//     "WAREHOUSE",
//     "ACCOUNTS"
//   ),
//   getChallanById
// );

export default router;