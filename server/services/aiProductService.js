
import Product from "../models/Product.js";

const getFilteredAIProducts = async ({
    search,
    category,
    maxPrice,
    sortBy
} = {}) => {

    const filter = {
        status: "approved",
        quantity: { $gt: 0 }
    };

    // Search product name, description and category
    if (search) {
        const escapedSearch = search.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const searchRegex = {
            $regex: escapedSearch,
            $options: "i"
        };

        filter.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex }
        ];
    }

    // Filter by category
    if (category) {
        filter.category = {
            $regex: `^${category}$`,
            $options: "i"
        };
    }

    // Filter by maximum price
    if (maxPrice !== undefined && maxPrice !== null) {
        filter.price = { $lte: maxPrice };
    }

    // Choose sorting method
    let sort = { createdAt: -1 };

    if (sortBy === "price_asc") {
        sort = { price: 1 };
    } else if (sortBy === "price_desc") {
        sort = { price: -1 };
    }

    const products = await Product.find(filter)
        .select("name category description price quantity unit seller")
        .populate("seller", "name")
        .sort(sort)
        .limit(20)
        .lean();

    return products.map((product) => ({
        id: product._id,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        currency: "LKR",
        quantity: product.quantity,
        unit: product.unit,
        seller: product.seller?.name || "FarmLink seller"
    }));
};

export { getFilteredAIProducts };
