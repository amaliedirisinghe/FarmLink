
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./ManageProduct.css";

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
    unit: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products/my-products", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const products = response.data.products || [];
        const selectedProduct = products.find(
          (item) => item._id === productId
        );

        if (!selectedProduct) {
          setError("Product not found.");
          return;
        }

        setProduct(selectedProduct);
        setFormData({
          name: selectedProduct.name || "",
          category: selectedProduct.category || "",
          description: selectedProduct.description || "",
          price: selectedProduct.price ?? "",
          quantity: selectedProduct.quantity ?? "",
          unit: selectedProduct.unit || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [token, productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setImage(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      setImage(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      setImage(null);
      return;
    }

    setError("");
    setSuccess("");
    setImage(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (image) {
        data.append("image", image);
      }

      const response = await api.patch(
        `/products/${productId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.product) {
        setProduct(response.data.product);
      } else {
        // Refresh the listing if the API returns only a message.
        const refreshed = await api.get("/products/my-products", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedProduct = (refreshed.data.products || []).find(
          (item) => item._id === productId
        );

        if (updatedProduct) setProduct(updatedProduct);
      }

      setSuccess(
        response.data.message || "Product updated successfully."
      );
      setImage(null);

      const fileInput = document.getElementById("productImage");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product?.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setDeleting(true);

      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/my-products");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <main className="manage-product-page">
        <div className="manage-product-loading">
          <span className="manage-product-spinner" />
          <h2>Loading your product</h2>
          <p>Please wait while we retrieve your listing.</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="manage-product-page">
        <div className="manage-product-error-page">
          <div className="manage-product-empty-icon">!</div>
          <h2>Unable to open product</h2>
          <p>{error || "This product could not be found."}</p>
          <button
            type="button"
            className="mp-button mp-button-primary"
            onClick={() => navigate("/my-products")}
          >
            Back to My Products
          </button>
        </div>
      </main>
    );
  }

  const statusClass = ["approved", "pending", "rejected"].includes(
    product.status
  )
    ? product.status
    : "unknown";

  return (
    <main className="manage-product-page">
      <div className="manage-product-container">
        <header className="mp-header">
          <div className="mp-header-copy">

            <h1>
              Manage <span>product.</span>
            </h1>

            <p>Edit your listing details and keep your produce up to date.</p>
          </div>

          <button
            type="button"
            className="mp-button mp-button-secondary"
            onClick={() => navigate("/my-products")}
          >
            <span aria-hidden="true">←</span>
            My Products
          </button>
        </header>

        {error && (
          <div className="mp-alert mp-alert-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mp-alert mp-alert-success" role="status">
            <span className="mp-alert-check">✓</span>
            <span>{success}</span>
            <button
              type="button"
              aria-label="Dismiss success message"
              onClick={() => setSuccess("")}
            >
              ×
            </button>
          </div>
        )}

        <section className="mp-status-panel">
          <div className="mp-status-product">
            <div className="mp-status-icon">♧</div>
            <div>
              <span className="mp-overline">CURRENT LISTING</span>
              <h2>{product.name}</h2>
              <p>Product ID: {product._id}</p>
            </div>
          </div>

          <div className={`mp-status-badge ${statusClass}`}>
            <span />
            {formatStatus(product.status)}
          </div>
        </section>

        <div className="mp-content-grid">
          <aside className="mp-sidebar">
            <section className="mp-panel mp-image-panel">
              <div className="mp-panel-heading">
                <div>
                  <span className="mp-overline">PRODUCT PHOTO</span>
                  <h2>Listing image</h2>
                </div>
              </div>

              <div className="mp-image-frame">
                {product.images?.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="mp-current-image"
                  />
                ) : (
                  <div className="mp-image-placeholder">
                    <p>No product image</p>
                  </div>
                )}
              </div>

              <label htmlFor="productImage" className="mp-field-label">
                Replace image
              </label>

              <input
                type="file"
                id="productImage"
                className="mp-file-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              <p className="mp-field-help">
                JPG, PNG or WEBP. Maximum size: 5MB.
              </p>

              {image && (
                <div className="mp-selected-file">
                  <span>✓</span>
                  <span>{image.name}</span>
                  <button
                    type="button"
                    aria-label="Remove selected image"
                    onClick={() => {
                      setImage(null);
                      const input = document.getElementById("productImage");
                      if (input) input.value = "";
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="mp-image-note">
                <span>i</span>
                <p>
                  Replacing the image sends the listing for admin approval
                  again.
                </p>
              </div>
            </section>
          </aside>

          <section className="mp-panel mp-form-panel">
            <div className="mp-panel-heading">
              <div>
                <h2>Edit product details</h2>
                <p>Update the fields you want to change.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mp-form-field">
                <label htmlFor="name" className="mp-field-label">
                  Product name <span>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="mp-input"
                  placeholder="e.g. Fresh tomatoes"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mp-form-field">
                <label htmlFor="category" className="mp-field-label">
                  Category <span>*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  className="mp-input mp-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mp-form-field">
                <label htmlFor="description" className="mp-field-label">
                  Description <span>*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="mp-input mp-textarea"
                  placeholder="Describe your produce, quality, and other useful details..."
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
                <p className="mp-field-help">
                  Include details that help buyers understand your product.
                </p>
              </div>

              <div className="mp-form-row">
                <div className="mp-form-field">
                  <label htmlFor="price" className="mp-field-label">
                    Price (LKR) <span>*</span>
                  </label>
                  <div className="mp-input-with-prefix">
                    <span>Rs.</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      className="mp-input"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mp-form-field">
                  <label htmlFor="quantity" className="mp-field-label">
                    Available quantity <span>*</span>
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    className="mp-input"
                    min="0"
                    step="any"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mp-form-field">
                <label htmlFor="unit" className="mp-field-label">
                  Selling unit <span>*</span>
                </label>
                <select
                  id="unit"
                  name="unit"
                  className="mp-input mp-select"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="litre">Litre</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="piece">Piece</option>
                </select>
              </div>

              <div className="mp-form-footer">
                <p>
                </p>

                <div className="mp-form-actions">
                  <button
                    type="button"
                    className="mp-button mp-button-secondary"
                    onClick={() => navigate("/my-products")}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        Delete
                    </button>
                  <button
                    type="submit"
                    className="mp-button mp-button-primary"
                    disabled={saving || deleting}
                  >
                    {saving ? (
                      <>
                        <span className="mp-button-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save changes
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

      </div>
    </main>
  );
};

export default ManageProduct;
