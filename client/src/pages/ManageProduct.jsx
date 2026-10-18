import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ManageProduct = () => {
    const { productId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        quantity: "",
        unit: ""
    });

    const [image, setImage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================
    // Load seller's product
    // =====================================

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/products/my-products",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const products = response.data.products;

                const selectedProduct = products.find(
                    (item) => item._id === productId
                );

                if (!selectedProduct) {
                    setError("Product not found.");
                    return;
                }

                setProduct(selectedProduct);

                setFormData({
                    name: selectedProduct.name,
                    category: selectedProduct.category,
                    description: selectedProduct.description,
                    price: selectedProduct.price,
                    quantity: selectedProduct.quantity,
                    unit: selectedProduct.unit
                });

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load product."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProduct();
        }
    }, [token, productId]);


    // =====================================
    // Handle text input changes
    // =====================================

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };


    // =====================================
    // Handle image selection
    // =====================================

    const handleImageChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setImage(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError(
                "Only JPG, PNG and WEBP images are allowed."
            );

            event.target.value = "";
            setImage(null);

            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError(
                "Image size must be less than 5MB."
            );

            event.target.value = "";
            setImage(null);

            return;
        }

        setError("");
        setSuccess("");
        setImage(selectedFile);
    };


    // =====================================
    // Update product
    // =====================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const data = new FormData();

            data.append("name", formData.name);
            data.append("category", formData.category);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("quantity", formData.quantity);
            data.append("unit", formData.unit);

            // Only add image if user selected a new one
            if (image) {
                data.append("image", image);
            }

            const response = await api.patch(
                `/products/${productId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProduct(response.data.product);

            setSuccess(response.data.message);

            // Clear selected image after successful save
            setImage(null);

            const fileInput =
                document.getElementById("productImage");

            if (fileInput) {
                fileInput.value = "";
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to update product."
            );
        } finally {
            setSaving(false);
        }
    };


    // =====================================
    // Delete product
    // =====================================

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product?.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setDeleting(true);

            await api.delete(
                `/products/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            navigate("/my-products");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete product."
            );
        } finally {
            setDeleting(false);
        }
    };


    // =====================================
    // Loading
    // =====================================

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


    // =====================================
    // Error / Product not found
    // =====================================

    if (error && !product) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error}
                </div>

                <button
                    type="button"
                    className="btn btn-success"
                    onClick={() =>
                        navigate("/my-products")
                    }
                >
                    Back to My Products
                </button>
            </div>
        );
    }


    if (!product) {
        return null;
    }


    // =====================================
    // Page
    // =====================================

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">

                    {/* Header */}

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="text-success">
                                Manage Product
                            </h1>

                            <p className="text-muted mb-0">
                                Update or remove your product listing.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() =>
                                navigate("/my-products")
                            }
                        >
                            My Products
                        </button>
                    </div>


                    {/* Error */}

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}


                    {/* Success */}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}


                    {/* Current Status */}

                    <div className="card shadow-sm mb-4">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center">

                                <div>
                                    <h5 className="mb-1">
                                        Current Status
                                    </h5>

                                    <p className="text-muted mb-0">
                                        {product.name}
                                    </p>
                                </div>

                                <span
                                    className={`badge ${
                                        product.status === "approved"
                                            ? "bg-success"
                                            : product.status === "pending"
                                            ? "bg-warning text-dark"
                                            : "bg-danger"
                                    }`}
                                >
                                    {product.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        product.status.slice(1)}
                                </span>

                            </div>

                        </div>
                    </div>


                    {/* Current Image */}

                    <div className="card shadow-sm mb-4">
                        <div className="card-body">

                            <h5 className="mb-3">
                                Product Image
                            </h5>

                            {product.images?.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="img-fluid rounded"
                                    style={{
                                        width: "100%",
                                        maxHeight: "350px",
                                        objectFit: "cover"
                                    }}
                                />
                            ) : (
                                <div
                                    className="bg-light rounded d-flex align-items-center justify-content-center"
                                    style={{
                                        height: "250px"
                                    }}
                                >
                                    <span className="text-muted">
                                        No image available
                                    </span>
                                </div>
                            )}

                            <div className="mt-3">

                                <label
                                    htmlFor="productImage"
                                    className="form-label fw-bold"
                                >
                                    Replace Image
                                </label>

                                <input
                                    type="file"
                                    id="productImage"
                                    className="form-control"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                />

                                <div className="form-text">
                                    JPG, PNG or WEBP. Maximum size: 5MB.
                                    Replacing the image requires admin approval.
                                </div>

                                {image && (
                                    <div className="mt-2">
                                        <small className="text-success">
                                            New image selected: {image.name}
                                        </small>
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>


                    {/* Edit Form */}

                    <div className="card shadow-sm">
                        <div className="card-body p-4">

                            <form onSubmit={handleSubmit}>

                                {/* Product Name */}

                                <div className="mb-3">

                                    <label
                                        htmlFor="name"
                                        className="form-label fw-bold"
                                    >
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                {/* Category */}

                                <div className="mb-3">

                                    <label
                                        htmlFor="category"
                                        className="form-label fw-bold"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="category"
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        <option value="Vegetables">
                                            Vegetables
                                        </option>

                                        <option value="Fruits">
                                            Fruits
                                        </option>

                                        <option value="Grains">
                                            Grains
                                        </option>

                                        <option value="Dairy">
                                            Dairy
                                        </option>

                                        <option value="Meat">
                                            Meat
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* Description */}

                                <div className="mb-3">

                                    <label
                                        htmlFor="description"
                                        className="form-label fw-bold"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-control"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>

                                </div>


                                {/* Price + Quantity */}

                                <div className="row">

                                    <div className="col-md-6 mb-3">

                                        <label
                                            htmlFor="price"
                                            className="form-label fw-bold"
                                        >
                                            Price
                                        </label>

                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            className="form-control"
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>


                                    <div className="col-md-6 mb-3">

                                        <label
                                            htmlFor="quantity"
                                            className="form-label fw-bold"
                                        >
                                            Quantity
                                        </label>

                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            className="form-control"
                                            min="0"
                                            step="any"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                </div>


                                {/* Unit */}

                                <div className="mb-4">

                                    <label
                                        htmlFor="unit"
                                        className="form-label fw-bold"
                                    >
                                        Unit
                                    </label>

                                    <select
                                        id="unit"
                                        name="unit"
                                        className="form-select"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select unit
                                        </option>

                                        <option value="kg">
                                            kg
                                        </option>

                                        <option value="g">
                                            g
                                        </option>

                                        <option value="litre">
                                            litre
                                        </option>

                                        <option value="ml">
                                            ml
                                        </option>

                                        <option value="piece">
                                            piece
                                        </option>

                                    </select>

                                </div>


                                {/* Information */}

                                <div className="alert alert-info">

                                    <strong>
                                        Important:
                                    </strong>

                                    <ul className="mb-0 mt-2">

                                        <li>
                                            Changing only the price or
                                            quantity does not require
                                            admin approval.
                                        </li>

                                        <li>
                                            Changing the name, category,
                                            description, unit, or image
                                            will send the product for
                                            admin approval again.
                                        </li>

                                    </ul>

                                </div>


                                {/* Buttons */}

                                <div className="d-flex gap-2">

                                    <button
                                        type="submit"
                                        className="btn btn-success flex-grow-1"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving Changes..."
                                            : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            navigate("/my-products")
                                        }
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>


                    {/* Delete */}

                    <div className="card border-danger mt-4">

                        <div className="card-body">

                            <h5 className="text-danger">
                                Delete Product
                            </h5>

                            <p className="text-muted">
                                This permanently removes this product
                                listing from FarmLink.
                            </p>

                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Product"}
                            </button>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ManageProduct;