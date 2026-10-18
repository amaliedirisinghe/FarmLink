
import express from "express";

import { getDashboardStats } from "../controllers/dashboardController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get dashboard statistics — admins only
router.get(
    "/stats",
    protect,
    adminOnly,
    getDashboardStats
);

export default router;
