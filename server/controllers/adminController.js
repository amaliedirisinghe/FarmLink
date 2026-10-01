import User from "../models/User.js";

// ==============================
// Get Pending Users
// ==============================
const getPendingUsers = async (req, res) => {
    try {
        // Find all users waiting for admin approval
        const users = await User.find(
            { status: "pending" },
            {
                name: 1,
                email: 1,
                role: 1,
                status: 1,
                createdAt: 1
            }
        ).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Pending users retrieved successfully",
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get pending users error:", error);

        res.status(500).json({
            message: "Server error while retrieving pending users"
        });
    }
};


// ==============================
// Approve User
// ==============================
const approveUser = async (req, res) => {
    try {
        // Get user ID from the URL
        const { userId } = req.params;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only pending users can be approved
        if (user.status !== "pending") {
            return res.status(400).json({
                message: "Only pending users can be approved"
            });
        }

        // Change user status to active
        user.status = "active";

        await user.save();

        res.status(200).json({
            message: "User approved successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Approve user error:", error);

        res.status(500).json({
            message: "Server error while approving user"
        });
    }
};


// ==============================
// Reject User
// ==============================
const rejectUser = async (req, res) => {
    try {
        // Get user ID from the URL
        const { userId } = req.params;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Only pending users can be rejected
        if (user.status !== "pending") {
            return res.status(400).json({
                message: "Only pending users can be rejected"
            });
        }

        // Change user status to rejected
        user.status = "rejected";

        await user.save();

        res.status(200).json({
            message: "User rejected successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Reject user error:", error);

        res.status(500).json({
            message: "Server error while rejecting user"
        });
    }
};


// ==============================
// Export Controllers
// ==============================
export {
    getPendingUsers,
    approveUser,
    rejectUser
};