
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./AdminUsers.css";

function AdminUsers() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [search, setSearch] = useState("");

  const fetchPendingUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/pending-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pendingUsers = Array.isArray(response.data)
        ? response.data
        : response.data.users;

      setUsers(Array.isArray(pendingUsers) ? pendingUsers : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load pending users. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (user?.role !== "admin") {
      navigate("/products", { replace: true });
      return;
    }

    fetchPendingUsers();
  }, [token, user?.role, navigate, fetchPendingUsers]);

  const handleUserAction = async (userId, action) => {
    const actionLabel = action === "approve" ? "approve" : "reject";

    const selectedUser = users.find((item) => item._id === userId);

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${
        selectedUser?.name || "this user"
      }?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(userId);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/users/${userId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          `User ${actionLabel}d successfully.`
      );

      await fetchPendingUsers(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${actionLabel} user.`
      );
    } finally {
      setProcessingId("");
    }
  };

  const filteredUsers = users.filter((pendingUser) => {
    const query = search.trim().toLowerCase();

    return (
      pendingUser.name?.toLowerCase().includes(query) ||
      pendingUser.email?.toLowerCase().includes(query)
    );
  });

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-LK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!token || user?.role !== "admin") {
    return (
      <div className="admin-users-loading">
        <span className="users-spinner" />
        <p>Preparing user management...</p>
      </div>
    );
  }

  return (
    <main className="admin-users-page">
      <div className="admin-users-container">
        <header className="users-page-header">
          <div className="users-heading">

            <h1>
              User <span>management.</span>
            </h1>

            <p>
              Review registration requests and manage the community.
            </p>
          </div>

          <div className="users-header-actions">
            <button
              type="button"
              className="users-refresh-button"
              onClick={() => fetchPendingUsers(true)}
              disabled={loading || refreshing}
            >
              <span className={refreshing ? "users-rotate" : ""}>↻</span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link to="/admin" className="users-dashboard-button">
              <span aria-hidden="true">←</span>
              Dashboard
            </Link>
          </div>
        </header>

        {error && (
          <div className="users-notice users-notice-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchPendingUsers(true)}
            >
              Try again
            </button>
          </div>
        )}

        {message && (
          <div className="users-notice users-notice-success" role="status">
            <span className="notice-check">✓</span>
            <span>{message}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}

        <section className="users-summary">
          <div className="users-summary-main">
            <div className="users-summary-icon"></div>

            <div>
              <p>Awaiting approval</p>
              <h2>{loading ? "—" : users.length}</h2>
              <span>Registration requests</span>
            </div>
          </div>

          <div className="users-summary-note">
            <span className="summary-status-dot" />
            <span>Review pending accounts below</span>
          </div>
        </section>

        <section className="users-list-panel">
          <div className="users-list-header">
            <div>
              <h2>Pending registrations</h2>
              <p>Review each request before activating an account.</p>
            </div>

            <label className="users-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search pending users"
              />
            </label>
          </div>

          {loading ? (
            <div className="users-loading-state">
              <span className="users-spinner" />
              <p>Loading registration requests...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty-state">
              <div className="users-empty-icon">
                {search ? "⌕" : "✓"}
              </div>

              <h3>
                {search ? "No matching users" : "All caught up!"}
              </h3>

              <p>
                {search
                  ? "Try another name or email address."
                  : "There are no pending registration requests right now."}
              </p>

              {search && (
                <button
                  type="button"
                  className="users-clear-search"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="users-table-wrap">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>REGISTERED</th>
                      <th>STATUS</th>
                      <th className="users-actions-heading">ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((pendingUser, index) => (
                      <tr
                        key={pendingUser._id}
                        style={{ "--user-index": index }}
                      >
                        <td>
                          <div className="user-identity">
                            <div className="user-avatar">
                              {pendingUser.name
                                ?.trim()
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </div>

                            <div className="user-identity-text">
                              <strong>{pendingUser.name || "Unnamed user"}</strong>
                              <span>{pendingUser.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="users-date">
                          {formatDate(pendingUser.createdAt)}
                        </td>

                        <td>
                          <span className="users-pending-badge">
                            <span />
                            Pending
                          </span>
                        </td>

                        <td>
                          <div className="users-actions">
                            <button
                              type="button"
                              className="users-approve-button"
                              disabled={Boolean(processingId)}
                              onClick={() =>
                                handleUserAction(
                                  pendingUser._id,
                                  "approve"
                                )
                              }
                            >
                              {processingId === pendingUser._id
                                ? "Processing..."
                                : "✓ Approve"}
                            </button>

                            <button
                              type="button"
                              className="users-reject-button"
                              disabled={Boolean(processingId)}
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

              <div className="users-mobile-list">
                {filteredUsers.map((pendingUser, index) => (
                  <article
                    className="users-mobile-card"
                    key={pendingUser._id}
                    style={{ "--user-index": index }}
                  >
                    <div className="mobile-user-top">
                      <div className="user-identity">
                        <div className="user-avatar">
                          {pendingUser.name
                            ?.trim()
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="user-identity-text">
                          <strong>{pendingUser.name || "Unnamed user"}</strong>
                          <span>{pendingUser.email}</span>
                        </div>
                      </div>

                      <span className="users-pending-badge">
                        <span />
                        Pending
                      </span>
                    </div>

                    <div className="mobile-user-date">
                      Registered {formatDate(pendingUser.createdAt)}
                    </div>

                    <div className="users-actions">
                      <button
                        type="button"
                        className="users-approve-button"
                        disabled={Boolean(processingId)}
                        onClick={() =>
                          handleUserAction(pendingUser._id, "approve")
                        }
                      >
                        {processingId === pendingUser._id
                          ? "Processing..."
                          : "✓ Approve"}
                      </button>

                      <button
                        type="button"
                        className="users-reject-button"
                        disabled={Boolean(processingId)}
                        onClick={() =>
                          handleUserAction(pendingUser._id, "reject")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="users-list-footer">
                <span>
                  Showing <strong>{filteredUsers.length}</strong> of{" "}
                  <strong>{users.length}</strong> pending users
                </span>

                <span className="users-footer-label">
                  FarmLink · User review
                </span>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminUsers;
