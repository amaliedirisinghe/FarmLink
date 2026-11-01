
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const extractProductFilters = async (message) => {

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            {
                role: "system",
                content: `You extract product search filters for FarmLink, a Sri Lankan agricultural marketplace.

                Available categories:
                - Vegetables
                - Fruits
                - Grains
                - Dairy

                Return ONLY valid JSON with these fields:

                {
                "search": null,
                "category": null,
                "maxPrice": null,
                "sortBy": null
                }

                Rules:
                1. Extract a product name or keyword into search.
                2. Use only the four available category names.
                3. Extract maximum prices into maxPrice as a number.
                4. Use price_asc when the user asks for cheapest or lowest-priced products.
                5. Use price_desc when the user asks for most expensive or highest-priced products.
                6. Keep unspecified fields null.
                7. Do not invent filters.
                8. If the question is not about finding marketplace products, return all fields as null.
                9. Do not include explanations or Markdown.`
            },
            {
                role: "user",
                content: message
            }
        ],
            temperature: 0,
            max_completion_tokens: 300,
            response_format: {
                type: "json_object"
            }        
    });

    const response = completion.choices[0]?.message?.content;

    console.log("Groq filter response:", response);

    if (!response) {
        return {
            search: undefined,
            category: undefined,
            maxPrice: undefined,
            sortBy: undefined
        };
    }

    const cleanedResponse = response
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    let filters;

    try {
        filters = JSON.parse(cleanedResponse);
    } catch (error) {
        console.error("Filter JSON parsing error:", error);

        return {
            search: undefined,
            category: undefined,
            maxPrice: undefined,
            sortBy: undefined
        };
    }
    const validCategories = [
        "Vegetables",
        "Fruits",
        "Grains",
        "Dairy",
        "Meat",
        "Other"
    ];

    return {
        search:
            typeof filters.search === "string"
                ? filters.search.trim() || undefined
                : undefined,

        category: validCategories.includes(filters.category)
            ? filters.category
            : undefined,

        maxPrice:
            typeof filters.maxPrice === "number" &&
            Number.isFinite(filters.maxPrice) &&
            filters.maxPrice >= 0
                ? filters.maxPrice
                : undefined,

        sortBy: ["price_asc", "price_desc"].includes(filters.sortBy)
            ? filters.sortBy
            : undefined
    };
};

export { extractProductFilters };
