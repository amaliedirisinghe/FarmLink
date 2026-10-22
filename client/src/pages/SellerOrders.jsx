import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./SellerOrders.css";

const SellerOrders = () => {
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchOrders = async () => {
        try {
            setError("");

            const response = await api.get("/orders/seller-orders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrders(response.data.orders);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load seller orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    const handleConfirm = async (orderId) => {
        try {
            setActionLoading(orderId);
            setError("");

            await api.patch(
                `/orders/${orderId}/confirm`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchOrders();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to confirm the order."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (orderId) => {
        try {
            setActionLoading(orderId);
            setError("");

            await api.patch(
                `/orders/${orderId}/complete`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchOrders();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to complete the order."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "bg-warning text-dark";

            case "confirmed":
                return "bg-primary";

            case "completed":
                return "bg-success";

            case "cancelled":
                return "bg-danger";

            default:
                return "bg-secondary";
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center seller-orders-page">
                <div
                    className="spinner-border text-success"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p className="mt-3">
                    Loading seller orders...
                </p>
            </div>
        );
    }

    return (
        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-success">
                        Seller Orders
                    </h1>

                    <p className="text-muted mb-0">
                        Manage orders placed for your products.
                    </p>
                </div>

                <Link
                    to="/products"
                    className="btn btn-outline-success"
                >
                    Marketplace
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-5">

                    <div className="mb-3 fs-1">
                        📦
                    </div>

                    <h4>
                        No orders yet.
                    </h4>

                    <p className="text-muted">
                        Orders placed for your products will
                        appear here.
                    </p>

                </div>
            ) : (
                <div className="row g-4">

                    {orders.map((order) => (
                        <div
                            className="col-12"
                            key={order._id}
                        >
                            <div className="card shadow-sm">

                                <div className="card-body">

                                    <div className="row align-items-center">

                                        {/* Product & Buyer */}
                                        <div className="col-md-4">

                                            <h5 className="mb-1">
                                                {order.product?.name ||
                                                    "Product unavailable"}
                                            </h5>

                                            <p className="mb-1">
                                                <strong>
                                                    Buyer:
                                                </strong>{" "}
                                                {order.buyer?.name ||
                                                    "Unknown buyer"}
                                            </p>

                                            <p className="text-muted mb-1">
                                                {order.buyer?.email ||
                                                    ""}
                                            </p>

                                            <small className="text-muted">
                                                Ordered on{" "}
                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString()}
                                            </small>

                                        </div>

                                        {/* Quantity */}
                                        <div className="col-md-2 mt-3 mt-md-0">

                                            <small className="text-muted d-block">
                                                Quantity
                                            </small>

                                            <strong>
                                                {order.quantity}{" "}
                                                {order.unit}
                                            </strong>

                                        </div>

                                        {/* Total */}
                                        <div className="col-md-2 mt-3 mt-md-0">

                                            <small className="text-muted d-block">
                                                Total
                                            </small>

                                            <strong className="text-success">
                                                Rs.{" "}
                                                {Number(
                                                    order.totalAmount
                                                ).toFixed(2)}
                                            </strong>

                                        </div>

                                        {/* Status */}
                                        <div className="col-md-2 mt-3 mt-md-0">

                                            <small className="text-muted d-block mb-1">
                                                Status
                                            </small>

                                            <span
                                                className={`badge ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    order.status.slice(1)}
                                            </span>

                                        </div>

                                        {/* Actions */}
                                        <div className="col-md-2 mt-3 mt-md-0">

                                            {order.status ===
                                                "pending" && (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm w-100"
                                                    onClick={() =>
                                                        handleConfirm(
                                                            order._id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        order._id
                                                    }
                                                >
                                                    {actionLoading ===
                                                    order._id
                                                        ? "Processing..."
                                                        : "Confirm Order"}
                                                </button>
                                            )}

                                            {order.status ===
                                                "confirmed" && (
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm w-100"
                                                    onClick={() =>
                                                        handleComplete(
                                                            order._id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        order._id
                                                    }
                                                >
                                                    {actionLoading ===
                                                    order._id
                                                        ? "Processing..."
                                                        : "Complete Order"}
                                                </button>
                                            )}

                                            {order.status ===
                                                "completed" && (
                                                <span className="text-success small">
                                                    Order completed
                                                </span>
                                            )}

                                            {order.status ===
                                                "cancelled" && (
                                                <span className="text-danger small">
                                                    Order cancelled
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default SellerOrders;