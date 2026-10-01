import express from "express";

import {
    getPendingUsers,
    approveUser,
    rejectUser
} from "../controllers/adminController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all users waiting for approval
router.get(
    "/pending-users",
    protect,
    adminOnly,
    getPendingUsers
);

// Approve a pending user
router.patch(
    "/users/:userId/approve",
    protect,
    adminOnly,
    approveUser
);

// Reject a pending user
router.patch(
    "/users/:userId/reject",
    protect,
    adminOnly,
    rejectUser
);

export default router;