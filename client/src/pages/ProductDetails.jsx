
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./ProductDetails.css";

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/products/${productId}`
                );

                setProduct(response.data.product);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load product."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Quantity step: 0.1 for kg/litre, 1 for other units
    const quantityStep =
        product?.unit === "kg" ||
        product?.unit === "litre"
            ? 0.1
            : 1;

    // Check whether the logged-in user owns this product
    const sellerId =
        product?.seller?._id?.toString();

    const currentUserId =
        user?.id?.toString() ||
        user?._id?.toString();

    const isOwnProduct =
        Boolean(currentUserId && sellerId) &&
        currentUserId === sellerId;

    const increaseQuantity = () => {
        if (!product) return;

        const newQuantity = Number(
            (Number(quantity || 0) + quantityStep).toFixed(3)
        );

        if (newQuantity <= product.quantity) {
            setQuantity(newQuantity);
        }
    };

    const decreaseQuantity = () => {
        const newQuantity = Number(
            (Number(quantity || 0) - quantityStep).toFixed(3)
        );

        if (newQuantity > 0) {
            setQuantity(newQuantity);
        }
    };

    const handleQuantityChange = (event) => {
        const value = event.target.value;

        if (value === "") {
            setQuantity("");
            return;
        }

        const numericValue = Number(value);

        if (
            Number.isFinite(numericValue) &&
            numericValue >= 0
        ) {
            setQuantity(numericValue);
        }
    };

    const handleBuyNow = async () => {
        setError("");
        setSuccess("");

        if (!token) {
            navigate("/login");
            return;
        }

        if (isOwnProduct) {
            setError("You cannot purchase your own product.");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }

        if (Number(quantity) > product.quantity) {
            setError(
                `Only ${product.quantity} ${product.unit} is available.`
            );
            return;
        }

        setBuying(true);

        try {
            await api.post(
                "/orders",
                {
                    productId: product._id,
                    quantity: Number(quantity)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(
                "Order placed successfully! Your order is waiting for seller confirmation."
            );

            // Refresh the product to show the latest stock
            const response = await api.get(
                `/products/${productId}`
            );

            setProduct(response.data.product);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to place order."
            );
        } finally {
            setBuying(false);
        }
    };

    if (loading) {
        return (
            <main className="product-details-page">
                <div className="product-details-container product-details-state">
                    <div className="product-details-spinner" role="status" aria-label="Loading product" />
                    <p>Loading product...</p>
                </div>
            </main>
        );
    }

    if (error && !product) {
        return (
            <main className="product-details-page">
                <div className="product-details-container">
                    <div className="product-details-alert product-details-alert-error" role="alert">
                        {error}
                    </div>
                    <Link to="/products" className="product-details-back">
                        <span aria-hidden="true">←</span> Back to Marketplace
                    </Link>
                </div>
            </main>
        );
    }

    if (!product) return null;

    const totalPrice = Number(product.price) * Number(quantity || 0);
    const isOutOfStock = Number(product.quantity) <= 0;

    const categoryClass = {
        Vegetables: "product-details-category-vegetables",
        Fruits: "product-details-category-fruits",
        Grains: "product-details-category-grains",
        Dairy: "product-details-category-dairy",
        Meat: "product-details-category-meat",
        Other: "product-details-category-other",
    }[product.category] || "product-details-category-other";

    return (
        <main className="product-details-page">
            <div className="product-details-container">
                <Link to="/products" className="product-details-back">
                    <span aria-hidden="true">←</span>
                    Back to Marketplace
                </Link>

                {error && (
                    <div className="product-details-alert product-details-alert-error" role="alert">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="product-details-alert product-details-alert-success" role="status">
                        <span className="product-details-alert-icon" aria-hidden="true">✓</span>
                        <span>{success}</span>
                    </div>
                )}

                <section className="product-details-layout">
                    {/* Product image */}
                    <div className="product-details-media-column">
                        <div className="product-details-image-wrap">
                            {product.images?.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="product-details-image"
                                />
                            ) : (
                                <div className="product-details-image-placeholder">
                                    <span className="product-details-placeholder-icon" aria-hidden="true">🌿</span>
                                    <span>No image available</span>
                                </div>
                            )}
                            
                        </div>
                    </div>

                    {/* Product information */}
                    <div className="product-details-info">
                        <div className="product-details-category-row">
                            <span className={`product-details-category ${categoryClass}`}>
                                {product.category}
                            </span>
                            <span className={`product-details-stock ${isOutOfStock ? "is-out-of-stock" : "is-in-stock"}`}>
                                <span className="product-details-stock-dot" />
                                {isOutOfStock ? "Out of stock" : "Available"}
                            </span>
                        </div>

                        <h1 className="product-details-title">{product.name}</h1>

                        <p className="product-details-description">
                            {product.description || "No description has been provided for this product."}
                        </p>

                        <div className="product-details-price-block">
                            <p className="product-details-price">
                                Rs. {Number(product.price).toLocaleString("en-LK", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                            <span className="product-details-price-unit">per {product.unit}</span>
                        </div>

                        <hr className="product-details-divider" />

                        <div className="product-details-meta">
                            <div className="product-details-meta-item">
                                <span className="product-details-meta-icon" aria-hidden="true">♙</span>
                                <span className="product-details-meta-copy">
                                    <small>Sold by</small>
                                    <strong>{product.seller?.name || "Unknown seller"}</strong>
                                </span>
                            </div>
                            <div className="product-details-meta-item">
                                <span className="product-details-meta-icon" aria-hidden="true">▦</span>
                                <span className="product-details-meta-copy">
                                    <small>Available quantity</small>
                                    <strong>
                                        {product.quantity} {product.unit}
                                    </strong>
                                </span>
                            </div>
                        </div>

                        {isOwnProduct ? (
                            <div className="product-details-own-product">
                                <strong>This is your product</strong>
                                <p>You can manage this listing from My Products.</p>
                                <Link to="/my-products" className="product-details-manage-btn">
                                    Manage My Products <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="product-details-purchase">
                                {isOutOfStock ? (
                                    <div className="product-details-out-of-stock-message">
                                        <strong>Currently unavailable</strong>
                                        <span>This product is out of stock. Please check back later.</span>
                                    </div>
                                ) : (
                                    <>
                                        <label className="product-details-label" htmlFor="product-quantity">
                                            Choose quantity
                                            <span>({product.unit})</span>
                                        </label>

                                        <div className="product-details-quantity">
                                            <button
                                                type="button"
                                                aria-label="Decrease quantity"
                                                onClick={decreaseQuantity}
                                                disabled={Number(quantity) <= quantityStep}
                                            >
                                                −
                                            </button>

                                            <input
                                                id="product-quantity"
                                                type="number"
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                min={quantityStep}
                                                max={product.quantity}
                                                step="any"
                                                aria-label={`Quantity in ${product.unit}`}
                                            />

                                            <button
                                                type="button"
                                                aria-label="Increase quantity"
                                                onClick={increaseQuantity}
                                                disabled={Number(quantity) >= product.quantity}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="product-details-total">
                                            <span className="product-details-total-label">
                                                Order subtotal
                                                <small>
                                                    {quantity || 0} {product.unit} × Rs. {Number(product.price).toLocaleString("en-LK", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </small>
                                            </span>
                                            <strong>
                                                Rs. {totalPrice.toLocaleString("en-LK", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </strong>
                                        </div>

                                        <button
                                            type="button"
                                            className="product-details-buy"
                                            onClick={handleBuyNow}
                                            disabled={
                                                buying ||
                                                !quantity ||
                                                Number(quantity) <= 0 ||
                                                Number(quantity) > product.quantity
                                            }
                                        >
                                            {buying ? (
                                                <>
                                                    <span className="product-details-button-spinner" />
                                                    Placing Order...
                                                </>
                                            ) : (
                                                <>
                                                    Buy Now <span aria-hidden="true">→</span>
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ProductDetails;
