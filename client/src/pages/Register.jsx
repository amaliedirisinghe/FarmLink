import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            setSuccess(
                response.data.message ||
                "Registration successful! Your account is pending admin approval."
            );

            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4 p-md-5">
                            <h2 className="text-success text-center mb-2">
                                Join FarmLink
                            </h2>

                            <p className="text-muted text-center mb-4">
                                Create an account to buy and sell agricultural
                                products.
                            </p>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label
                                        htmlFor="name"
                                        className="form-label"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label
                                        htmlFor="email"
                                        className="form-label"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="At least 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="form-label"
                                    >
                                        Confirm Password
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control"
                                        placeholder="Re-enter your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating Account..."
                                        : "Create Account"}
                                </button>
                            </form>

                            <p className="text-center mt-4 mb-0">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-success fw-semibold"
                                >
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-muted text-center small mt-3">
                        Your account requires admin approval before activation.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
