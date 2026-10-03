import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import mongoose from "mongoose";

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
export const getTrend = async (req, res) => {
  try {
    const period = ["day", "month", "year"].includes(req.query.period) ? req.query.period : "day";
    const tz = "Asia/Kolkata";
    const format = { day: "%Y-%m-%d", month: "%Y-%m", year: "%Y" }[period];
    const count = { day: 30, month: 12, year: 5 }[period];

    // Build every bucket (so days with no sales show as 0), using India time
    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
    const [y, m] = todayStr.split("-").map(Number);
    const base = new Date(todayStr + "T00:00:00Z");

    const keys = [];
    for (let i = count - 1; i >= 0; i--) {
      if (period === "day") {
        const d = new Date(base);
        d.setUTCDate(d.getUTCDate() - i);
        keys.push(d.toISOString().slice(0, 10));
      } else if (period === "month") {
        keys.push(new Date(Date.UTC(y, m - 1 - i, 1)).toISOString().slice(0, 7));
      } else {
        keys.push(String(y - i));
      }
    }

    const startStr = { day: keys[0], month: keys[0] + "-01", year: keys[0] + "-01-01" }[period];
    const start = new Date(startStr + "T00:00:00+05:30");

    const rows = await Sale.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId), createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt", timezone: tz } },
          total: { $sum: "$total" },
        },
      },
    ]);

    const totals = Object.fromEntries(rows.map((r) => [r._id, r.total]));
    res.json(keys.map((key) => ({ key, total: totals[key] || 0 })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};