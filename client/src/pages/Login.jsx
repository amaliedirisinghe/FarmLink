import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", formData);
            const { token, user } = response.data;
            login(user, token);
            navigate("/");
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Login failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="farmlink-login">
            <section className="login-shell" aria-label="FarmLink login">
                <aside className="login-brand-panel">
                    <div className="login-brand-content">
                        <a className="login-brand" href="/" aria-label="FarmLink home">
                            <span className="login-brand-mark" aria-hidden="true">
                                <svg viewBox="0 0 48 48" role="img">
                                    <path d="M24 39V21" />
                                    <path d="M24 29C13 29 8 22 9 12c10 0 17 5 15 17" />
                                    <path d="M24 24C24 13 31 7 41 8c0 10-5 17-17 16" />
                                    <path d="M14 39h20" />
                                </svg>
                            </span>
                            <span>Farm<span className="brand-light">Link</span></span>
                        </a>

                        <div className="login-hero-copy">
                            <span className="login-eyebrow">
                                <span className="eyebrow-dot" />
                                GROWING TOGETHER
                            </span>
                            <h1>Good things<br />grow <em>together.</em></h1>
                            <p>
                                Bringing farmers and buyers closer, one harvest at a time.
                                Fresh produce, fair prices, stronger communities.
                            </p>
                        </div>

                    </div>
                </aside>

                <section className="login-form-panel">
                    <div className="mobile-brand">
                        <span className="login-brand-mark" aria-hidden="true">
                            <svg viewBox="0 0 48 48">
                                <path d="M24 39V21" /><path d="M24 29C13 29 8 22 9 12c10 0 17 5 15 17" />
                                <path d="M24 24C24 13 31 7 41 8c0 10-5 17-17 16" /><path d="M14 39h20" />
                            </svg>
                        </span>
                        <span>Farm<span className="brand-light">Link</span></span>
                    </div>

                    <div className="login-form-inner">
                        <div className="form-welcome">
                            <span className="form-kicker">WELCOME BACK</span>
                            <h2>Let’s get you<br /><em>growing.</em></h2>
                            <p>Sign in to continue to your FarmLink account.</p>
                        </div>

                        {error && (
                            <div className="login-error" role="alert">
                                <span className="error-symbol" aria-hidden="true">!</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="login-field">
                                <label htmlFor="email">Email address</label>
                                <div className="login-input-wrap">
                                    <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                                        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
                                        <path d="m4.5 7 7.5 6 7.5-6" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login-field">
                                <div className="password-label-row">
                                    <label htmlFor="password">Password</label>
                                </div>
                                <div className="login-input-wrap">
                                    <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true">
                                        <rect x="4.5" y="10" width="15" height="11" rx="2.5" />
                                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        className="password-toggle"
                                        type="button"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.4 3.3M6.2 6.3C3.9 7.8 2.8 10 2.5 12c1 2.5 4.3 7 9.5 7 1.4 0 2.6-.3 3.7-.9" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button className="login-submit" type="submit" disabled={loading}>
                                <span>{loading ? "Signing you in..." : "Sign in to FarmLink"}</span>
                                {loading ? (
                                    <span className="login-spinner" aria-hidden="true" />
                                ) : (
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M5 12h14M13 6l6 6-6 6" />
                                    </svg>
                                )}
                            </button>
                        </form>

                        <div className="login-security-note">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 3 19 6v5c0 4.5-2.8 7.5-7 10-4.2-2.5-7-5.5-7-10V6l7-3Z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            <span>Your account and information are kept secure.</span>
                        </div>

                        <p className="login-register-note">
                           <span>Join the growing community</span>
                        </p>
                        <p className="login-legal">© {new Date().getFullYear()} FarmLink. Growing a better future.</p>
                    </div>
                </section>
            </section>
        </main>
    );
};

export default Login;
