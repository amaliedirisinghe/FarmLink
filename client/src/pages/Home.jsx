
import { Link } from "react-router-dom";
import "./Home.css";
import HomeCategories from "../components/HomeCategories";
import OurVision from "../components/OurVision";
import HowFarmLinkWorks from "../components/HowFarmLinkWorks";


function Home() {
    return (
        <main className="home-page">
            {/* Hero section: text on the left, your photo on the right */}
            <section className="home-hero">
                <div className="home-hero-content">
                    {/* Eyebrow appears first */}
                    <span className="home-eyebrow reveal reveal-1">
                        GROWING TOGETHER
                    </span>

                    {/* Animate each headline line separately */}
                    <h1>
                        <span className="home-title-line reveal reveal-2">
                            Fresh from the farm.
                        </span>

                        <span className="home-title-line home-title-accent reveal reveal-3">
                            Closer to you.
                        </span>
                    </h1>

                    <p className="home-hero-description reveal reveal-4">
                        Discover fresh agricultural produce and connect directly
                        with local farmers through a simple and trusted marketplace.
                    </p>

                    <div className="home-hero-actions reveal reveal-5">
                        {/* Keep your existing Link buttons unchanged inside this div. */}
                        <Link
                            to="/products"
                            className="home-button home-button-primary"
                        >
                            Explore Marketplace <span aria-hidden="true">→</span>
                        </Link>

                        <Link
                            to="/register"
                            className="home-button home-button-secondary"
                        >
                            Join FarmLink
                        </Link>
                    </div>

                    <div className="home-benefits reveal reveal-6">
                        {/* Keep your existing benefit items here unchanged. */}
                    </div>
                </div>


                {/* The uploaded photo is used as a real image, not a banner
                    containing text, so the layout adapts to screen sizes. */}
                <div className="home-hero-image">
                    <img
                        src="/images/Farmer_hero.jpg"
                        alt="Fresh vegetables displayed at an outdoor farmers' market"
                    />

                    <div className="home-image-label">
                        <span className="home-image-label-icon">✓</span>
                        <div>
                            <strong>Freshness starts here</strong>
                            <p>Discover your local marketplace</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <HomeCategories />
            <OurVision />
            <HowFarmLinkWorks />
        </main>
    );
}

export default Home;
