import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  const products = await Product.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(products);
};

export const addProduct = async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    const product = await Product.create({ user: req.userId, name, price, quantity });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  await Product.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ message: "Deleted" });
};