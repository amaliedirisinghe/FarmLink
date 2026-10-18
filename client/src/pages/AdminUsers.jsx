import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminUsers() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState("");

    const fetchPendingUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/pending-users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Supports either a direct array or an object containing users.
            const pendingUsers = Array.isArray(response.data)
                ? response.data
                : response.data.users;

            setUsers(Array.isArray(pendingUsers) ? pendingUsers : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load pending users."
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

        fetchPendingUsers();
    }, [token, user, navigate, fetchPendingUsers]);

    const handleUserAction = async (userId, action) => {
        const actionLabel = action === "approve" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${actionLabel} this user?`)) {
            return;
        }

        try {
            setProcessingId(userId);
            setError("");
            setMessage("");

            const endpoint = `/admin/users/${userId}/${action}`;

            const response = await api.patch(endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage(
                response.data.message ||
                `User ${actionLabel}d successfully.`
            );

            await fetchPendingUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Failed to ${actionLabel} user.`
            );
        } finally {
            setProcessingId("");
        }
    };

    return (
        <div className="container py-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="text-success mb-1">User Management</h2>
                    <p className="text-muted mb-0">
                        Review and manage accounts awaiting approval.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-success"
                        onClick={fetchPendingUsers}
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

            {message && (
                <div className="alert alert-success" role="alert">
                    {message}
                </div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">
                        Pending Users{" "}
                        <span className="badge text-bg-warning">
                            {users.length}
                        </span>
                    </h5>
                </div>

                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div
                                className="spinner-border text-success"
                                role="status"
                            />
                            <p className="mt-2 mb-0">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-5">
                            <h5>No pending users</h5>
                            <p className="text-muted mb-0">
                                All user registration requests have been reviewed.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Registered</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((pendingUser) => (
                                        <tr key={pendingUser._id}>
                                            <td className="fw-semibold">
                                                {pendingUser.name}
                                            </td>

                                            <td>{pendingUser.email}</td>

                                            <td>
                                                {pendingUser.createdAt
                                                    ? new Date(
                                                        pendingUser.createdAt
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        disabled={processingId === pendingUser._id}
                                                        onClick={() =>
                                                            handleUserAction(
                                                                pendingUser._id,
                                                                "approve"
                                                            )
                                                        }
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        disabled={processingId === pendingUser._id}
                                                        onClick={() =>
                                                            handleUserAction(
                                                                pendingUser._id,
                                                                "reject"
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminUsers;