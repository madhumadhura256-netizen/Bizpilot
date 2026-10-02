import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

export const getSales = async (req, res) => {
  const sales = await Sale.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(sales);
};

export const addSale = async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = Number(req.body.quantity);

    if (!productId || !quantity || quantity < 1)
      return res.status(400).json({ message: "Select a product and valid quantity" });

    // Reduce stock only if enough is available
    const product = await Product.findOneAndUpdate(
      { _id: productId, user: req.userId, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );

    if (!product)
      return res.status(400).json({ message: "Not enough stock or product not found" });

    const sale = await Sale.create({
      user: req.userId,
      product: product._id,
      productName: product.name,
      quantity,
      price: product.price,
      total: product.price * quantity,
    });

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};