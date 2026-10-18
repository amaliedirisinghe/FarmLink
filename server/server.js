
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productAdminRoutes from "./routes/productAdminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

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
app.use(cors());

app.use(express.json());


// ==============================
// Authentication Routes
// ==============================
app.use("/api/auth", authRoutes);


// ==============================
// Admin Routes
// ==============================
app.use("/api/admin", adminRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

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
// Image Upload Routes
// ==============================
app.use("/api/uploads", uploadRoutes);


// ==============================
// Favourite Routes
// ==============================
app.use("/api/favorites", favoriteRoutes);



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
