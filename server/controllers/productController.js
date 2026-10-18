import Product from "../models/Product.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";


// ==============================
// Cloudinary Upload Helper
// ==============================

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "farmlink/products"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(buffer);
    });
};


// ==============================
// Create Product
// ==============================

const createProduct = async (req, res) => {
    try {

        const {
            name,
            category,
            description,
            price,
            quantity,
            unit
        } = req.body;


        // 1. Check required fields

        if (
            !name ||
            !category ||
            !description ||
            price === undefined ||
            quantity === undefined ||
            !unit
        ) {
            return res.status(400).json({
                message:
                    "Name, category, description, price, quantity and unit are required"
            });
        }


        // 2. Find logged-in user

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // 3. Only active users can create products

        if (user.status !== "active") {
            return res.status(403).json({
                message:
                    "Only active users can create product listings"
            });
        }


        // 4. Validate price

        if (Number(price) < 0) {
            return res.status(400).json({
                message: "Price cannot be negative"
            });
        }


        // 5. Validate quantity

        if (Number(quantity) < 0) {
            return res.status(400).json({
                message: "Quantity cannot be negative"
            });
        }


        // 6. Upload image to Cloudinary

        let imageUrls = [];
        let imagePublicIds = [];

        if (req.file) {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer
            );

            imageUrls.push(uploadResult.secure_url);
            imagePublicIds.push(uploadResult.public_id);
        }


        // 7. Create product

        const product = await Product.create({
            name: name.trim(),
            category: category.trim(),
            description: description.trim(),
            price: Number(price),
            quantity: Number(quantity),
            unit: unit.trim(),

            images: imageUrls,

            imagePublicIds: imagePublicIds,

            seller: user._id,

            status: "pending"
        });


        // 8. Send response

        res.status(201).json({
            message:
                "Product created successfully and is waiting for admin approval",

            product: {
                id: product._id,
                name: product.name,
                category: product.category,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                unit: product.unit,
                images: product.images,
                imagePublicIds: product.imagePublicIds,
                seller: product.seller,
                status: product.status,
                createdAt: product.createdAt
            }
        });

    } catch (error) {
        console.error("Create product error:", error);

        res.status(500).json({
            message: "Server error while creating product"
        });
    }
};


// ==============================
// Get Approved Products
// ==============================

const getApprovedProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort
        } = req.query;

        // Always start with approved products only
        const filter = {
            status: "approved"
        };

        // Search by product name
        if (search && search.trim()) {
            filter.name = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        // Filter by category
        if (category && category.trim()) {
            filter.category = {
                $regex: `^${category.trim()}$`,
                $options: "i"
            };
        }

        // Minimum price
        if (minPrice !== undefined && minPrice !== "") {
            const minimum = Number(minPrice);

            if (!Number.isNaN(minimum)) {
                filter.price = {
                    ...filter.price,
                    $gte: minimum
                };
            }
        }

        // Maximum price
        if (maxPrice !== undefined && maxPrice !== "") {
            const maximum = Number(maxPrice);

            if (!Number.isNaN(maximum)) {
                filter.price = {
                    ...filter.price,
                    $lte: maximum
                };
            }
        }

        // Sorting
        let sortOption = { createdAt: -1 };

        if (sort === "price_asc") {
            sortOption = { price: 1 };
        }

        if (sort === "price_desc") {
            sortOption = { price: -1 };
        }

        if (sort === "newest") {
            sortOption = { createdAt: -1 };
        }

        if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        }

        const products = await Product.find(filter)
            .populate("seller", "name email")
            .sort(sortOption);

        res.status(200).json({
            message: "Approved products retrieved successfully",
            count: products.length,
            products
        });

    } catch (error) {
        console.error(
            "Get approved products error:",
            error
        );

        res.status(500).json({
            message: "Server error while retrieving products"
        });
    }
};


// ==============================
// Get Single Approved Product
// ==============================

const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            status: "approved"
        })
            .populate("seller", "name email");


        if (!product) {
            return res.status(404).json({
                message:
                    "Approved product not found"
            });
        }


        res.status(200).json({
            message:
                "Product retrieved successfully",

            product
        });

    } catch (error) {
        console.error(
            "Get product by ID error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while retrieving product"
        });
    }
};


// ==============================
// Get My Products
// ==============================

const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({
            seller: req.user.id
        })
            .sort({ createdAt: -1 });


        res.status(200).json({
            message:
                "Your products retrieved successfully",

            count: products.length,

            products
        });

    } catch (error) {
        console.error(
            "Get my products error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while retrieving your products"
        });
    }
};


