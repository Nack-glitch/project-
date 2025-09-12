import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true }, // ETB transferred
    status: { type: String, default: "completed" }, // later you can add pending, failed, etc.
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
