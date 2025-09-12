// routes/productRoutes.js
import express from "express";
import { addProduct, getProducts } from "../controllers/productController.js";
import { protect, farmerOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Fetch all products (no auth needed)
router.get("/", getProducts);

// Add product (farmer only)
router.post("/", protect, farmerOnly, upload.single("imageUrl"), addProduct);

export default router;
