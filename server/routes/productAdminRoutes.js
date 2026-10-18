import express from "express";

import {
    getPendingProducts,
    approveProduct,
    rejectProduct
} from "../controllers/productAdminController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all products waiting for admin approval
router.get(
    "/pending-products",
    protect,
    adminOnly,
    getPendingProducts
);

// Approve a pending product
router.patch(
    "/:productId/approve",
    protect,
    adminOnly,
    approveProduct
);

// Reject a pending product
router.patch(
    "/:productId/reject",
    protect,
    adminOnly,
    rejectProduct
);

export default router;
