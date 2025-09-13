import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
