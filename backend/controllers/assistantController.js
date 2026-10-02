import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

export const askAssistant = async (req, res) => {
  try {
    const k = process.env.GROQ_API_KEY || "";
console.log("Key starts:", k.slice(0, 4), "| length:", k.length, "| has space:", /\s/.test(k));
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Enter a question" });

    const user = req.userId;
    const [products, sales, customers] = await Promise.all([
      Product.find({ user }),
      Sale.find({ user }).sort({ createdAt: -1 }).limit(50),
      Customer.find({ user }),
    ]);

    const data = {
      products: products.map((p) => ({ name: p.name, price: p.price, stock: p.quantity })),
      recentSales: sales.map((s) => ({
        product: s.productName,
        qty: s.quantity,
        total: s.total,
        date: s.createdAt.toISOString().slice(0, 10),
      })),
      customers: customers.map((c) => ({ name: c.name, due: c.due })),
      today: new Date().toISOString().slice(0, 10),
    };

    const instruction =
      "You are BizPilot, a helpful assistant for a small business owner. " +
      "Answer using only the business data provided. Currency is Indian rupees (₹). " +
      "Keep answers short and simple. If the data is not enough, say so.";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL,
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

    const answer = result.choices?.[0]?.message?.content || "No answer received";
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};