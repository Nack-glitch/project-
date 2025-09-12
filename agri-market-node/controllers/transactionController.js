import Product from "../models/productModels.js";
import Transaction from "../models/TransactionModel.js";

// Client buys a product
export const buyProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.quantity < quantity) return res.status(400).json({ message: "Not enough stock" });

    const totalAmount = product.price * quantity;

    // Reduce stock
    product.quantity -= quantity;
    await product.save();

    // Create transaction
    const transaction = new Transaction({
      product: product._id,
      farmer: product.farmer,
      client: req.user.id,
      quantity,
      totalAmount,
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get client transactions
export const getClientTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ client: req.user.id })
      .populate("product", "name price")
      .populate("farmer", "name");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get farmer transactions
export const getFarmerTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ farmer: req.user.id })
      .populate("product", "name price")
      .populate("client", "name");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
