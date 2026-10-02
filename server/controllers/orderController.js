import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// ==============================
// Create Order
// ==============================
const createOrder = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // 1. Check required fields
        if (!productId || quantity === undefined) {
            return res.status(400).json({
                message: "Product ID and quantity are required"
            });
        }

        // 2. Validate quantity
        const requestedQuantity = Number(quantity);

        if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number"
            });
        }

        // 3. Find the logged-in buyer
        const buyer = await User.findById(req.user.id);

        if (!buyer) {
            return res.status(404).json({
                message: "Buyer not found"
            });
        }

        // 4. Only active users can place orders
        if (buyer.status !== "active") {
            return res.status(403).json({
                message: "Only active users can place orders"
            });
        }

        // 5. Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // 6. Product must be approved
        if (product.status !== "approved") {
            return res.status(400).json({
                message: "This product is not available for purchase"
            });
        }

        // 7. Buyer cannot purchase their own product
        if (product.seller.toString() === req.user.id) {
            return res.status(400).json({
                message: "You cannot purchase your own product"
            });
        }

        // 8. Find the seller
        const seller = await User.findById(product.seller);

        if (!seller) {
            return res.status(404).json({
                message: "Seller not found"
            });
        }

        // 9. Seller must be active
        if (seller.status !== "active") {
            return res.status(400).json({
                message: "This seller is not currently active"
            });
        }

        // 10. Atomically reduce stock
        // This prevents two buyers from purchasing stock
        // that is no longer available.
        const updatedProduct = await Product.findOneAndUpdate(
            {
                _id: productId,
                status: "approved",
                quantity: { $gte: requestedQuantity }
            },
            {
                $inc: {
                    quantity: -requestedQuantity
                }
            },
            {
                new: true
            }
        );

        // 11. Check whether enough stock was available
        if (!updatedProduct) {
            return res.status(400).json({
                message: "Not enough stock available"
            });
        }

        // 12. Get the current product price
        const pricePerUnit = product.price;

        // 13. Calculate total amount
        const totalAmount = pricePerUnit * requestedQuantity;

        // 14. Create the order
        try {
            const order = await Order.create({
                buyer: buyer._id,
                seller: product.seller,
                product: product._id,
                quantity: requestedQuantity,
                pricePerUnit,
                unit: product.unit,
                totalAmount,
                status: "pending"
            });

            // 15. Send successful response
            return res.status(201).json({
                message: "Order created successfully",
                order: {
                    id: order._id,
                    buyer: order.buyer,
                    seller: order.seller,
                    product: order.product,
                    quantity: order.quantity,
                    pricePerUnit: order.pricePerUnit,
                    unit: order.unit,
                    totalAmount: order.totalAmount,
                    status: order.status,
                    createdAt: order.createdAt
                }
            });

        } catch (orderError) {
            // Roll back the stock if order creation fails
            await Product.findByIdAndUpdate(
                productId,
                {
                    $inc: {
                        quantity: requestedQuantity
                    }
                }
            );

            throw orderError;
        }

    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            message: "Server error while creating order"
        });
    }
};


// ==============================
// Get My Orders
// ==============================
const getMyOrders = async (req, res) => {
    try {
        // Find orders placed by the logged-in user
        const orders = await Order.find({
            buyer: req.user.id
        })
            .populate("product", "name category images")
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Your orders retrieved successfully",
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        res.status(500).json({
            message: "Server error while retrieving your orders"
        });
    }
};


// ==============================
// Get Seller Orders
// ==============================
const getSellerOrders = async (req, res) => {
    try {
        // Find orders for products owned by the logged-in seller
        const orders = await Order.find({
            seller: req.user.id
        })
            .populate("buyer", "name email")
            .populate("product", "name category images")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Seller orders retrieved successfully",
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get seller orders error:", error);

        res.status(500).json({
            message: "Server error while retrieving seller orders"
        });
    }
};


// ==============================
// Get All Orders - Admin
// ==============================
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("buyer", "name email")
            .populate("seller", "name email")
            .populate("product", "name category")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All orders retrieved successfully",
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        res.status(500).json({
            message: "Server error while retrieving orders"
        });
    }
};


// ==============================
// Confirm Order
// ==============================
const confirmOrder = async (req, res) => {
    try {
        // Get order ID from the URL
        const { orderId } = req.params;

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Check if the logged-in user is the seller
        if (order.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the seller can confirm this order"
            });
        }

        // Only pending orders can be confirmed
        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Only pending orders can be confirmed"
            });
        }

        // Change order status
        order.status = "confirmed";

        await order.save();

        res.status(200).json({
            message: "Order confirmed successfully",
            order: {
                id: order._id,
                buyer: order.buyer,
                seller: order.seller,
                product: order.product,
                quantity: order.quantity,
                pricePerUnit: order.pricePerUnit,
                unit: order.unit,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error("Confirm order error:", error);

        res.status(500).json({
            message: "Server error while confirming order"
        });
    }
};




// ==============================
// Complete Order
// ==============================
const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Only the seller can complete the order
        if (order.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the seller can complete this order"
            });
        }

        // Only confirmed orders can be completed
        if (order.status !== "confirmed") {
            return res.status(400).json({
                message: "Only confirmed orders can be completed"
            });
        }

        order.status = "completed";

        await order.save();

        res.status(200).json({
            message: "Order completed successfully",
            order: {
                id: order._id,
                buyer: order.buyer,
                seller: order.seller,
                product: order.product,
                quantity: order.quantity,
                pricePerUnit: order.pricePerUnit,
                unit: order.unit,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error("Complete order error:", error);

        res.status(500).json({
            message: "Server error while completing order"
        });
    }
};





// ==============================
// Cancel Order
// ==============================
const cancelOrder = async (req, res) => {
    try {
        // Get order ID from the URL
        const { orderId } = req.params;

        // Find and cancel only a pending order
        // belonging to the logged-in buyer
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                buyer: req.user.id,
                status: "pending"
            },
            {
                $set: {
                    status: "cancelled"
                }
            },
            {
                new: true
            }
        );

        // Check whether the order could be cancelled
        if (!order) {
            return res.status(400).json({
                message:
                    "Order cannot be cancelled. It may not exist, may not belong to you, or may already be confirmed/cancelled."
            });
        }

        // Return the ordered quantity back to product stock
        const updatedProduct = await Product.findByIdAndUpdate(
            order.product,
            {
                $inc: {
                    quantity: order.quantity
                }
            },
            {
                new: true
            }
        );

        // If the product no longer exists, restore the order
        // back to pending because stock could not be restored.
        if (!updatedProduct) {
            await Order.findByIdAndUpdate(
                order._id,
                {
                    $set: {
                        status: "pending"
                    }
                }
            );

            return res.status(404).json({
                message:
                    "Product not found. Order cancellation was not completed."
            });
        }

        // Send successful response
        res.status(200).json({
            message: "Order cancelled successfully",
            order: {
                id: order._id,
                buyer: order.buyer,
                seller: order.seller,
                product: order.product,
                quantity: order.quantity,
                pricePerUnit: order.pricePerUnit,
                unit: order.unit,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error("Cancel order error:", error);

        res.status(500).json({
            message: "Server error while cancelling order"
        });
    }
};





// ==============================
// Export Controllers
// ==============================
export {
    createOrder,
    getMyOrders,
    getSellerOrders,
    getAllOrders,
    confirmOrder,
    completeOrder,
    cancelOrder
};