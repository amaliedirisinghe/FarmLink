import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Products.css";

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

    // Load marketplace products using the existing API.
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) params.search = search.trim();
            if (category) params.category = category;
            if (minPrice !== "") params.minPrice = minPrice;
            if (maxPrice !== "") params.maxPrice = maxPrice;
            if (sort) params.sort = sort;

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

    // Load favourites for the logged-in user.
    const fetchFavorites = async () => {
        if (!token) {
            setFavoriteIds([]);
            return;
        }

        try {
            setFavoritesLoading(true);

            const response = await api.get("/favorites", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

    // Search products.
    const handleSearch = (event) => {
        event.preventDefault();
        fetchProducts();
    };

    // Reset all filters.
    const handleClearFilters = () => {
        setSearch("");
        setCategory("");
        setMinPrice("");
        setMaxPrice("");
        setSort("newest");
    };

    // Add or remove a favourite through the existing API.
    const handleToggleFavorite = async (productId) => {
        if (!token) {
            setFavoriteMessage(
                "Please log in to save favourite products."
            );
            return;
        }

        if (favoriteActionId) return;

        const isFavorite = favoriteIds.includes(productId);

        try {
            setFavoriteActionId(productId);
            setFavoriteMessage("");

            if (isFavorite) {
                await api.delete(`/favorites/${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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
                            Authorization: `Bearer ${token}`,
                        },
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
        <main className="products-page">
            <div className="products-container">
                {/* Marketplace heading */}
                <header className="products-header">
                    <span className="products-eyebrow">
                        FRESH FROM LOCAL FARMS
                    </span>

                    <h1>
                        Discover your next <br />
                        <span>fresh pick.</span>
                    </h1>

                    <p>
                        Explore fresh agricultural produce and connect
                        directly with local sellers.
                    </p>
                </header>

                {/* Search and filters */}
                <section
                    className="products-filter-panel"
                    aria-labelledby="products-filter-title"
                >
                    <h2
                        className="products-filter-heading"
                        id="products-filter-title"
                    >
                        Find your fresh produce
                    </h2>

                    <form onSubmit={handleSearch}>
                        <div className="products-filter-grid">
                            <div className="products-field products-search-field">
                                <label htmlFor="search">Search products</label>
                                <input
                                    id="search"
                                    className="form-control"
                                    type="text"
                                    placeholder="Try tomatoes, rice, fresh fruit..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>

                            <div className="products-field">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    className="form-select"
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(event.target.value)
                                    }
                                >
                                    <option value="">All categories</option>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Grains">Grains</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Meat">Meat</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="products-field">
                                <label htmlFor="minPrice">Minimum price (Rs.)</label>
                                <input
                                    id="minPrice"
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 100"
                                    value={minPrice}
                                    onChange={(event) =>
                                        setMinPrice(event.target.value)
                                    }
                                />
                            </div>

                            <div className="products-field">
                                <label htmlFor="maxPrice">Maximum price (Rs.)</label>
                                <input
                                    id="maxPrice"
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 1000"
                                    value={maxPrice}
                                    onChange={(event) =>
                                        setMaxPrice(event.target.value)
                                    }
                                />
                            </div>

                            <div className="products-field">
                                <label htmlFor="sort">Sort products</label>
                                <select
                                    id="sort"
                                    className="form-select"
                                    value={sort}
                                    onChange={(event) =>
                                        setSort(event.target.value)
                                    }
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                    <option value="price_asc">
                                        Price: low to high
                                    </option>
                                    <option value="price_desc">
                                        Price: high to low
                                    </option>
                                </select>
                            </div>

                            <div className="products-filter-actions">
                                <button
                                    type="submit"
                                    className="products-btn products-btn-primary"
                                >
                                    Search products <span aria-hidden="true">→</span>
                                </button>

                                <button
                                    type="button"
                                    className="products-btn products-btn-secondary"
                                    onClick={handleClearFilters}
                                >
                                    Clear filters
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* Favourite feedback */}
                {favoriteMessage && (
                    <div className="products-feedback products-feedback-info" role="status">
                        <span>{favoriteMessage}</span>

                        {!token && (
                            <Link to="/login">Log in</Link>
                        )}

                        <button
                            type="button"
                            className="products-feedback-close"
                            aria-label="Dismiss message"
                            onClick={() => setFavoriteMessage("")}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* API error */}
                {error && (
                    <div
                        className="products-feedback products-feedback-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* Results heading */}
                {!loading && !error && products.length > 0 && (
                    <div className="products-results-heading">
                        <div>
                            <span className="products-eyebrow">
                                THE FARMERS' SELECTION
                            </span>
                            <h2>Available produce</h2>
                        </div>

                        <p>
                            {products.length} {products.length === 1 ? "product" : "products"} found
                        </p>
                    </div>
                )}

                {/* Loading state */}
                {loading ? (
                    <div className="products-status" role="status">
                        <div className="products-spinner" />
                        <h2>Finding fresh produce...</h2>
                        <p>Please wait while we load the marketplace.</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="products-status products-empty-state">
                        <span className="products-empty-icon" aria-hidden="true">
                            🌱
                        </span>
                        <h2>No products found</h2>
                        <p>
                            Try another search or clear your filters to explore
                            available produce.
                        </p>
                        <button
                            type="button"
                            className="products-btn products-btn-primary"
                            onClick={handleClearFilters}
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <section
                        className="products-grid"
                        aria-label="Marketplace products"
                    >
                        {products.map((product) => {
                            const isFavorite = favoriteIds.includes(product._id);
                            const isUpdating =
                                favoriteActionId === product._id;

                            return (
                                <article
                                    className="products-card"
                                    key={product._id}
                                >
                                    {/* Compact product card */}
                                    <Link
                                        to={`/products/${product._id}`}
                                        className="products-image-link"
                                        aria-label={`View ${product.name}`}
                                    >
                                        <div className="products-card-image">
                                            {product.images?.length > 0 ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="products-image-placeholder">
                                                    <span aria-hidden="true">🌿</span>
                                                    <span>No photo yet</span>
                                                </div>
                                            )}
                                            <span className="products-image-badge">
                                                {product.category}
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="products-card-body">
                                        <div className="products-card-topline">
                                            <span className="products-category">
                                                {product.category}
                                            </span>
                                            <span className="products-stock-label">
                                                <span className="products-stock-dot" aria-hidden="true" />
                                                In stock
                                            </span>
                                        </div>

                                        <h3 className="products-card-title">
                                            <Link to={`/products/${product._id}`}>
                                                {product.name}
                                            </Link>
                                        </h3>

                                        <p className="products-description">
                                            {product.description}
                                        </p>

                                        <div className="products-price-row">
                                            <p className="products-price">
                                                Rs. {Number(product.price).toLocaleString()}
                                                <small> / {product.unit}</small>
                                            </p>
                                        </div>

                                        <p className="products-quantity">
                                            <span aria-hidden="true">▦ </span>
                                            <strong>{Number(product.quantity).toLocaleString()}</strong>{" "}
                                            {product.unit} available
                                        </p>

                                        <div className="products-card-footer">
                                            <p className="products-seller">
                                                <span className="products-seller-icon" aria-hidden="true">♧</span>
                                                <span>
                                                    <small>Sold by</small>
                                                    <strong>
                                                        {product.seller?.name || "Local farmer"}
                                                    </strong>
                                                </span>
                                            </p>

                                            <div className="products-card-actions">
                                                <button
                                                    type="button"
                                                    className={`products-favorite-btn ${
                                                        isFavorite ? "is-favorite" : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleToggleFavorite(product._id)
                                                    }
                                                    disabled={
                                                        favoritesLoading ||
                                                        Boolean(favoriteActionId)
                                                    }
                                                    aria-label={
                                                        isFavorite
                                                            ? `Remove ${product.name} from favourites`
                                                            : `Add ${product.name} to favourites`
                                                    }
                                                    title={
                                                        isFavorite
                                                            ? "Remove from favourites"
                                                            : "Add to favourites"
                                                    }
                                                >
                                                    {isUpdating ? "…" : isFavorite ? "♥" : "♡"}
                                                </button>

                                                <Link
                                                    to={`/products/${product._id}`}
                                                    className="products-view-btn"
                                                >
                                                    View product <span aria-hidden="true">→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>
        </main>
    );
};

export default Products;