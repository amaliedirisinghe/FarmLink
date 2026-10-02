import express from "express";

import {
    createProduct,
    getApprovedProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// ==============================
// Get Approved Products
// ==============================
router.get(
    "/",
    getApprovedProducts
);


// ==============================
// Get My Products
// ==============================
router.get(
    "/my-products",
    protect,
    getMyProducts
);


// ==============================
// Get Single Approved Product
// ==============================
router.get(
    "/:productId",
    getProductById
);


// ==============================
// Create a New Product Listing
// ==============================
router.post(
    "/",
    protect,
    createProduct
);


// ==============================
// Update My Product
// ==============================
router.patch(
    "/:productId",
    protect,
    updateProduct
);


// ==============================
// Delete My Product
// ==============================
router.delete(
    "/:productId",
    protect,
    deleteProduct
);


export default router;