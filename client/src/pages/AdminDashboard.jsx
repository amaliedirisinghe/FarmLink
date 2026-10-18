
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminDashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (user?.role !== "admin") {
            navigate("/products");
            return;
        }

        const fetchStats = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/dashboard/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setStats(response.data.stats);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token, user, navigate]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 2
        }).format(amount);

    const StatCard = ({ title, value, description }) => (
        <div className="col-md-6 col-xl-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                    <p className="text-muted mb-2">{title}</p>
                    <h3 className="fw-bold mb-2">{value}</h3>
                    <small className="text-muted">{description}</small>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border text-success"
                    role="status"
                />
                <p className="mt-3">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>
                <button
                    className="btn btn-success"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="container-fluid px-3 px-md-5 py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="text-success mb-1">
                        Admin Dashboard
                    </h2>
                    <p className="text-muted mb-0">
                        Welcome back, {user?.name || "Admin"}.
                        Here's your FarmLink overview.
                    </p>
                </div>

                <button
                    className="btn btn-outline-success mt-3 mt-md-0"
                    onClick={() => window.location.reload()}
                >
                    Refresh Statistics
                </button>
            </div>

            <h5 className="fw-bold mb-3">Users</h5>

            <div className="row">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    description="All registered accounts"
                />
                <StatCard
                    title="Active Users"
                    value={stats.users.active}
                    description="Approved accounts"
                />
                <StatCard
                    title="Pending Users"
                    value={stats.users.pending}
                    description="Awaiting admin approval"
                />
            </div>

            <h5 className="fw-bold mb-3">Products</h5>

            <div className="row">
                <StatCard
                    title="Total Products"
                    value={stats.products.total}
                    description="All product listings"
                />
                <StatCard
                    title="Approved Products"
                    value={stats.products.approved}
                    description="Available approved listings"
                />
                <StatCard
                    title="Pending Products"
                    value={stats.products.pending}
                    description="Awaiting review"
                />
            </div>

            <h5 className="fw-bold mb-3">Orders</h5>

            <div className="row">
                <StatCard
                    title="Total Orders"
                    value={stats.orders.total}
                    description="All marketplace orders"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.orders.pending}
                    description="Awaiting further action"
                />
                <StatCard
                    title="Completed Orders"
                    value={stats.orders.completed}
                    description="Successfully completed orders"
                />
                <StatCard
                    title="Completed Order Value"
                    value={formatCurrency(
                        stats.orders.completedOrderValue
                    )}
                    description="Combined value of completed orders"
                />
            </div>
        </div>
    );
}

export default AdminDashboard; 
