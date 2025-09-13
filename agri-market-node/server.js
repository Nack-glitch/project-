import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js"; // make sure filename matches
import transactionRoutes from "./routes/transactionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js"; 

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);

// Health check route
app.get("/", (req, res) => res.send("Agri Market API is running..."));

// Server port
const PORT = process.env.PORT || 5000;

// Local MongoDB URI
const mongoURI = process.env.MONGO_URI_LOCAL;

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB connected successfully to local DB");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://192.168.8.123:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
