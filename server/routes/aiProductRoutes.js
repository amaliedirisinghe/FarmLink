
import express from "express";
import { getAIProductContext } from "../controllers/aiProductController.js";

const router = express.Router();

router.get("/products", getAIProductContext);

export default router;
