import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        // Product name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Product category
        category: {
            type: String,
            required: true,
            trim: true
        },

        // Product description
        description: {
            type: String,
            required: true,
            trim: true
        },

        // Price per unit
        price: {
            type: Number,
            required: true,
            min: 0
        },

        // Available quantity
        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        // Unit such as kg, g, litre, etc.
        unit: {
            type: String,
            required: true,
            trim: true
        },

        // Product images
        images: [
            {
                type: String
            }
        ],

        // User who created the listing
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Product approval status
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;