import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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

        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            order.product?.name?.toLowerCase().includes(searchText) ||
            order.buyer?.name?.toLowerCase().includes(searchText) ||
            order.buyer?.email?.toLowerCase().includes(searchText) ||
            order.seller?.name?.toLowerCase().includes(searchText) ||
            order.seller?.email?.toLowerCase().includes(searchText) ||
            order._id?.toLowerCase().includes(searchText);

        return matchesStatus && matchesSearch;
    });

    const formatCurrency = (amount) =>
        `LKR ${Number(amount || 0).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "text-bg-warning";
            case "confirmed":
                return "text-bg-primary";
            case "completed":
                return "text-bg-success";
            case "cancelled":
                return "text-bg-danger";
            default:
                return "text-bg-secondary";
        }
    };

    return (
        <div className="container-fluid px-3 px-md-5 py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="text-success mb-1">
                        Order Management
                    </h2>
                    <p className="text-muted mb-0">
                        View and monitor all FarmLink marketplace orders.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-success"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        Refresh
                    </button>

                    <Link to="/admin" className="btn btn-success">
                        Dashboard
                    </Link>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Total Orders</p>
                            <h3 className="fw-bold mb-0">{orders.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Pending</p>
                            <h3 className="fw-bold text-warning mb-0">
                                {orders.filter(
                                    (order) => order.status === "pending"
                                ).length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Confirmed</p>
                            <h3 className="fw-bold text-primary mb-0">
                                {orders.filter(
                                    (order) => order.status === "confirmed"
                                ).length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Completed</p>
                            <h3 className="fw-bold text-success mb-0">
                                {orders.filter(
                                    (order) => order.status === "completed"
                                ).length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">All Orders</h5>
                </div>

                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-md-8">
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search by product, buyer, seller, email or order ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="all">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-success"
                                role="status"
                            />
                            <p className="mt-2 mb-0">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-5">
                            <h5>No orders found</h5>
                            <p className="text-muted mb-0">
                                Try changing the search text or status filter.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
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
                                                    className="font-monospace small"
                                                    title={order._id}
                                                >
                                                    {order._id
                                                        ? `#${order._id.slice(-6).toUpperCase()}`
                                                        : "—"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="fw-semibold">
                                                    {order.product?.name ||
                                                        "Product unavailable"}
                                                </div>
                                                <small className="text-muted">
                                                    {order.product?.category || ""}
                                                </small>
                                            </td>

                                            <td>
                                                <div>
                                                    {order.buyer?.name || "—"}
                                                </div>
                                                <small className="text-muted">
                                                    {order.buyer?.email || ""}
                                                </small>
                                            </td>

                                            <td>
                                                <div>
                                                    {order.seller?.name || "—"}
                                                </div>
                                                <small className="text-muted">
                                                    {order.seller?.email || ""}
                                                </small>
                                            </td>

                                            <td>
                                                {order.quantity} {order.unit}
                                            </td>

                                            <td className="fw-semibold">
                                                {formatCurrency(order.totalAmount)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${getStatusClass(order.status)}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>

                                            <td>
                                                {order.createdAt
                                                    ? new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filteredOrders.length > 0 && (
                        <p className="text-muted small mb-0 mt-3">
                            Showing {filteredOrders.length} of {orders.length} orders.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminOrders;
