import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

router.post("/image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const result = await new Promise((resolve, reject) => {
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

            uploadStream.end(req.file.buffer);
        });

        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {
        console.error("Cloudinary upload error:", error);

        res.status(500).json({
            message: "Image upload failed"
        });
    }
});

export default router;