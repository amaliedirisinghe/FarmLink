
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./MyFavorites.css";

const MyFavorites = () => {
    const { token } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [removingId, setRemovingId] = useState("");

    const fetchFavorites = async () => {
        if (!token) {
            setFavorites([]);
            setError("Please log in to view your favourites.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("/favorites", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFavorites(response.data.favorites || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load your favourites."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [token]);

    const handleRemoveFavorite = async (productId) => {
        try {
            setRemovingId(productId);
            setError("");
            setMessage("");

            await api.delete(`/favorites/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFavorites((previousFavorites) =>
                previousFavorites.filter(
                    (product) => product._id !== productId
                )
            );

            setMessage("Product removed from your favourites.");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to remove this product."
            );
        } finally {
            setRemovingId("");
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center my-favorites-page favorites-loading">
                <div
                    className="spinner-border text-success"
                    role="status"
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading your favourites...</p>
            </div>
        );
    }

    return (
        <div className="container py-5 my-favorites-page">
            <div className="text-center mb-5 ">
                <h1 className="text-success">My Favourites</h1>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                    {!token && (
                        <>
                            {" "}
                            <Link to="/login">Log in</Link>
                        </>
                    )}
                </div>
            )}

            {message && (
                <div className="alert alert-success" role="status">
                    {message}
                </div>
            )}

            {!error && favorites.length === 0 ? (
                <div className="text-center py-5 ">
                    <h4>No favourites yet</h4>
                    <p className="text-muted">
                        Browse the marketplace and save products you'd like
                        to revisit.
                    </p>
                    <Link to="/products" className="btn btn-success">
                        Explore Marketplace
                    </Link>
                </div>
            ) : (
                <div className="row g-4">
                    {favorites.map((product) => (
                        <div
                            className="col-md-6 col-lg-4"
                            key={product._id}
                        >
                            <div className="card h-100 shadow-sm">
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
                                            No image available
                                        </span>
                                    </div>
                                )}

                                <div className="card-body d-flex flex-column">
                                    <span className="badge bg-success align-self-start mb-2">
                                        {product.category}
                                    </span>

                                    <h5 className="card-title">
                                        {product.name}
                                    </h5>

                                    <p className="text-muted">
                                        {product.description}
                                    </p>

                                    <h5 className="text-success">
                                        Rs. {product.price} / {product.unit}
                                    </h5>

                                    <p>
                                        <strong>Available:</strong>{" "}
                                        {product.quantity} {product.unit}
                                    </p>

                                    <p className="small text-muted">
                                        Seller:{" "}
                                        {product.seller?.name ||
                                            "Seller information unavailable"}
                                    </p>

                                    {product.quantity === 0 && (
                                        <p className="text-danger">
                                            Out of stock
                                        </p>
                                    )}

                                    <div className="mt-auto">
                                        <Link
                                            to={`/products/${product._id}`}
                                            className="btn btn-success w-100 mb-2"
                                        >
                                            View Product
                                        </Link>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger w-100"
                                            onClick={() =>
                                                handleRemoveFavorite(product._id)
                                            }
                                            disabled={
                                                Boolean(removingId)
                                            }
                                        >
                                            {removingId === product._id
                                                ? "Removing..."
                                                : "♥ Remove from Favourites"}
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

export default MyFavorites;
