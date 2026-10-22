
import { Link } from "react-router-dom";
import "./HomeCategories.css";

// Homepage category cards.
// Update the category values to match the backend's supported categories.

const categories = [
    {
        name: "Vegetables",
        description: "Fresh vegetables from local farms",
        value: "Vegetables",
        image: "/images/category-vegetables.jpg",
        icon: "🥬",
    },
    {
        name: "Fruits",
        description: "Sweet and seasonal fresh fruits",
        value: "Fruits",
        image: "/images/category-fruits.jpg",
        icon: "🍎",
    },
    {
        name: "Dairy & Eggs",
        description: "Fresh dairy products and farm eggs",
        value: "Dairy & Eggs",
        image: "/images/category-dairy.jpg",
        icon: "🥛",
    },
    {
        name: "Grains & Pulses",
        description: "Wholesome grains, beans and pulses",
        value: "Grains & Pulses",
        image: "/images/category-grains.jpg",
        icon: "🌾",
    },
];


function HomeCategories() {
    return (
        <section className="home-categories" aria-labelledby="categories-title">
            {/* Section heading */}
            <div className="home-categories-heading">
                <span className="home-categories-eyebrow">
                    FRESH FROM OUR FARMERS
                </span>

                <h2 id="categories-title">
                    Explore our <span>categories</span>
                </h2>

                <p>
                    Discover fresh produce and find your favourites
                    from local farmers.
                </p>
            </div>

            {/* Category cards */}
            <div className="home-category-grid">
                {categories.map((category, index) => (
                    <Link
                        to={`/products?category=${encodeURIComponent(category.value)}`}
                        className="home-category-card"
                        key={category.name}
                        style={{ "--card-index": index }}
                    >
                        <div className="home-category-image">
                            <img
                                src={category.image}
                                alt={category.name}
                                loading="lazy"
                            />

                            <span className="home-category-icon" aria-hidden="true">
                                {category.icon}
                            </span>
                        </div>

                        <div className="home-category-info">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>

                            <span className="home-category-arrow" aria-hidden="true">
                                →
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default HomeCategories;
