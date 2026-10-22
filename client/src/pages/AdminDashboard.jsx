
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./AdminDashboard.css";

const statSections = [
  {
    title: "Users",
    subtitle: "Manage your growing community",
    icon: "♙",
    color: "sage",
    items: [
      {
        key: "total",
        title: "Total Users",
        description: "All registered accounts",
      },
      {
        key: "active",
        title: "Active Users",
        description: "Approved accounts",
      },
      {
        key: "pending",
        title: "Pending Users",
        description: "Awaiting admin approval",
        highlight: true,
      },
    ],
  },
  {
    title: "Products",
    subtitle: "Monitor marketplace listings",
    icon: "◇",
    color: "olive",
    items: [
      {
        key: "total",
        title: "Total Products",
        description: "All product listings",
      },
      {
        key: "approved",
        title: "Approved Products",
        description: "Approved listings",
      },
      {
        key: "pending",
        title: "Pending Products",
        description: "Awaiting review",
        highlight: true,
      },
    ],
  },
  {
    title: "Orders",
    subtitle: "Track marketplace activity",
    icon: "▤",
    color: "gold",
    items: [
      {
        key: "total",
        title: "Total Orders",
        description: "All marketplace orders",
      },
      {
        key: "pending",
        title: "Pending Orders",
        description: "Awaiting further action",
        highlight: true,
      },
      {
        key: "completed",
        title: "Completed Orders",
        description: "Successfully completed",
      },
      {
        key: "completedOrderValue",
        title: "Completed Order Value",
        description: "Combined value of completed orders",
        currency: true,
      },
    ],
  },
];

function StatCard({ item, value, index, color }) {
  const isEmpty = value === 0 || value === "0";

  return (
    <article
      className={`admin-stat-card ${color || ""} ${
        item.highlight ? "is-highlighted" : ""
      }`}
      style={{ "--card-index": index }}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{item.title}</span>

        <span className="stat-card-indicator" aria-hidden="true">
          {item.highlight ? "!" : "↗"}
        </span>
      </div>

      <div className="stat-card-value">
        {value ?? "—"}
      </div>

      <div className="stat-card-bottom">
        <span
          className={`stat-status-dot ${isEmpty ? "is-empty" : ""}`}
          aria-hidden="true"
        />
        <span>{item.description}</span>
      </div>
    </article>
  );
}

function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data.stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard statistics."
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

    fetchStats();
  }, [token, user?.role, navigate, fetchStats]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    }).format(amount ?? 0);

  const getValue = (sectionTitle, key) => {
    if (!stats) return "—";

    const sectionKey = sectionTitle.toLowerCase();
    const value = stats[sectionKey]?.[key];

    if (value === undefined || value === null) return "—";

    if (sectionTitle === "Orders" && key === "completedOrderValue") {
      return formatCurrency(value);
    }

    return new Intl.NumberFormat("en-LK").format(value);
  };

  if (!token || user?.role !== "admin") {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loader" />
        <p>Preparing your dashboard...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loader" />
        <h3>Growing your overview</h3>
        <p>Loading your FarmLink statistics...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <main className="admin-dashboard">
        <div className="admin-error-card">
          <span className="admin-error-icon">!</span>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
          <button
            className="admin-primary-button"
            onClick={() => fetchStats()}
          >
            Try again <span>↻</span>
          </button>
        </div>
      </main>
    );
  }

  if (!stats) return null;

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-inner">
        <header className="admin-welcome">
          <div className="admin-welcome-copy">

            <h1>
              Dashboard.
            </h1>

            <p>
              Welcome back, {user?.name || "Admin"}. 
            </p>
          </div>

          <button
            className="admin-primary-button"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
          >
            <span className={refreshing ? "admin-spinning" : ""}>
              ↻
            </span>
            {refreshing ? "Refreshing..." : "Refresh statistics"}
          </button>
        </header>

        {error && (
          <div className="admin-inline-error" role="alert">
            <span>{error}</span>
            <button onClick={() => fetchStats(true)}>Retry</button>
          </div>
        )}

        <section className="admin-overview-strip">
          <div className="overview-message">
            <div>
              <strong>FarmLink at a glance</strong>
              <p>Monitor users, listings, and orders in one place.</p>
            </div>
          </div>

          <div className="overview-total">
            <span>REGISTERED USERS</span>
            <strong>{stats.users?.total ?? 0}</strong>
          </div>
        </section>

        <div className="admin-stat-sections">
          {statSections.map((section, sectionIndex) => (
            <section
              className="admin-stat-section"
              key={section.title}
              style={{ "--section-index": sectionIndex }}
            >
              <div className="admin-section-heading">
                <div className={`admin-section-icon ${section.color}`}>
                  {section.icon}
                </div>

                <div>
                  <h2>{section.title}</h2>
                  <p>{section.subtitle}</p>
                </div>
              </div>

              <div className="admin-stat-grid">
                {section.items.map((item, index) => (
                  <StatCard
                    key={item.key}
                    item={item}
                    value={getValue(section.title, item.key)}
                    index={index}
                    color={section.color}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