// ==============================
// Update My Product
// ==============================

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const {
            name,
            category,
            description,
            price,
            quantity,
            unit
        } = req.body;


        // 1. Find product

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }


        // 2. Check ownership

        if (
            product.seller.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message:
                    "You can only update your own products"
            });
        }


        // 3. Find logged-in user

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // 4. Only active users can update

        if (user.status !== "active") {
            return res.status(403).json({
                message:
                    "Only active users can update products"
            });
        }


        // Track whether re-approval is required

        let requiresReapproval = false;


        // ==============================
        // Update Product Name
        // ==============================

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    message:
                        "Product name cannot be empty"
                });
            }

            if (product.name !== name.trim()) {
                requiresReapproval = true;
            }

            product.name = name.trim();
        }


        // ==============================
        // Update Category
        // ==============================

        if (category !== undefined) {
            if (!category.trim()) {
                return res.status(400).json({
                    message:
                        "Product category cannot be empty"
                });
            }

            if (
                product.category !== category.trim()
            ) {
                requiresReapproval = true;
            }

            product.category = category.trim();
        }


        // ==============================
        // Update Description
        // ==============================

        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({
                    message:
                        "Product description cannot be empty"
                });
            }

            if (
                product.description !==
                description.trim()
            ) {
                requiresReapproval = true;
            }

            product.description =
                description.trim();
        }


        // ==============================
        // Update Price
        // ==============================

        if (price !== undefined) {
            if (Number(price) < 0) {
                return res.status(400).json({
                    message:
                        "Price cannot be negative"
                });
            }

            // Price changes do NOT require approval

            product.price = Number(price);
        }


        // ==============================
        // Update Quantity
        // ==============================

        if (quantity !== undefined) {
            if (Number(quantity) < 0) {
                return res.status(400).json({
                    message:
                        "Quantity cannot be negative"
                });
            }

            // Quantity changes do NOT require approval

            product.quantity = Number(quantity);
        }


        // ==============================
        // Update Unit
        // ==============================

        if (unit !== undefined) {
            if (!unit.trim()) {
                return res.status(400).json({
                    message:
                        "Unit cannot be empty"
                });
            }

            if (
                product.unit !== unit.trim()
            ) {
                requiresReapproval = true;
            }

            product.unit = unit.trim();
        }


        // ==============================
        // Replace Product Image
        // ==============================

        if (req.file) {
            try {
                // Upload new image first

                const uploadResult =
                    await uploadToCloudinary(
                        req.file.buffer
                    );


                // Delete old Cloudinary images

                if (
                    product.imagePublicIds &&
                    product.imagePublicIds.length > 0
                ) {
                    for (
                        const publicId of
                        product.imagePublicIds
                    ) {
                        try {
                            await cloudinary.uploader.destroy(
                                publicId
                            );
                        } catch (cloudinaryError) {
                            console.error(
                                "Failed to delete old Cloudinary image:",
                                cloudinaryError.message
                            );
                        }
                    }
                }


                // Save new image

                product.images = [
                    uploadResult.secure_url
                ];

                product.imagePublicIds = [
                    uploadResult.public_id
                ];


                // Image changes require approval

                requiresReapproval = true;

            } catch (uploadError) {
                console.error(
                    "Product image upload error:",
                    uploadError
                );

                return res.status(500).json({
                    message:
                        "Failed to upload product image"
                });
            }
        }


        // ==============================
        // Apply Re-approval
        // ==============================

        if (requiresReapproval) {
            product.status = "pending";
        }


        // ==============================
        // Save Product
        // ==============================

        await product.save();


        // ==============================
        // Response Message
        // ==============================

        let message =
            "Product updated successfully";

        if (requiresReapproval) {
            message =
                "Product updated successfully and is waiting for admin approval";
        }


        res.status(200).json({
            message,
            product
        });

    } catch (error) {
        console.error(
            "Update product error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while updating product"
        });
    }
};


// ==============================
// Delete My Product
// ==============================

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;


        // Find product

        const product =
            await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }


        // Check ownership

        if (
            product.seller.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message:
                    "You can only delete your own products"
            });
        }


        // Find logged-in user

        const user =
            await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Only active users can delete

        if (user.status !== "active") {
            return res.status(403).json({
                message:
                    "Only active users can delete products"
            });
        }


        // ==============================
        // Delete Cloudinary Images
        // ==============================

        if (
            product.imagePublicIds &&
            product.imagePublicIds.length > 0
        ) {
            for (
                const publicId of
                product.imagePublicIds
            ) {
                try {
                    await cloudinary.uploader.destroy(
                        publicId
                    );
                } catch (cloudinaryError) {
                    console.error(
                        "Failed to delete Cloudinary image:",
                        cloudinaryError.message
                    );
                }
            }
        }


        // ==============================
        // Delete Product
        // ==============================

        await Product.findByIdAndDelete(
            productId
        );


        res.status(200).json({
            message:
                "Product deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete product error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while deleting product"
        });
    }
};


// ==============================
// Export Controllers
// ==============================

export {
    createProduct,
    getApprovedProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct
};