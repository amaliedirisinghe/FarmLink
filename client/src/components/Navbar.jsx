
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success">
            <div className="container">

                {/* Brand */}
                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                >
                    🌱 FarmLink
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#farmLinkNavbar"
                    aria-controls="farmLinkNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation Links */}
                <div
                    className="collapse navbar-collapse"
                    id="farmLinkNavbar"
                >
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                        {/* Home */}
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Home
                            </Link>
                        </li>

                        {/* Marketplace */}
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">
                                Marketplace
                            </Link>
                        </li>

                        {/* Normal User Links */}
                        {isAuthenticated && user?.role === "user" && (
                            <>
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/my-products"
                                    >
                                        My Products
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/my-orders"
                                    >
                                        My Orders
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/seller-orders"
                                    >
                                        Seller Orders
                                    </Link>
                                </li>

                                {/* My Favourites */}
                                <li className="nav-item">
                                    <Link
                                        className="nav-link"
                                        to="/my-favorites"
                                    >
                                        ♡ My Favourites
                                    </Link>
                                </li>
                            </>
                        )}

                        
                            {/* Admin Links */}
                            {isAuthenticated && user?.role === "admin" && (
                                <>
                                    <li className="nav-item">
                                        <Link
                                            className="nav-link"
                                            to="/admin"
                                        >
                                            Admin Dashboard
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link
                                            className="nav-link"
                                            to="/admin/users"
                                        >
                                            User Management
                                        </Link>
                                    </li>


                                    <li className="nav-item">
                                        <Link
                                            className="nav-link"
                                            to="/admin/products"
                                        >
                                            Product Management
                                        </Link>
                                    </li>



                                    <li className="nav-item">
                                        <Link
                                            className="nav-link"
                                            to="/admin/orders"
                                        >
                                            Order Management
                                        </Link>
                                    </li>


                                </>
                            )}


                    </ul>

                    {/* Authentication Section */}
                    <div className="d-flex align-items-center">

                        {isAuthenticated ? (
                            <>
                                <span className="text-white me-3">
                                    Hello, {user?.name}
                                </span>

                                <button
                                    className="btn btn-light btn-sm"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    className="btn btn-outline-light btn-sm me-2"
                                    to="/login"
                                >
                                    Login
                                </Link>

                                <Link
                                    className="btn btn-light btn-sm"
                                    to="/register"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
