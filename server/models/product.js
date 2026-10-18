import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        unit: {
            type: String,
            required: true,
            trim: true
        },

        // Cloudinary image URLs
        images: [
            {
                type: String
            }
        ],

        // Cloudinary public IDs
        imagePublicIds: [
            {
                type: String
            }
        ],

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

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