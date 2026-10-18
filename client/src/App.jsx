
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import MyOrders from "./pages/MyOrders";
import SellerOrders from "./pages/SellerOrders";
import MyProducts from "./pages/MyProducts";
import AddProduct from "./pages/AddProduct";
import ManageProduct from "./pages/ManageProduct";
import MyFavorites from "./pages/MyFavorites";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

// ==============================
// Home Page
// ==============================
function Home() {
    return (
        <div className="container py-5 text-center">
            <h1 className="text-success">
                FarmLink
            </h1>

            <p className="lead">
                Agricultural Marketplace Platform
            </p>
        </div>
    );
}

// ==============================
// Main App
// ==============================
function App() {
    return (
        <BrowserRouter>
            {/* Navigation Bar */}
            <Navbar />

            {/* Application Routes */}
            <Routes>
                {/* Home */}
                <Route
                    path="/"
                    element={<Home />}
                />

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* Register */}
                <Route
                        path="/register"
                        element={<Register />}
                    />


                 {/* Admin Dashboard */}
                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />


                <Route
                    path="/admin/users"
                    element={<AdminUsers />}
                />


                <Route
                    path="/admin/products"
                    element={<AdminProducts />}
                />

                <Route
                    path="/admin/orders"
                    element={<AdminOrders />}
                />


                {/* Marketplace */}
                <Route
                    path="/products"
                    element={<Products />}
                />

                {/* Product Details */}
                <Route
                    path="/products/:productId"
                    element={<ProductDetails />}
                />

                {/* My Favourites */}
                <Route
                    path="/my-favorites"
                    element={<MyFavorites />}
                />

                {/* Buyer Orders */}
                <Route
                    path="/my-orders"
                    element={<MyOrders />}
                />

                {/* Seller Orders */}
                <Route
                    path="/seller-orders"
                    element={<SellerOrders />}
                />

                {/* My Products */}
                <Route
                    path="/my-products"
                    element={<MyProducts />}
                />

                {/* Add Product */}
                <Route
                    path="/add-product"
                    element={<AddProduct />}
                />

                {/* Manage Product */}
                <Route
                    path="/manage-product/:productId"
                    element={<ManageProduct />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
