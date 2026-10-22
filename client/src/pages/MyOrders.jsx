import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./MyOrders.css";

const MyOrders = () => {
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    const fetchOrders = async () => {
        try {
            setError("");

            const response = await api.get("/orders/my-orders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrders(response.data.orders);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load your orders."
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

    const handleCancel = async (orderId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(orderId);
            setError("");

            await api.patch(
                `/orders/${orderId}/cancel`,
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
                "Failed to cancel the order."
            );
        } finally {
            setCancellingId(null);
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
            <div className="container py-5 text-center">
                <div
                    className="spinner-border text-success"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p className="mt-3">
                    Loading your orders...
                </p>
            </div>
        );
    }

    return (
        <div className="container py-5  my-orders-page">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-success">
                        My Orders
                    </h1>

                    <p className="text-muted mb-0">
                        View and manage your purchases.
                    </p>
                </div>

                <Link
                    to="/products"
                    className="btn btn-success"
                >
                    Continue Shopping
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
                        🛒
                    </div>

                    <h4>
                        You don't have any orders yet.
                    </h4>

                    <p className="text-muted">
                        Browse the marketplace and find
                        something you like.
                    </p>

                    <Link
                        to="/products"
                        className="btn btn-success"
                    >
                        Browse Marketplace
                    </Link>

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

                                        {/* Product */}
                                        <div className="col-md-4">

                                            <h5 className="mb-1">
                                                {order.product?.name ||
                                                    "Product unavailable"}
                                            </h5>

                                            <p className="text-muted mb-1">
                                                Seller:{" "}
                                                {order.seller?.name ||
                                                    "Unknown seller"}
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
                                                    className="btn btn-outline-danger btn-sm w-100"
                                                    onClick={() =>
                                                        handleCancel(
                                                            order._id
                                                        )
                                                    }
                                                    disabled={
                                                        cancellingId ===
                                                        order._id
                                                    }
                                                >
                                                    {cancellingId ===
                                                    order._id
                                                        ? "Cancelling..."
                                                        : "Cancel Order"}
                                                </button>
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

export default MyOrders;