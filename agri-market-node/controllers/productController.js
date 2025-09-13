import Product from "../models/ProductModel.js";
import path from "path";

// Add Product
export const addProduct = async (req, res) => {
  try {
    const { name, description, quantity, price, category, farmer } = req.body;

    let imageUrl = "";
    if (req.file) {
      // Generate full URL
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const product = new Product({
      name,
      description,
      quantity,
      price,
      farmer,
      category,
      imageUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add product" });
  }
};
