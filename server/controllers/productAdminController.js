import Product from "../models/Product.js";

// ==============================
// Get Pending Products
// ==============================
const getPendingProducts = async (req, res) => {
    try {
        // Find all products waiting for admin approval
        const products = await Product.find(
            { status: "pending" },
            {
                name: 1,
                category: 1,
                description: 1,
                price: 1,
                quantity: 1,
                unit: 1,
                images: 1,
                seller: 1,
                status: 1,
                createdAt: 1
            }
        )
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Pending products retrieved successfully",
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get pending products error:", error);

        res.status(500).json({
            message: "Server error while retrieving pending products"
        });
    }
};


// ==============================
// Approve Product
// ==============================
const approveProduct = async (req, res) => {
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

        // Only pending products can be approved
        if (product.status !== "pending") {
            return res.status(400).json({
                message: "Only pending products can be approved"
            });
        }

        // Change product status to approved
        product.status = "approved";

        await product.save();

        res.status(200).json({
            message: "Product approved successfully",
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
                status: product.status
            }
        });

    } catch (error) {
        console.error("Approve product error:", error);

        res.status(500).json({
            message: "Server error while approving product"
        });
    }
};


// ==============================
// Export Controllers
// ==============================
export {
    getPendingProducts,
    approveProduct
};