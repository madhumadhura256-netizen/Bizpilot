import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

export const getDashboard = async (req, res) => {
  try {
    const user = req.userId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [sales, products, customers] = await Promise.all([
      Sale.find({ user }).sort({ createdAt: -1 }),
      Product.find({ user }),
      Customer.find({ user }),
    ]);

    const sum = (list) => list.reduce((t, s) => t + s.total, 0);

    res.json({
      todaySales: sum(sales.filter((s) => s.createdAt >= startOfDay)),
      totalSales: sum(sales),
      totalDue: customers.reduce((t, c) => t + c.due, 0),
      totalProducts: products.length,
      lowStock: products.filter((p) => p.quantity <= 5),
      recentSales: sales.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};