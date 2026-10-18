
import User from "../models/User.js";
import Product from "../models/Product.js";

// Add a product to favourites
export const addFavorite = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            status: "approved"
        });

        if (!product) {
            return res.status(404).json({
                message: "Approved product not found."
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $addToSet: { favorites: product._id }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json({
            message: "Product added to favourites.",
            favorites: user.favorites || []
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID."
            });
        }

        console.error("Add favourite error:", error);
        return res.status(500).json({
            message: "Failed to add favourite."
        });
    }
};

// Remove a product from favourites
export const removeFavorite = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $pull: { favorites: productId }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json({
            message: "Product removed from favourites.",
            favorites: user.favorites || []
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID."
            });
        }

        console.error("Remove favourite error:", error);
        return res.status(500).json({
            message: "Failed to remove favourite."
        });
    }
};

// Get the logged-in user's favourites
export const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: "favorites",
                match: { status: "approved" }
            });

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const favorites = (user.favorites || []).filter(Boolean);

        return res.status(200).json({
            count: favorites.length,
            favorites
        });
    } catch (error) {
        console.error("Get favourites error:", error);
        return res.status(500).json({
            message: "Failed to retrieve favourites."
        });
    }
};
