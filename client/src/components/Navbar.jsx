import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    // Get the existing authentication state and logout function.
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Control the mobile navigation menu with React.
    const [menuOpen, setMenuOpen] = useState(false);

    // Close the mobile menu whenever a navigation link is clicked.
    const closeMenu = () => setMenuOpen(false);

    // Preserve the existing logout behavior.
    const handleLogout = () => {
        closeMenu();
        logout();
        navigate("/login");
    };

    // Apply the active class to the current page's navigation link.
    const navLinkClass = ({ isActive }) =>
        `fl-nav-link${isActive ? " fl-nav-link-active" : ""}`;

    return (
        <header className="fl-header">
            <nav className="fl-navbar" aria-label="Main navigation">
                <div className="fl-navbar-container">

                    {/* Brand: clicking the logo returns to the homepage. */}
                    <Link
                        className="fl-brand"
                        to="/"
                        onClick={closeMenu}
                        aria-label="FarmLink home"
                    >
                        <span className="fl-brand-icon" aria-hidden="true">
                            {/* Inline SVG keeps the logo independent of icon libraries. */}
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 21V11"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M12 14C5 14 3 9 4 4C9 4 14 7 12 14Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M12 17C12 11 16 7 21 7C21 13 18 17 12 17Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </span>

                        <span className="fl-brand-text">
                            Farm<span>Link</span>
                            <small>GROWING TOGETHER</small>
                        </span>
                    </Link>

                    {/* Mobile menu toggle: accessible and controlled by React. */}
                    <button
                        className={`fl-menu-toggle${menuOpen ? " fl-menu-toggle-open" : ""}`}
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-controls="fl-navigation-content"
                        aria-expanded={menuOpen}
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    {/* Navigation content: links change according to user role. */}
                    <div
                        id="fl-navigation-content"
                        className={`fl-navigation-content${menuOpen ? " fl-navigation-content-open" : ""}`}
                    >
                        <div className="fl-nav-links">

                            {/* Public navigation links. */}
                            <NavLink
                                className={navLinkClass}
                                to="/"
                                end
                                onClick={closeMenu}
                            >
                                Home
                            </NavLink>

                            <NavLink
                                className={navLinkClass}
                                to="/products"
                                onClick={closeMenu}
                            >
                                Marketplace
                            </NavLink>

                            {/* Links available to authenticated normal users. */}
                            {isAuthenticated && user?.role === "user" && (
                                <>
                                    <NavLink
                                        className={navLinkClass}
                                        to="/my-products"
                                        onClick={closeMenu}
                                    >
                                        My Products
                                    </NavLink>

                                    <NavLink
                                        className={navLinkClass}
                                        to="/my-orders"
                                        onClick={closeMenu}
                                    >
                                        My Orders
                                    </NavLink>

                                    <NavLink
                                        className={navLinkClass}
                                        to="/seller-orders"
                                        onClick={closeMenu}
                                    >
                                        Seller Orders
                                    </NavLink>

                                    <NavLink
                                        className={navLinkClass}
                                        to="/my-favorites"
                                        onClick={closeMenu}
                                    >
                                        <span aria-hidden="true">♡</span> Favourites
                                    </NavLink>
                                </>
                            )}

                            {/* Links available only to administrators. */}
                            {isAuthenticated && user?.role === "admin" && (
                                <>
                                    <NavLink
                                        className={navLinkClass}
                                        to="/admin"
                                        end
                                        onClick={closeMenu}
                                    >
                                        Dashboard
                                    </NavLink>

                                    <NavLink
                                        className={navLinkClass}
                                        to="/admin/users"
                                        onClick={closeMenu}
                                    >
                                        User Management
                                    </NavLink>

                                    <NavLink
                                        className={navLinkClass}
                                        to="/admin/products"
                                        onClick={closeMenu}
                                    >
                                        Product Management
                                    </NavLink>

                                    <NavLink
                                        className={navLinkClass}
                                        to="/admin/orders"
                                        onClick={closeMenu}
                                    >
                                        Order Management
                                    </NavLink>
                                </>
                            )}
                        </div>

                        {/* Account actions: retain the existing login and logout flows. */}
                        <div className="fl-nav-actions">
                            {isAuthenticated ? (
                                <>
                                    <span className="fl-user-greeting">
                                        <span className="fl-user-avatar" aria-hidden="true">
                                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                        <span>
                                            <small>Welcome back</small>
                                            <strong>{user?.name}</strong>
                                        </span>
                                    </span>

                                    <button
                                        className="fl-btn fl-btn-logout"
                                        type="button"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        className="fl-btn fl-btn-login"
                                        to="/login"
                                        onClick={closeMenu}
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        className="fl-btn fl-btn-register"
                                        to="/register"
                                        onClick={closeMenu}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;