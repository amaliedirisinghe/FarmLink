
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        password: formData.password,
      });

      setSuccess(
        response.data.message ||
          "Registration successful! Your account is pending admin approval."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/login"), 2500);
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
    <main className="register-page">
      <div className="register-layout">
        {/* Left branding panel */}
        <section className="register-brand">
          <div className="register-brand-content">
            <Link to="/" className="register-logo">
              <span>
                Farm<span className="register-logo-accent">Link</span>
              </span>
            </Link>

            <div className="register-brand-message">
              <span className="register-eyebrow">
                <span className="register-dot" />
                JOIN THE COMMUNITY
              </span>

              <h1>
                Good things
                <br />
                grow <span>together.</span>
              </h1>

              <p>
                Your next harvest of opportunities starts here.
                Connect with farmers and buyers, discover fresh
                produce, and grow with FarmLink.
              </p>

              <div className="register-benefits">
                <div className="register-benefit">
                  <span className="benefit-check">✓</span>
                  Buy and sell agricultural products
                </div>

                <div className="register-benefit">
                  <span className="benefit-check">✓</span>
                  Connect with a growing community
                </div>

                <div className="register-benefit">
                  <span className="benefit-check">✓</span>
                  Fairer opportunities for everyone
                </div>
              </div>
            </div>
          </div>

          <span className="register-decoration" aria-hidden="true">
            grow
          </span>
        </section>

        {/* Registration form */}
        <section className="register-form-section">
          <div className="register-card">
            <header className="register-heading">
              <span className="register-form-eyebrow">
                GET STARTED
              </span>

              <h2>
                Create your
                <br />
                <span>FarmLink account.</span>
              </h2>
            </header>

            {error && (
              <div className="register-alert register-alert-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div
                className="register-alert register-alert-success"
                role="status"
              >
                <strong>You're registered!</strong>
                <span>{success}</span>
                <small>Redirecting you to sign in...</small>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="register-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                className="register-submit"
                type="submit"
                disabled={loading || Boolean(success)}
              >
                <span>
                  {loading ? "Creating account..." : "Create your account"}
                </span>
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="register-login-prompt">
              Already part of FarmLink?{" "}
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}

export default Register;
