
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            pendingUsers,
            rejectedUsers,
            totalProducts,
            pendingProducts,
            approvedProducts,
            rejectedProducts,
            totalOrders,
            pendingOrders,
            completedOrders,
            completedOrderValue
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: "active" }),
            User.countDocuments({ status: "pending" }),
            User.countDocuments({ status: "rejected" }),

            Product.countDocuments(),
            Product.countDocuments({ status: "pending" }),
            Product.countDocuments({ status: "approved" }),
            Product.countDocuments({ status: "rejected" }),

            Order.countDocuments(),
            Order.countDocuments({ status: "pending" }),
            Order.countDocuments({ status: "completed" }),

            Order.aggregate([
                { $match: { status: "completed" } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ])
        ]);

        res.status(200).json({
            message: "Dashboard statistics retrieved successfully",
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    pending: pendingUsers,
                    rejected: rejectedUsers
                },
                products: {
                    total: totalProducts,
                    pending: pendingProducts,
                    approved: approvedProducts,
                    rejected: rejectedProducts
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    completed: completedOrders,
                    completedOrderValue: completedOrderValue[0]?.total || 0
                }
            }
        });
    } catch (error) {
        console.error("Get dashboard statistics error:", error);

        res.status(500).json({
            message: "Server error while retrieving dashboard statistics"
        });
    }
};

export { getDashboardStats };
