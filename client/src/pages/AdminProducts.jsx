import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminProducts() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState("");

    // Fetch products waiting for admin approval
    const fetchPendingProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/products/pending-products",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProducts(response.data.products || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load pending products."
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Protect this page from unauthorized users
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (user?.role !== "admin") {
            navigate("/products");
            return;
        }

        fetchPendingProducts();
    }, [token, user, navigate, fetchPendingProducts]);

    // Approve a pending product
    const handleApprove = async (productId, productName) => {
        const confirmed = window.confirm(
            `Are you sure you want to approve "${productName}"?`
        );

        if (!confirmed) return;

        try {
            setProcessingId(productId);
            setError("");
            setMessage("");

            const response = await api.patch(
                `/admin/products/${productId}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                response.data.message ||
                "Product approved successfully."
            );

            await fetchPendingProducts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to approve product."
            );
        } finally {
            setProcessingId("");
        }
    };

    // Reject a pending product
    const handleReject = async (productId, productName) => {
        const confirmed = window.confirm(
            `Are you sure you want to reject "${productName}"?`
        );

        if (!confirmed) return;

        try {
            setProcessingId(productId);
            setError("");
            setMessage("");

            const response = await api.patch(
                `/admin/products/${productId}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                response.data.message ||
                "Product rejected successfully."
            );

            await fetchPendingProducts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to reject product."
            );
        } finally {
            setProcessingId("");
        }
    };

    return (
        <div className="container-fluid px-3 px-md-5 py-4">

            {/* Page Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="text-success mb-1">
                        Product Management
                    </h2>

                    <p className="text-muted mb-0">
                        Review product listings before they appear
                        in the marketplace.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-success"
                        onClick={fetchPendingProducts}
                        disabled={loading || !!processingId}
                    >
                        Refresh
                    </button>

                    <Link
                        to="/admin"
                        className="btn btn-success"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {message && (
                <div className="alert alert-success" role="alert">
                    {message}
                </div>
            )}

            {/* Pending Products */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">
                        Pending Products{" "}
                        <span className="badge text-bg-warning">
                            {products.length}
                        </span>
                    </h5>
                </div>

                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-success"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p className="mt-2 mb-0">
                                Loading pending products...
                            </p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-5">
                            <h5>No pending products</h5>

                            <p className="text-muted mb-0">
                                All product listings have been reviewed.
                            </p>
                        </div>
                    ) : (
                        <div className="row">
                            {products.map((product) => (
                                <div
                                    className="col-md-6 col-xl-4 mb-4"
                                    key={product._id}
                                >
                                    <div className="card h-100 shadow-sm">

                                        {/* Product Image */}
                                        {product.images?.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                className="card-img-top"
                                                alt={product.name}
                                                style={{
                                                    height: "220px",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="bg-light d-flex align-items-center justify-content-center"
                                                style={{ height: "220px" }}
                                            >
                                                <span className="text-muted">
                                                    No product image
                                                </span>
                                            </div>
                                        )}

                                        <div className="card-body d-flex flex-column">

                                            {/* Product Name and Status */}
                                            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                                <h5 className="card-title mb-0">
                                                    {product.name}
                                                </h5>

                                                <span className="badge text-bg-warning">
                                                    Pending
                                                </span>
                                            </div>

                                            {/* Category */}
                                            <p className="text-muted small mb-2">
                                                {product.category}
                                            </p>

                                            {/* Description */}
                                            <p className="card-text">
                                                {product.description}
                                            </p>

                                            {/* Price */}
                                            <h5 className="text-success mb-3">
                                                LKR{" "}
                                                {Number(
                                                    product.price
                                                ).toLocaleString()}{" "}
                                                / {product.unit}
                                            </h5>

                                            {/* Quantity */}
                                            <p className="small mb-1">
                                                <strong>Quantity:</strong>{" "}
                                                {product.quantity}{" "}
                                                {product.unit}
                                            </p>

                                            {/* Seller */}
                                            <p className="small mb-1">
                                                <strong>Seller:</strong>{" "}
                                                {product.seller?.name ||
                                                    "Unknown"}
                                            </p>

                                            <p className="small text-muted mb-3">
                                                {product.seller?.email || ""}
                                            </p>

                                            {/* Submission Date */}
                                            <p className="small text-muted">
                                                Submitted:{" "}
                                                {product.createdAt
                                                    ? new Date(
                                                        product.createdAt
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </p>

                                            {/* Approve and Reject Buttons */}
                                            <div className="mt-auto d-flex gap-2">
                                                <button
                                                    className="btn btn-success flex-fill"
                                                    disabled={
                                                        !!processingId
                                                    }
                                                    onClick={() =>
                                                        handleApprove(
                                                            product._id,
                                                            product.name
                                                        )
                                                    }
                                                >
                                                    {processingId ===
                                                    product._id
                                                        ? "Processing..."
                                                        : "Approve"}
                                                </button>

                                                <button
                                                    className="btn btn-outline-danger flex-fill"
                                                    disabled={
                                                        !!processingId
                                                    }
                                                    onClick={() =>
                                                        handleReject(
                                                            product._id,
                                                            product.name
                                                        )
                                                    }
                                                >
                                                    {processingId ===
                                                    product._id
                                                        ? "Processing..."
                                                        : "Reject"}
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminProducts;
