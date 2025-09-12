import express from "express";
import { getCategories, addCategory } from "../controllers/categoryController.js";

const router = express.Router();

// Get all categories
router.get("/", getCategories);

// (Optional) Add new category
router.post("/", addCategory);

export default router;
