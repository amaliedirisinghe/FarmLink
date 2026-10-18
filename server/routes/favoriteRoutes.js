import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
    addFavorite,
    removeFavorite,
    getFavorites
} from "../controllers/favoriteController.js";

const router = express.Router();

// Get the logged-in user's favourites
router.get("/", protect, getFavorites);

// Add a product to favourites
router.post("/:productId", protect, addFavorite);

// Remove a product from favourites
router.delete("/:productId", protect, removeFavorite);

export default router;
