import Category from "../models/CategoryModel.js";

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find(); // fetch all categories
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// (Optional) Add a new category
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add category" });
  }
};
