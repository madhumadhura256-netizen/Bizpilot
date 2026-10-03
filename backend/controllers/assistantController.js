import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

export const askAssistant = async (req, res) => {
  try {
    const { question, language } = req.body;
    if (!question) return res.status(400).json({ message: "Enter a question" });

    const user = req.userId;
    const [products, sales, customers] = await Promise.all([
      Product.find({ user }),
      Sale.find({ user }).sort({ createdAt: -1 }),
      Customer.find({ user }),
    ]);

    // Totals per product across ALL sales, so "best seller" answers are accurate
    const perProduct = {};
    for (const s of sales) {
      if (!perProduct[s.productName]) perProduct[s.productName] = { product: s.productName, unitsSold: 0, revenue: 0 };
      perProduct[s.productName].unitsSold += s.quantity;
      perProduct[s.productName].revenue += s.total;
    }

    const data = {
      today: new Date().toISOString().slice(0, 10),
      products: products.map((p) => ({ name: p.name, price: p.price, stock: p.quantity })),
      salesByProduct: Object.values(perProduct).sort((a, b) => b.unitsSold - a.unitsSold),
      totalSales: sales.reduce((t, s) => t + s.total, 0),
      recentSales: sales.slice(0, 30).map((s) => ({
        product: s.productName,
        qty: s.quantity,
        total: s.total,
        customer: s.customerName,
        payment: s.paymentType,
        date: s.createdAt.toISOString().slice(0, 10),
      })),
      customers: customers.map((c) => ({ name: c.name, phone: c.phone, due: c.due })),
    };

    const instruction =
      "You are BizPilot, a helpful assistant for a small business owner. " +
      "Answer using only the business data provided. Currency is Indian rupees (₹). " +
      "Low stock means 5 or fewer units. " +
      "Keep answers short and simple. Use short bullet points starting with '- ' for lists. " +
      "If the data is not enough, say so. " +
      "Reply in " + (language || "English") + ".";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL,
        reasoning_effort: "low",
        max_completion_tokens: 2000,
        messages: [
          { role: "system", content: instruction },
          {
            role: "user",
            content: `Business data:\n${JSON.stringify(data)}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const busy = [429, 503].includes(response.status);
      return res.status(500).json({
        message: busy
          ? "AI is busy right now. Please try again in a minute."
          : result.error?.message || "AI request failed",
      });
    }

    const answer = result.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      console.log("Empty AI reply:", JSON.stringify(result).slice(0, 500));
      return res.status(500).json({ message: "The AI returned an empty answer. Please try again." });
    }

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};