import express from "express";
import multer from "multer";

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
// Multer Configuration
// ==============================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/webp"
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed"
                )
            );
        }
    }
});


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
    upload.single("image"),
    createProduct
);


// ==============================
// Update My Product
// ==============================

router.patch(
    "/:productId",
    protect,
    upload.single("image"),
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