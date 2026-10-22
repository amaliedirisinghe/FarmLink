import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AddProduct.css" ;

const AddProduct = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        quantity: "",
        unit: ""
    });

    const [image, setImage] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================
    // Handle Text Inputs
    // =====================================

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    // =====================================
    // Handle Image
    // =====================================

    const handleImageChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setImage(null);
            return;
        }

        // Validate file type
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

        // Validate file size - 5MB
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError(
                "Image size must be less than 5MB."
            );

            event.target.value = "";
            setImage(null);

            return;
        }

        setError("");
        setImage(selectedFile);
    };

    // =====================================
    // Submit
    // =====================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const data = new FormData();

            data.append("name", formData.name);
            data.append("category", formData.category);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("quantity", formData.quantity);
            data.append("unit", formData.unit);

            if (image) {
                data.append("image", image);
            }

            await api.post(
                "/products",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(
                "Product created successfully. It is now waiting for admin approval."
            );

            setFormData({
                name: "",
                category: "",
                description: "",
                price: "",
                quantity: "",
                unit: ""
            });

            setImage(null);

            // Reset file input
            const fileInput =
                document.getElementById("image");

            if (fileInput) {
                fileInput.value = "";
            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to create product."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 add-product-page">

            <div className="row justify-content-center">

                <div className="col-lg-8">

                    {/* Header */}

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>
                            <h1 className="text-success">
                                Add Product
                            </h1>

                            <p className="text-muted mb-0">
                                Create a new product listing for FarmLink.
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

                    {/* Form */}

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
                                        placeholder="e.g. Fresh Organic Carrots"
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
                                        placeholder="Describe your product..."
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
                                            placeholder="600"
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
                                            placeholder="20"
                                            min="0"
                                            step="any"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                </div>

                                {/* Unit */}

                                <div className="mb-3">

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

                                {/* Product Image */}

                                <div className="mb-4">

                                    <label
                                        htmlFor="image"
                                        className="form-label fw-bold"
                                    >
                                        Product Image
                                    </label>

                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        className="form-control"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                    />

                                    <div className="form-text">
                                        JPG, PNG or WEBP. Maximum size: 5MB.
                                    </div>

                                    {image && (
                                        <div className="mt-2">
                                            <small className="text-success">
                                                Selected: {image.name}
                                            </small>
                                        </div>
                                    )}

                                </div>

                                {/* Buttons */}

                                <div className="d-flex gap-2">

                                    <button
                                        type="submit"
                                        className="btn btn-success flex-grow-1"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Uploading..."
                                            : "Create Product"}
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

                </div>

            </div>

        </div>
    );
};

export default AddProduct;