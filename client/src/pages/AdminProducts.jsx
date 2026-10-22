import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./AdminProducts.css";

function AdminProducts() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState("");
    const [search, setSearch] = useState("");

    // Fetch pending products — existing API
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

    // Admin access protection
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

    // Approve product — existing API
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

    // Reject product — existing API
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

    const filteredProducts = products.filter((product) => {
        const query = search.trim().toLowerCase();

        return (
            !query ||
            product.name?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.seller?.name?.toLowerCase().includes(query) ||
            product.seller?.email?.toLowerCase().includes(query)
        );
    });

    const formatPrice = (price) =>
        Number(price || 0).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    return (
        <div className="admin-products-page">

            {/* Page Header */}
            <header className="ap-header">
                <div>
                    <h1>
                        Product <span>management.</span>
                    </h1>
                    <p>
                        Review product listings before they appear
                        in the marketplace.
                    </p>
                </div>

                <div className="ap-header-actions">
                    <button
                        type="button"
                        className="ap-btn ap-btn-light"
                        onClick={fetchPendingProducts}
                        disabled={loading || !!processingId}
                    >
                        <span className={loading ? "ap-refreshing" : ""}>
                            ↻
                        </span>
                        Refresh
                    </button>

                    <Link to="/admin" className="ap-btn ap-btn-dark">
                        ← Dashboard
                    </Link>
                </div>
            </header>

            {/* Feedback Messages */}
            {error && (
                <div className="ap-alert ap-alert-error" role="alert">
                    <span>!</span>
                    {error}
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            {message && (
                <div className="ap-alert ap-alert-success" role="status">
                    <span>✓</span>
                    {message}
                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Overview Panel */}
            <section className="ap-overview">
                <div className="ap-overview-main">
                    <div className="ap-overview-icon">◇</div>

                    <div>
                        <p className="ap-overview-label">
                            Awaiting approval
                        </p>
                        <h2>{products.length}</h2>
                        <p className="ap-overview-caption">
                            Product listings awaiting review
                        </p>
                    </div>
                </div>

                <div className="ap-overview-note">
                    <span className="ap-overview-dot" />
                    Review each listing before approving
                </div>
            </section>

            {/* Pending Products */}
            <section className="ap-products-card">

                <div className="ap-products-heading">
                    <div>
                        <h2>Pending products</h2>
                        <p>
                            Review product details and seller information.
                        </p>
                    </div>

                    <div className="ap-search">
                        <span>⌕</span>
                        <input
                            type="search"
                            placeholder="Search products or sellers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search products or sellers"
                        />
                    </div>
                </div>

                {!loading && products.length > 0 && (
                    <div className="ap-products-meta">
                        <span>
                            {filteredProducts.length}{" "}
                            {filteredProducts.length === 1
                                ? "listing"
                                : "listings"}
                        </span>
                        <span className="ap-pending-label">
                            <span />
                            Pending review
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="ap-state">
                        <div className="ap-spinner" />
                        <p>Loading pending products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="ap-state">
                        <div className="ap-empty-icon">◇</div>
                        <h3>
                            {products.length === 0
                                ? "All caught up!"
                                : "No products found"}
                        </h3>
                        <p>
                            {products.length === 0
                                ? "All product listings have been reviewed."
                                : "Try another product name, category, or seller."}
                        </p>
                        {search && (
                            <button
                                type="button"
                                className="ap-clear-search"
                                onClick={() => setSearch("")}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="ap-product-grid">
                        {filteredProducts.map((product) => (
                            <article
                                className="ap-product-item"
                                key={product._id}
                            >
                                {/* Product Image */}
                                <div className="ap-product-image">
                                    {product.images?.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="ap-no-image">
                                            <span>◇</span>
                                            <p>No product image</p>
                                        </div>
                                    )}

                                    <span className="ap-image-status">
                                        <span />
                                        Pending
                                    </span>
                                </div>

                                {/* Product Details */}
                                <div className="ap-product-body">
                                    <p className="ap-product-category">
                                        {product.category || "Uncategorized"}
                                    </p>

                                    <h3>{product.name}</h3>

                                    <p className="ap-product-description">
                                        {product.description ||
                                            "No description provided."}
                                    </p>

                                    <div className="ap-product-price">
                                        <strong>
                                            LKR {formatPrice(product.price)}
                                        </strong>
                                        <span>/ {product.unit}</span>
                                    </div>

                                    <div className="ap-product-info">
                                        <div>
                                            <span>Available quantity</span>
                                            <strong>
                                                {product.quantity} {product.unit}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Submitted</span>
                                            <strong>
                                                {product.createdAt
                                                    ? new Date(
                                                        product.createdAt
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "2-digit",
                                                            year: "numeric"
                                                        }
                                                    )
                                                    : "—"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="ap-seller">
                                        <div className="ap-seller-avatar">
                                            {(
                                                product.seller?.name || "?"
                                            ).charAt(0).toUpperCase()}
                                        </div>

                                        <div className="ap-seller-details">
                                            <span>Listed by</span>
                                            <strong>
                                                {product.seller?.name ||
                                                    "Unknown seller"}
                                            </strong>
                                            <small>
                                                {product.seller?.email || ""}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Existing Approval Actions */}
                                    <div className="ap-product-actions">
                                        <button
                                            type="button"
                                            className="ap-btn ap-btn-approve"
                                            disabled={!!processingId}
                                            onClick={() =>
                                                handleApprove(
                                                    product._id,
                                                    product.name
                                                )
                                            }
                                        >
                                            {processingId === product._id
                                                ? "Processing..."
                                                : "✓ Approve"}
                                        </button>

                                        <button
                                            type="button"
                                            className="ap-btn ap-btn-reject"
                                            disabled={!!processingId}
                                            onClick={() =>
                                                handleReject(
                                                    product._id,
                                                    product.name
                                                )
                                            }
                                        >
                                            {processingId === product._id
                                                ? "Processing..."
                                                : "Reject"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!loading && filteredProducts.length > 0 && (
                    <footer className="ap-products-footer">
                        <span>
                            Showing <strong>{filteredProducts.length}</strong>
                            {" "}of <strong>{products.length}</strong> pending
                            products
                        </span>
                        <span>FarmLink · Product review</span>
                    </footer>
                )}
            </section>
        </div>
    );
}

export default AdminProducts;
