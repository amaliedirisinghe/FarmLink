import express from "express";

import {
    createOrder,
    getMyOrders,
    getSellerOrders,
    getAllOrders,
    confirmOrder,
    completeOrder,
    cancelOrder
} from "../controllers/orderController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();


// ==============================
// Create a New Order
// ==============================
router.post(
    "/",
    protect,
    createOrder
);


// ==============================
// Get My Orders
// ==============================
router.get(
    "/my-orders",
    protect,
    getMyOrders
);


// ==============================
// Get Seller Orders
// ==============================
router.get(
    "/seller-orders",
    protect,
    getSellerOrders
);


// ==============================
// Get All Orders - Admin
// ==============================
router.get(
    "/admin",
    protect,
    adminOnly,
    getAllOrders
);


// ==============================
// Confirm Order
// ==============================
router.patch(
    "/:orderId/confirm",
    protect,
    confirmOrder
);


// ==============================
// Complete Order
// ==============================
router.patch(
    "/:orderId/complete",
    protect,
    completeOrder
);


// ==============================
// Cancel Order
// ==============================
router.patch(
    "/:orderId/cancel",
    protect,
    cancelOrder
);


export default router;