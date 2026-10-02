import Product from "../models/Product.js";
import User from "../models/User.js";

// ==============================
// Create Product
// ==============================
const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            price,
            quantity,
            unit,
            images
        } = req.body;

        // 1. Check required fields
        if (
            !name ||
            !category ||
            !description ||
            price === undefined ||
            quantity === undefined ||
            !unit
        ) {
            return res.status(400).json({
                message:
                    "Name, category, description, price, quantity and unit are required"
            });
        }

        // 2. Find the logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 3. Only active users can create product listings
        if (user.status !== "active") {
            return res.status(403).json({
                message: "Only active users can create product listings"
            });
        }

        // 4. Validate price
        if (Number(price) < 0) {
            return res.status(400).json({
                message: "Price cannot be negative"
            });
        }

        // 5. Validate quantity
        if (Number(quantity) < 0) {
            return res.status(400).json({
                message: "Quantity cannot be negative"
            });
        }

        // 6. Create product
        const product = await Product.create({
            name,
            category,
            description,
            price: Number(price),
            quantity: Number(quantity),
            unit,
            images: Array.isArray(images) ? images : [],
            seller: user._id,
            status: "pending"
        });

        // 7. Send response
        res.status(201).json({
            message:
                "Product created successfully and is waiting for admin approval",
            product: {
                id: product._id,
                name: product.name,
                category: product.category,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                unit: product.unit,
                images: product.images,
                seller: product.seller,
                status: product.status,
                createdAt: product.createdAt
            }
        });

    } catch (error) {
        console.error("Create product error:", error);

        res.status(500).json({
            message: "Server error while creating product"
        });
    }
};


// ==============================
// Get Approved Products
// ==============================
const getApprovedProducts = async (req, res) => {
    try {
        // Find only approved products
        const products = await Product.find({
            status: "approved"
        })
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Approved products retrieved successfully",
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get approved products error:", error);

        res.status(500).json({
            message: "Server error while retrieving products"
        });
    }
};


// ==============================
// Get Single Approved Product
// ==============================
const getProductById = async (req, res) => {
    try {
        // Get product ID from the URL
        const { productId } = req.params;

        // Find only an approved product
        const product = await Product.findOne({
            _id: productId,
            status: "approved"
        })
            .populate("seller", "name email");

        // Check if product exists
        if (!product) {
            return res.status(404).json({
                message: "Approved product not found"
            });
        }

        // Send product details
        res.status(200).json({
            message: "Product retrieved successfully",
            product
        });

    } catch (error) {
        console.error("Get product by ID error:", error);

        res.status(500).json({
            message: "Server error while retrieving product"
        });
    }
};


// ==============================
// Get My Products
// ==============================
const getMyProducts = async (req, res) => {
    try {
        // Find products created by the logged-in user
        const products = await Product.find({
            seller: req.user.id
        })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Your products retrieved successfully",
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get my products error:", error);

        res.status(500).json({
            message: "Server error while retrieving your products"
        });
    }
};




// ==============================
// Update My Product
// ==============================
const updateProduct = async (req, res) => {
    try {
        // Get product ID from the URL
        const { productId } = req.params;

        const {
            name,
            category,
            description,
            price,
            quantity,
            unit,
            images
        } = req.body;

        // Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check product ownership
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only update your own products"
            });
        }

        // Find the logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only active users can update products
        if (user.status !== "active") {
            return res.status(403).json({
                message: "Only active users can update products"
            });
        }

        // Track whether a major product detail has changed
        let requiresReapproval = false;

        // ==============================
        // Update Product Name
        // ==============================
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    message: "Product name cannot be empty"
                });
            }

            if (product.name !== name.trim()) {
                requiresReapproval = true;
            }

            product.name = name.trim();
        }

        // ==============================
        // Update Category
        // ==============================
        if (category !== undefined) {
            if (!category.trim()) {
                return res.status(400).json({
                    message: "Product category cannot be empty"
                });
            }

            if (product.category !== category.trim()) {
                requiresReapproval = true;
            }

            product.category = category.trim();
        }

        // ==============================
        // Update Description
        // ==============================
        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({
                    message: "Product description cannot be empty"
                });
            }

            if (product.description !== description.trim()) {
                requiresReapproval = true;
            }

            product.description = description.trim();
        }

        // ==============================
        // Update Price
        // ==============================
        if (price !== undefined) {
            if (Number(price) < 0) {
                return res.status(400).json({
                    message: "Price cannot be negative"
                });
            }

            // Price changes do NOT require re-approval
            product.price = Number(price);
        }

        // ==============================
        // Update Quantity
        // ==============================
        if (quantity !== undefined) {
            if (Number(quantity) < 0) {
                return res.status(400).json({
                    message: "Quantity cannot be negative"
                });
            }

            // Quantity changes do NOT require re-approval
            product.quantity = Number(quantity);
        }

        // ==============================
        // Update Unit
        // ==============================
        if (unit !== undefined) {
            if (!unit.trim()) {
                return res.status(400).json({
                    message: "Unit cannot be empty"
                });
            }

            if (product.unit !== unit.trim()) {
                requiresReapproval = true;
            }

            product.unit = unit.trim();
        }

        // ==============================
        // Update Images
        // ==============================
        if (images !== undefined) {
            if (!Array.isArray(images)) {
                return res.status(400).json({
                    message: "Images must be an array"
                });
            }

            // Image changes require re-approval
            requiresReapproval = true;

            product.images = images;
        }

        // ==============================
        // Apply Re-approval Status
        // ==============================
        if (requiresReapproval) {
            product.status = "pending";
        }

        // Save updated product
        await product.save();

        // ==============================
        // Response Message
        // ==============================
        let message = "Product updated successfully";

        if (requiresReapproval) {
            message =
                "Product updated successfully and is waiting for admin approval";
        }

        res.status(200).json({
            message,
            product
        });

    } catch (error) {
        console.error("Update product error:", error);

        res.status(500).json({
            message: "Server error while updating product"
        });
    }
};


// ==============================
// Delete My Product
// ==============================
const deleteProduct = async (req, res) => {
    try {
        // Get product ID from the URL
        const { productId } = req.params;

        // Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check product ownership
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own products"
            });
        }

        // Find the logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only active users can delete products
        if (user.status !== "active") {
            return res.status(403).json({
                message: "Only active users can delete products"
            });
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            message: "Server error while deleting product"
        });
    }
};


// ==============================
// Export Controllers
// ==============================
export {
    createProduct,
    getApprovedProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
};