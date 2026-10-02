import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productAdminRoutes from "./routes/productAdminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// ==============================
// Connect to MongoDB
// ==============================
connectDB();


// ==============================
// Middleware
// ==============================
app.use(express.json());


// ==============================
// Authentication Routes
// ==============================
app.use("/api/auth", authRoutes);


// ==============================
// Admin Routes
// ==============================
app.use("/api/admin", adminRoutes);


// ==============================
// Product Routes
// ==============================
app.use("/api/products", productRoutes);


// ==============================
// Admin Product-Management Routes
// ==============================
app.use("/api/admin/products", productAdminRoutes);


// ==============================
// Order Routes
// ==============================
app.use("/api/orders", orderRoutes);


// ==============================
// Test Route
// ==============================
app.get("/", (req, res) => {
    res.send("FarmLink API is running!");
});


// ==============================
// Start Server
// ==============================
app.listen(PORT, () => {
    console.log(
        `FarmLink server running on http://localhost:${PORT}`
    );
});