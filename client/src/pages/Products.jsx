
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Products = () => {
    const { token } = useAuth();

    const [products, setProducts] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("newest");

    const [loading, setLoading] = useState(true);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [favoriteActionId, setFavoriteActionId] = useState("");
    const [error, setError] = useState("");
    const [favoriteMessage, setFavoriteMessage] = useState("");

    // Fetch marketplace products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (category) {
                params.category = category;
            }

            if (minPrice !== "") {
                params.minPrice = minPrice;
            }

            if (maxPrice !== "") {
                params.maxPrice = maxPrice;
            }

            if (sort) {
                params.sort = sort;
            }

            const response = await api.get("/products", { params });

            setProducts(response.data.products || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch the logged-in user's favourites
    const fetchFavorites = async () => {
        if (!token) {
            setFavoriteIds([]);
            return;
        }

        try {
            setFavoritesLoading(true);

            const response = await api.get("/favorites", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const ids = (response.data.favorites || [])
                .map((product) => product?._id)
                .filter(Boolean);

            setFavoriteIds(ids);
        } catch (error) {
            console.error(
                "Failed to load favourites:",
                error.response?.data?.message || error.message
            );
        } finally {
            setFavoritesLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [category, minPrice, maxPrice, sort]);

    useEffect(() => {
        fetchFavorites();
    }, [token]);

    // Search products
    const handleSearch = (event) => {
        event.preventDefault();
        fetchProducts();
    };

    // Clear filters
    const handleClearFilters = () => {
        setSearch("");
        setCategory("");
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");
    };

    // Add or remove a favourite
    const handleToggleFavorite = async (productId) => {
        if (!token) {
            setFavoriteMessage("Please log in to save favourite products.");
            return;
        }

        if (favoriteActionId) {
            return;
        }

        const isFavorite = favoriteIds.includes(productId);

        try {
            setFavoriteActionId(productId);
            setFavoriteMessage("");

            if (isFavorite) {
                await api.delete(`/favorites/${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setFavoriteIds((previousIds) =>
                    previousIds.filter((id) => id !== productId)
                );

                setFavoriteMessage("Product removed from favourites.");
            } else {
                await api.post(
                    `/favorites/${productId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setFavoriteIds((previousIds) =>
                    previousIds.includes(productId)
                        ? previousIds
                        : [...previousIds, productId]
                );

                setFavoriteMessage("Product added to favourites.");
            }
        } catch (error) {
            setFavoriteMessage(
                error.response?.data?.message ||
                "Unable to update favourites. Please try again."
            );
        } finally {
            setFavoriteActionId("");
        }
    };

    return (
        <div className="container py-5">
            {/* Page Header */}
            <div className="text-center mb-5">
                <h1 className="text-success">
                    Agricultural Marketplace
                </h1>

                <p className="text-muted">
                    Discover fresh produce directly from local sellers.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card shadow-sm mb-5">
                <div className="card-body">
                    <h5 className="mb-4">Find Products</h5>

                    <form onSubmit={handleSearch}>
                        <div className="row g-3">
                            {/* Search */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="search"
                                    className="form-label"
                                >
                                    Search
                                </label>

                                <input
                                    type="text"
                                    id="search"
                                    className="form-control"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>

                            {/* Category */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="category"
                                    className="form-label"
                                >
                                    Category
                                </label>

                                <select
                                    id="category"
                                    className="form-select"
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                >
                                    <option value="">All Categories</option>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Grains">Grains</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Meat">Meat</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Minimum Price */}
                            <div className="col-md-4">
                                <label
                                    htmlFor="minPrice"
                                    className="form-label"
                                >
                                    Minimum Price
                                </label>

                                <input
                                    type="number"
                                    id="minPrice"
                                    className="form-control"
                                    placeholder="e.g. 100"
                                    min="0"
                                    step="0.01"
                                    value={minPrice}
                                    onChange={(event) =>
                                        setMinPrice(event.target.value)
                                    }
                                />
                            </div>

                            {/* Maximum Price */}
                            <div className="col-md-4">
                                <label
                                    htmlFor="maxPrice"
                                    className="form-label"
                                >
                                    Maximum Price
                                </label>

                                <input
                                    type="number"
                                    id="maxPrice"
                                    className="form-control"
                                    placeholder="e.g. 1000"
                                    min="0"
                                    step="0.01"
                                    value={maxPrice}
                                    onChange={(event) =>
                                        setMaxPrice(event.target.value)
                                    }
                                />
                            </div>

                            {/* Sort */}
                            <div className="col-md-4">
                                <label
                                    htmlFor="sort"
                                    className="form-label"
                                >
                                    Sort By
                                </label>

                                <select
                                    id="sort"
                                    className="form-select"
                                    value={sort}
                                    onChange={(event) =>
                                        setSort(event.target.value)
                                    }
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="price_asc">
                                        Price: Low to High
                                    </option>
                                    <option value="price_desc">
                                        Price: High to Low
                                    </option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="col-12 d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                >
                                    Search
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Favourites Message */}
            {favoriteMessage && (
                <div
                    className="alert alert-info alert-dismissible fade show"
                    role="status"
                >
                    {favoriteMessage}

                    {!token && (
                        <>
                            {" "}
                            <Link to="/login">Log in</Link>
                        </>
                    )}

                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setFavoriteMessage("")}
                    />
                </div>
            )}

            {/* Product Error */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Loading */}
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

                    <p className="mt-3">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="alert alert-info text-center">
                    No products match your search or filters.
                </div>
            ) : (
                /* Product Cards */
                <div className="row g-4">
                    {products.map((product) => {
                        const isFavorite = favoriteIds.includes(product._id);
                        const isUpdating = favoriteActionId === product._id;

                        return (
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
                                            style={{ height: "220px" }}
                                        >
                                            <span className="text-muted">
                                                No image available
                                            </span>
                                        </div>
                                    )}

                                    <div className="card-body d-flex flex-column">
                                        {/* Category */}
                                        <span className="badge bg-success align-self-start mb-2">
                                            {product.category}
                                        </span>

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
                                                    {" "}/ {product.unit}
                                                </small>
                                            </h5>

                                            {/* Quantity */}
                                            <p className="mb-3">
                                                <strong>Available:</strong>{" "}
                                                {product.quantity} {product.unit}
                                            </p>

                                            {/* Seller */}
                                            <p className="small text-muted">
                                                Seller:{" "}
                                                {product.seller?.name ||
                                                    "Unknown seller"}
                                            </p>

                                            {/* Favourite Button */}
                                            <button
                                                type="button"
                                                className={`btn ${
                                                    isFavorite
                                                        ? "btn-danger"
                                                        : "btn-outline-danger"
                                                } w-100 mb-2`}
                                                onClick={() =>
                                                    handleToggleFavorite(product._id)
                                                }
                                                disabled={
                                                    favoritesLoading ||
                                                    Boolean(favoriteActionId)
                                                }
                                            >
                                                {isUpdating
                                                    ? "Updating..."
                                                    : isFavorite
                                                        ? "♥ Remove from Favourites"
                                                        : "♡ Save to Favourites"}
                                            </button>

                                            {/* View Product */}
                                            <Link
                                                to={`/products/${product._id}`}
                                                className="btn btn-success w-100"
                                            >
                                                View Product
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Products;
