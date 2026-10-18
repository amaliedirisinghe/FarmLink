
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

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
                    Loading product...
                </p>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error}
                </div>

                <Link
                    to="/products"
                    className="btn btn-success"
                >
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const totalPrice =
        Number(product.price) * Number(quantity || 0);

    return (
        <div className="container py-5">

            <Link
                to="/products"
                className="btn btn-outline-success mb-4"
            >
                ← Back to Marketplace
            </Link>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            <div className="row g-5">

                {/* Product Image */}
                <div className="col-md-6">
                    {product.images?.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="img-fluid rounded shadow-sm"
                            style={{
                                width: "100%",
                                height: "450px",
                                objectFit: "cover"
                            }}
                        />
                    ) : (
                        <div
                            className="bg-light rounded d-flex align-items-center justify-content-center"
                            style={{
                                width: "100%",
                                height: "450px"
                            }}
                        >
                            <span className="text-muted fs-5">
                                No image available
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Information */}
                <div className="col-md-6">

                    <span className="badge bg-success mb-3">
                        {product.category}
                    </span>

                    <h1 className="mb-3">
                        {product.name}
                    </h1>

                    <p className="text-muted fs-5">
                        {product.description}
                    </p>

                    <hr />

                    <h2 className="text-success">
                        Rs. {product.price}

                        <small className="text-muted fs-5">
                            {" "} / {product.unit}
                        </small>
                    </h2>

                    <p className="mt-3">
                        <strong>Seller:</strong>{" "}
                        {product.seller?.name || "Unknown seller"}
                    </p>

                    <p>
                        <strong>Available:</strong>{" "}
                        {product.quantity} {product.unit}
                    </p>

                    {/* Own Product Message */}
                    {isOwnProduct ? (
                        <div className="alert alert-info mt-4">
                            <strong>This is your product.</strong>

                            <p className="mb-0 mt-2">
                                You can manage this listing from My Products.
                            </p>

                            <Link
                                to="/my-products"
                                className="btn btn-outline-success mt-3"
                            >
                                Manage My Products
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Quantity */}
                            {product.quantity > 0 ? (
                                <div className="mt-4">

                                    <label className="form-label fw-bold">
                                        Quantity ({product.unit})
                                    </label>

                                    <div className="input-group mb-3">

                                        <button
                                            type="button"
                                            className="btn btn-outline-success"
                                            onClick={decreaseQuantity}
                                            disabled={
                                                Number(quantity) <= quantityStep
                                            }
                                        >
                                            −
                                        </button>

                                        <input
                                            type="number"
                                            className="form-control text-center"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            min={quantityStep}
                                            max={product.quantity}
                                            step="any"
                                        />

                                        <button
                                            type="button"
                                            className="btn btn-outline-success"
                                            onClick={increaseQuantity}
                                            disabled={
                                                Number(quantity) >= product.quantity
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                    <small className="text-muted">
                                        You can enter a decimal quantity,
                                        for example 0.5 kg.
                                    </small>

                                </div>
                            ) : (
                                <div className="alert alert-warning mt-4">
                                    <strong>Out of Stock</strong>
                                    <br />
                                    This product is currently unavailable.
                                </div>
                            )}

                            {/* Total */}
                            {product.quantity > 0 && (
                                <div className="bg-light rounded p-3 mb-4 mt-3">
                                    <div className="d-flex justify-content-between">

                                        <span>
                                            {quantity || 0} × Rs.{" "}
                                            {product.price}
                                        </span>

                                        <strong>
                                            Rs. {totalPrice.toFixed(2)}
                                        </strong>

                                    </div>
                                </div>
                            )}

                            {/* Buy Now */}
                            {product.quantity > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-success btn-lg w-100"
                                    onClick={handleBuyNow}
                                    disabled={
                                        buying ||
                                        !quantity ||
                                        Number(quantity) <= 0 ||
                                        Number(quantity) > product.quantity
                                    }
                                >
                                    {buying
                                        ? "Placing Order..."
                                        : "Buy Now"}
                                </button>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
