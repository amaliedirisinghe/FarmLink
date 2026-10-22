import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
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

                {/* Authentication */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Admin */}
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

                <Route
                    path="/products/:productId"
                    element={<ProductDetails />}
                />

                {/* Favorites */}
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

                {/* Seller Products */}
                <Route
                    path="/my-products"
                    element={<MyProducts />}
                />

                <Route
                    path="/add-product"
                    element={<AddProduct />}
                />

                <Route
                    path="/manage-product/:productId"
                    element={<ManageProduct />}
                />
            </Routes>

            {/* Footer */}
            <Footer />
        </BrowserRouter>
    );
}

export default App;