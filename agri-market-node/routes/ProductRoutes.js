import express from "express";
import { addProduct, getProducts } from "../controllers/productController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to store uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("imageUrl"), addProduct);
router.get("/", getProducts);

export default router;
