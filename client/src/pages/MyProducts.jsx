import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const MyProducts = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        try {
            setError("");

            const response = await api.get("/products/my-products", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setProducts(response.data.products);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load your products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token]);

    const getStatusClass = (status) => {
        switch (status) {
            case "approved":
                return "bg-success";

            case "pending":
                return "bg-warning text-dark";

            case "rejected":
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
                    Loading your products...
                </p>
            </div>
        );
    }

    return (
        <div className="container py-5">

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h1 className="text-success">
                        My Products
                    </h1>

                    <p className="text-muted mb-0">
                        Manage the products you sell on FarmLink.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => navigate("/add-product")}
                >
                    + Add Product
                </button>

            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* No Products */}
            {products.length === 0 ? (
                <div className="text-center py-5">

                    <div className="mb-3 fs-1">
                        🌱
                    </div>

                    <h4>
                        You don't have any products yet.
                    </h4>

                    <p className="text-muted">
                        Add your first product to start selling.
                    </p>

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => navigate("/add-product")}
                    >
                        + Add Product
                    </button>

                </div>
            ) : (

                /* Products */
                <div className="row g-4">

                    {products.map((product) => (

                        <div
                            className="col-md-6 col-lg-4"
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
                                        style={{
                                            height: "220px"
                                        }}
                                    >
                                        <span className="text-muted">
                                            No image available
                                        </span>
                                    </div>
                                )}

                                <div className="card-body d-flex flex-column">

                                    {/* Category + Status */}
                                    <div className="d-flex justify-content-between align-items-start mb-2">

                                        <span className="badge bg-success">
                                            {product.category}
                                        </span>

                                        <span
                                            className={`badge ${getStatusClass(
                                                product.status
                                            )}`}
                                        >
                                            {product.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                product.status.slice(1)}
                                        </span>

                                    </div>

                                    {/* Product Name */}
                                    <h5 className="card-title">
                                        {product.name}
                                    </h5>

                                    {/* Description */}
                                    <p className="card-text text-muted">
                                        {product.description}
                                    </p>

                                    <div className="mt-auto">

                                        {/* Price */}
                                        <h5 className="text-success">
                                            Rs. {product.price}

                                            <small className="text-muted">
                                                {" "} / {product.unit}
                                            </small>
                                        </h5>

                                        {/* Quantity */}
                                        <p className="mb-3">
                                            <strong>
                                                Available:
                                            </strong>{" "}
                                            {product.quantity}{" "}
                                            {product.unit}
                                        </p>

                                        {/* Manage */}
                                        <button
                                            type="button"
                                            className="btn btn-outline-success w-100"
                                            onClick={() =>
                                                navigate(`/manage-product/${product._id}`)
                                            }
                                        >
                                            Manage Product
                                        </button>

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

export default MyProducts;