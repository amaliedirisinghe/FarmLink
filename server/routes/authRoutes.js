import express from "express";

import {
    registerUser,
    loginUser
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Protected test route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "You are authenticated",
        user: req.user
    });
});

export default router;