import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./HowFarmLinkWorks.css";

const steps = [
    {
        number: "01",
        icon: "⌕",
        title: "Discover local produce",
        description:
            "Explore agricultural listings, compare prices and quantities, and find products that suit your needs.",
        tag: "EXPLORE",
    },
    {
        number: "02",
        icon: "↗",
        title: "Connect directly",
        description:
            "Communicate with farmers or buyers to discuss products, prices, quantities and purchasing arrangements.",
        tag: "CONNECT",
    },
    {
        number: "03",
        icon: "✓",
        title: "Manage your orders",
        description:
            "Place and manage orders through FarmLink. Buyers and sellers coordinate collection or delivery arrangements directly.",
        tag: "TRADE",
    },
];

function HowFarmLinkWorks() {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;

        if (!section) return;

        // Reveal the section when it enters the viewport.
        if (!("IntersectionObserver" in window)) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className={`how-it-works ${isVisible ? "is-visible" : ""}`}
            aria-labelledby="how-it-works-title"
        >
            <div className="how-it-works-container">
                <header className="how-heading">
                    <span className="how-eyebrow">
                        <span className="how-eyebrow-dot" />
                        SIMPLE BY NATURE
                    </span>

                    <h2 id="how-it-works-title">
                        From discovery
                        <br />
                        <span>to connection.</span>
                    </h2>

                    <p>
                        A simpler way to explore agricultural produce and
                        connect with the people who grow and buy it.
                    </p>
                </header>

                <div className="how-steps">
                    <div className="how-connecting-line" aria-hidden="true" />

                    {steps.map((step, index) => (
                        <article
                            className="how-step-card"
                            key={step.number}
                            style={{ "--step-index": index }}
                        >
                            <div className="how-step-top">
                                <span className="how-step-number">
                                    {step.number}
                                </span>

                                <span
                                    className="how-step-icon"
                                    aria-hidden="true"
                                >
                                    {step.icon}
                                </span>
                            </div>

                            <span className="how-step-tag">{step.tag}</span>

                            <h3>{step.title}</h3>

                            <p>{step.description}</p>

                            <span
                                className="how-step-bottom"
                                aria-hidden="true"
                            >
                                <span />
                            </span>
                        </article>
                    ))}
                </div>

                <div className="how-bottom">
                    <div className="how-bottom-copy">
                        <span className="how-bottom-icon" aria-hidden="true">
                            ✳
                        </span>
                        <p>
                            <strong>One marketplace. Two sides of agriculture.</strong>
                            <span>
                                Buyers and sellers can each use FarmLink to
                                discover opportunities and manage their activity.
                            </span>
                        </p>
                    </div>

                    <Link to="/products" className="how-cta">
                        Explore marketplace
                        <span aria-hidden="true">→</span>
                    </Link>
                </div>

                <p className="how-arrangements-note">
                    Collection and delivery arrangements are coordinated
                    directly between buyers and sellers.
                </p>
            </div>
        </section>
    );
}

export default HowFarmLinkWorks;