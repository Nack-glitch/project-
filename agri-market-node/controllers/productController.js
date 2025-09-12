// controllers/productController.js
import Product from "../models/productModels.js";

export const addProduct = async (req, res) => {
  try {
    const { name, description, quantity, price } = req.body;

    // Only farmer can add product
    if (!req.user || req.user.role !== "farmer") {
      return res.status(403).json({ message: "Only farmers can add products" });
    }

    const product = new Product({
      name,
      description,
      quantity,
      price,
      farmer: req.user._id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedProduct = await product.save();
    await savedProduct.populate("farmer", "name farmName");

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add product" });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "name farmName");
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
