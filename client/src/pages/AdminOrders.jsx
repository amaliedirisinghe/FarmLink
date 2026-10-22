import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./AdminOrders.css";

function AdminOrders() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/admin", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrders(response.data.orders || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load orders."
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (user?.role !== "admin") {
            navigate("/products");
            return;
        }

        fetchOrders();
    }, [token, user, navigate, fetchOrders]);

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            statusFilter === "all" ||
            order.status === statusFilter;

        const query = search.trim().toLowerCase();

        const matchesSearch =
            !query ||
            order.product?.name?.toLowerCase().includes(query) ||
            order.buyer?.name?.toLowerCase().includes(query) ||
            order.buyer?.email?.toLowerCase().includes(query) ||
            order.seller?.name?.toLowerCase().includes(query) ||
            order.seller?.email?.toLowerCase().includes(query) ||
            order._id?.toLowerCase().includes(query);

        return matchesStatus && matchesSearch;
    });

    const countStatus = (status) =>
        orders.filter((order) => order.status === status).length;

    const formatCurrency = (amount) =>
        `LKR ${Number(amount || 0).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "ao-status-pending";
            case "confirmed":
                return "ao-status-confirmed";
            case "completed":
                return "ao-status-completed";
            case "cancelled":
                return "ao-status-cancelled";
            default:
                return "ao-status-default";
        }
    };

    return (
        <div className="admin-orders-page">

            {/* Header */}
            <div className="ao-header">
                <div>
                    <h1>
                        Order <span>management.</span>
                    </h1>
                    <p>
                        View and monitor orders across the FarmLink marketplace.
                    </p>
                </div>

                <div className="ao-header-actions">
                    <button
                        type="button"
                        className="ao-btn ao-btn-light"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        <span className={loading ? "ao-refreshing" : ""}>
                            ↻
                        </span>
                        Refresh
                    </button>

                    <Link to="/admin" className="ao-btn ao-btn-dark">
                        ← Dashboard
                    </Link>
                </div>
            </div>

            {error && (
                <div className="ao-alert" role="alert">
                    {error}
                </div>
            )}

            {/* Overview Panel */}
            <section className="ao-overview">
                <div className="ao-overview-main">
                    <div className="ao-overview-icon">↗</div>

                    <div>
                        <p className="ao-overview-label">Total marketplace orders</p>
                        <h2>{orders.length}</h2>
                        <p className="ao-overview-caption">
                            Orders recorded in FarmLink
                        </p>
                    </div>
                </div>

                <div className="ao-overview-stats">
                    <div className="ao-mini-stat">
                        <div>
                            <strong>{countStatus("pending")}</strong>
                            <span>Pending</span>
                        </div>
                    </div>

                    <div className="ao-mini-stat">
                        <div>
                            <strong>{countStatus("confirmed")}</strong>
                            <span>Confirmed</span>
                        </div>
                    </div>

                    <div className="ao-mini-stat">
                        <div>
                            <strong>{countStatus("completed")}</strong>
                            <span>Completed</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Orders Table */}
            <section className="ao-table-card">

                <div className="ao-table-heading">
                    <div>
                        <h2>All orders</h2>
                        <p>Review order details and current status.</p>
                    </div>

                    <div className="ao-search">
                        <span>⌕</span>
                        <input
                            type="search"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search by product, buyer, seller, email or order ID"
                        />
                    </div>
                </div>

                <div className="ao-filter-row">
                    <div className="ao-filter-tabs">
                        {[
                            { value: "all", label: "All orders" },
                            { value: "pending", label: "Pending" },
                            { value: "confirmed", label: "Confirmed" },
                            { value: "completed", label: "Completed" },
                            { value: "cancelled", label: "Cancelled" }
                        ].map((item) => (
                            <button
                                type="button"
                                key={item.value}
                                className={`ao-filter-tab ${
                                    statusFilter === item.value ? "active" : ""
                                }`}
                                onClick={() => setStatusFilter(item.value)}
                            >
                                {item.label}
                                {item.value === "all" && (
                                    <span>{orders.length}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="ao-state">
                        <div className="ao-spinner" />
                        <p>Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="ao-state">
                        <div className="ao-empty-icon">⌕</div>
                        <h3>No orders found</h3>
                        <p>
                            Try changing your search or selecting another status.
                        </p>
                    </div>
                ) : (
                    <div className="ao-table-scroll">
                        <table className="ao-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Product</th>
                                    <th>Buyer</th>
                                    <th>Seller</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>
                                            <span
                                                className="ao-order-id"
                                                title={order._id}
                                            >
                                                {order._id
                                                    ? `#${order._id.slice(-6).toUpperCase()}`
                                                    : "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="ao-primary-text">
                                                {order.product?.name ||
                                                    "Product unavailable"}
                                            </div>
                                            <small>
                                                {order.product?.category || "—"}
                                            </small>
                                        </td>

                                        <td>
                                            <div className="ao-primary-text">
                                                {order.buyer?.name || "—"}
                                            </div>
                                            <small>
                                                {order.buyer?.email || ""}
                                            </small>
                                        </td>

                                        <td>
                                            <div className="ao-primary-text">
                                                {order.seller?.name || "—"}
                                            </div>
                                            <small>
                                                {order.seller?.email || ""}
                                            </small>
                                        </td>

                                        <td className="ao-nowrap">
                                            {order.quantity} {order.unit}
                                        </td>

                                        <td className="ao-amount">
                                            {formatCurrency(order.totalAmount)}
                                        </td>

                                        <td>
                                            <span
                                                className={`ao-status ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                <span className="ao-status-dot" />
                                                {order.status || "Unknown"}
                                            </span>
                                        </td>

                                        <td className="ao-nowrap">
                                            {order.createdAt
                                                ? new Date(
                                                    order.createdAt
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric"
                                                })
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredOrders.length > 0 && (
                    <div className="ao-table-footer">
                        <span>
                            Showing <strong>{filteredOrders.length}</strong> of{" "}
                            <strong>{orders.length}</strong> orders
                        </span>
                        <span>FarmLink · Order management</span>
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminOrders;