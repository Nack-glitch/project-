
import express from "express";
import {
  buyProduct,
  getClientTransactions,
  getFarmerTransactions,
} from "../controllers/transactionController.js";
import { protect, clientOnly, farmerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/buy", protect, clientOnly, buyProduct);


router.get("/client", protect, clientOnly, getClientTransactions);


router.get("/farmer", protect, farmerOnly, getFarmerTransactions);

export default router;
