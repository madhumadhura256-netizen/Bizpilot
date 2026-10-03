import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "" },
    paymentType: { type: String, enum: ["paid", "credit"], default: "paid" },
    billId: { type: String, default: "" },
    cost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);