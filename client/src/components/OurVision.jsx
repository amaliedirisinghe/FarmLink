
import "./OurVision.css";

const values = [
    {
        icon: "🌱",
        title: "Freshness First",
        description:
            "Discover locally available agricultural produce and explore product details in one place.",
        className: "vision-card-sage",
    },
    {
        icon: "🤝",
        title: "Direct Connections",
        description:
            "Help farmers and buyers connect through a shared digital marketplace.",
        className: "vision-card-cream",
    },
    {
        icon: "🛡️",
        title: "A Trusted Community",
        description:
            "Admin approval helps maintain an accountable community of platform users.",
        className: "vision-card-sage",
    },
    {
        icon: "🌾",
        title: "Supporting Local Farmers",
        description:
            "Give local producers a digital space to showcase their agricultural products.",
        className: "vision-card-cream",
    },
];

function OurVision() {
    return (
        <section className="our-vision" aria-labelledby="vision-title">
           
            <div className="vision-intro">
                <span className="vision-eyebrow">
                    WHAT WE BELIEVE IN
                </span>

                <h2 id="vision-title" className="vision-heading">
                    <span className="vision-heading-line">
                        {"Growing a better future,".split(" ").map((word, index) => (
                            <span
                                className="vision-word"
                                key={word}
                                style={{ "--word-index": index }}
                            >
                                {word}&nbsp;
                            </span>
                        ))}
                    </span>

                    <span className="vision-heading-line vision-heading-accent">
                        {"together.".split(" ").map((word, index) => (
                            <span
                                className="vision-word"
                                key={word}
                                style={{ "--word-index": index + 4 }}
                            >
                                {word}
                            </span>
                        ))}
                    </span>
                </h2>

                <p className="vision-description vision-reveal">
                    We envision an agricultural marketplace where farmers can
                    reach buyers directly, and people can discover local produce
                    with greater convenience and confidence.
                </p>
            </div>


            <div className="vision-values-grid">
                {values.map((value, index) => (
                    <article
                        className={`vision-card ${value.className}`}
                        key={value.title}
                        style={{ "--card-index": index }}
                    >
                        <div className="vision-card-icon" aria-hidden="true">
                            {value.icon}
                        </div>

                        <h3>{value.title}</h3>
                        <p>{value.description}</p>

                        <span className="vision-card-number">
                            0{index + 1}
                        </span>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default OurVision;
