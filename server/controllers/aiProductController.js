
import Product from "../models/Product.js";

const getAIProductContext = async (req, res) => {
    try {
        const { search, category, maxPrice } = req.query;

        // Public AI access: approved products only
        const filter = {
            status: "approved",
            quantity: { $gt: 0 }
        };

        // Search product names and descriptions
        if (search && search.trim()) {
            const searchRegex = {
                $regex: search.trim(),
                $options: "i"
            };

            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ];
        }

        // Filter by category
        if (category && category.trim()) {
            filter.category = {
                $regex: `^${category.trim()}$`,
                $options: "i"
            };
        }

        // Filter by maximum price
        if (maxPrice !== undefined && maxPrice !== "") {
            const maximum = Number(maxPrice);

            if (!Number.isFinite(maximum) || maximum < 0) {
                return res.status(400).json({
                    message: "Invalid maximum price"
                });
            }

            filter.price = { $lte: maximum };
        }

        const products = await Product.find(filter)
            .select("name category description price quantity unit images seller")
            .populate("seller", "name")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const safeProducts = products.map((product) => ({
            id: product._id,
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            unit: product.unit,
            images: product.images,
            seller: product.seller?.name || "FarmLink seller"
        }));

        return res.status(200).json({
            count: safeProducts.length,
            products: safeProducts
        });

    } catch (error) {
        console.error("AI product retrieval error:", error);

        return res.status(500).json({
            message: "Unable to retrieve marketplace products"
        });
    }
};

export { getAIProductContext };
