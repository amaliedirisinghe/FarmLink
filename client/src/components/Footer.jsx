import { Link } from "react-router-dom";
import "./Footer.css";

// Replace these placeholders with FarmLink's actual contact details.
const CONTACT_EMAIL = "FarmLinkAgro@info.com";
const CONTACT_PHONE = "+94 11 223 5553";

// Add FarmLink's real social media URLs when available.
const SOCIAL_LINKS = {
    facebook: "https://www.farmlink.lk/",
    instagram: "https://www.farmlink.lk/",
    whatsapp: "https://www.farmlink.lk/",
    website: "https://www.farmlink.lk/",
};

function Footer() {
    return (
        <footer className="farmlink-footer">
            <div className="footer-container">
                {/* FarmLink brand */}
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <span className="footer-logo-icon" aria-hidden="true">
                            🌱
                        </span>
                        <span>FarmLink</span>
                    </Link>

                    <p className="footer-tagline">
                        Growing connections, naturally.
                    </p>

                    <p className="footer-description">
                        Connecting farmers and buyers through a simple,
                        trusted agricultural marketplace.
                    </p>
                </div>

                {/* Explore links */}
                <nav className="footer-links" aria-label="Explore">
                    <h3>Explore</h3>
                    <Link to="/">Home</Link>
                    <Link to="/products">Marketplace</Link>
                    <Link to="/register">Join FarmLink</Link>
                    <Link to="/login">Sign in</Link>
                </nav>

                {/* Contact details */}
                <div className="footer-contact">
                    <h3>Contact us</h3>

                    <p>
                        Have a question or feedback? We'd love to hear from you.
                    </p>

                    <a
                        className="footer-contact-item"
                        href={`mailto:${CONTACT_EMAIL}`}
                    >
                        <span className="footer-contact-icon" aria-hidden="true">
                            ✉
                        </span>
                        <span>{CONTACT_EMAIL}</span>
                    </a>

                    <a
                        className="footer-contact-item"
                        href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                    >
                        <span className="footer-contact-icon" aria-hidden="true">
                            ☎
                        </span>
                        <span>{CONTACT_PHONE}</span>
                    </a>
                </div>
            </div>

            {/* Social media and copyright */}
            <div className="footer-bottom">
                <div className="footer-social-area">

                    <div className="footer-socials" aria-label="Social media">
                        {SOCIAL_LINKS.facebook && (
                            <a
                                className="footer-social-link"
                                href={SOCIAL_LINKS.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="FarmLink on Facebook"
                                title="Facebook"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </a>
                        )}

                        {SOCIAL_LINKS.instagram && (
                            <a
                                className="footer-social-link"
                                href={SOCIAL_LINKS.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="FarmLink on Instagram"
                                title="Instagram"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <rect
                                        x="3.5"
                                        y="3.5"
                                        width="17"
                                        height="17"
                                        rx="5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    />
                                    <circle
                                        cx="17.5"
                                        cy="6.8"
                                        r="1.1"
                                        fill="currentColor"
                                    />
                                </svg>
                            </a>
                        )}

                        {SOCIAL_LINKS.linkedin && (
                            <a
                                className="footer-social-link"
                                href={SOCIAL_LINKS.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="FarmLink on LinkedIn"
                                title="LinkedIn"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        d="M5 9H2v12h3V9ZM3.5 3a1.8 1.8 0 1 0 0 3.6A1.8 1.8 0 0 0 3.5 3ZM22 14.1c0-3.6-1.9-5.3-4.5-5.3-2.1 0-3 1.2-3.5 2V9H11v12h3v-6.2c0-1.6.3-3.1 2.3-3.1s2 1.8 2 3.2V21h3v-6.9Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </a>
                        )}

                        {SOCIAL_LINKS.whatsapp && (
                            <a
                                className="footer-social-link"
                                href={SOCIAL_LINKS.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Contact FarmLink on WhatsApp"
                                title="WhatsApp"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        d="M20.5 11.8a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.4-4.9a8.4 8.4 0 1 1 16.1-3.8Z"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M8.2 7.8c-.3.4-.7.8-.6 1.5.2 1.7 2.6 4.4 4.9 5.3.8.3 1.4.3 1.9-.2l.9-1.1-2.2-1.1-.8.9c-.9-.4-1.7-1.2-2.1-2l.7-.9-1.1-2.2-1.6-.2Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </a>
                        )}

                        {SOCIAL_LINKS.website && (
                            <a
                                className="footer-social-link"
                                href={SOCIAL_LINKS.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="FarmLink website"
                                title="Website"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                    <ellipse
                                        cx="12"
                                        cy="12"
                                        rx="4"
                                        ry="9"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                    <path
                                        d="M3.5 9h17M3.5 15h17"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>

                <p className="footer-copyright">
                    © {new Date().getFullYear()} FarmLink. All rights reserved.
                </p>

                <span className="footer-bottom-note">
                    Growing a better future, together.
                </span>
            </div>
        </footer>
    );
}

export default Footer;