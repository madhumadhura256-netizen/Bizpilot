import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

export const getSales = async (req, res) => {
  const sales = await Sale.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(sales);
};

export const addSale = async (req, res) => {
  try {
    const { productId, paymentType = "paid", customerId, customerName, customerPhone } = req.body;
    const quantity = Number(req.body.quantity);

    if (!productId || !quantity || quantity < 1)
      return res.status(400).json({ message: "Select a product and valid quantity" });
    if (!["paid", "credit"].includes(paymentType))
      return res.status(400).json({ message: "Invalid payment type" });

    // Check customer before touching stock
    let customer = null;
    if (paymentType === "credit") {
      if (customerId && customerId !== "new") {
        customer = await Customer.findOne({ _id: customerId, user: req.userId });
        if (!customer) return res.status(400).json({ message: "Customer not found" });
      } else if (!customerName || !customerPhone) {
        return res.status(400).json({ message: "Enter customer name and phone for credit sales" });
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, user: req.userId, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    if (!product)
      return res.status(400).json({ message: "Not enough stock or product not found" });

    const total = product.price * quantity;
    let saleCustomerName;

    if (paymentType === "credit") {
      if (!customer)
        customer = await Customer.create({ user: req.userId, name: customerName, phone: customerPhone });
      await Customer.updateOne({ _id: customer._id }, { $inc: { due: total } });
      saleCustomerName = customer.name;
    } else {
      saleCustomerName = await nextWalkInName(req.userId);
    }

    const sale = await Sale.create({
      user: req.userId,
      product: product._id,
      productName: product.name,
      quantity,
      price: product.price,
      total,
      paymentType,
      customer: customer?._id,
      customerName: saleCustomerName,
    });

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Billing (multiple products, one customer) ----------

const rollback = async (done) => {
  for (const d of done)
    await Product.updateOne({ _id: d.id }, { $inc: { quantity: d.qty } });
};

const nextWalkInName = async (user) => {
  const names = await Sale.distinct("customerName", { user, customerName: /^Customer \d+$/ });
  const max = names.reduce((m, n) => Math.max(m, Number(n.split(" ")[1])), 0);
  return `Customer ${max + 1}`;
};

export const addBill = async (req, res) => {
  const done = [];
  try {
    const { items, paymentType = "paid", customerId, customerName, customerPhone } = req.body;

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Add at least one product" });
    if (!["paid", "credit"].includes(paymentType))
      return res.status(400).json({ message: "Invalid payment type" });

    // Check the customer before touching stock
    let customer = null;
    if (paymentType === "credit") {
      if (customerId && customerId !== "new") {
        customer = await Customer.findOne({ _id: customerId, user: req.userId });
        if (!customer) return res.status(400).json({ message: "Customer not found" });
      } else if (!customerName || !customerPhone) {
        return res.status(400).json({ message: "Enter customer name and phone for credit sales" });
      }
    }

    // Reduce stock for every item (undo everything if one fails)
    const lines = [];
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!item.productId || !qty || qty < 1) {
        await rollback(done);
        return res.status(400).json({ message: "Invalid item in the bill" });
      }
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, user: req.userId, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } },
        { new: true }
      );
      if (!product) {
        await rollback(done);
        const p = await Product.findOne({ _id: item.productId, user: req.userId });
        return res.status(400).json({ message: `Not enough stock for ${p?.name || "a product"}` });
      }
      done.push({ id: product._id, qty });
      lines.push({ product, qty });
    }

    const total = lines.reduce((t, l) => t + l.product.price * l.qty, 0);

    let saleCustomerName;
    if (paymentType === "credit") {
      if (!customer)
        customer = await Customer.create({ user: req.userId, name: customerName, phone: customerPhone });
      await Customer.updateOne({ _id: customer._id }, { $inc: { due: total } });
      saleCustomerName = customer.name;
    } else {
      saleCustomerName = await nextWalkInName(req.userId);
    }

    const billId = new mongoose.Types.ObjectId().toString();
    await Sale.insertMany(
      lines.map((l) => ({
        user: req.userId,
        product: l.product._id,
        productName: l.product.name,
        quantity: l.qty,
        price: l.product.price,
        total: l.product.price * l.qty,
        paymentType,
        customer: customer?._id,
        customerName: saleCustomerName,
        billId,
      }))
    );

    res.status(201).json({ billId, total, customerName: saleCustomerName });
  } catch (err) {
    await rollback(done);
    res.status(500).json({ message: err.message });
  }
};