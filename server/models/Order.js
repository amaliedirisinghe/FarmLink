import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        // User who placed the order
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // User who owns the product
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Product being purchased
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        // Quantity purchased
        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        // Product price at the time of purchase
        pricePerUnit: {
            type: Number,
            required: true,
            min: 0
        },

        // Unit such as kg, litre, etc.
        unit: {
            type: String,
            required: true,
            trim: true
        },

        // Total order amount
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        // Order status
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "cancelled",
                "completed"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;