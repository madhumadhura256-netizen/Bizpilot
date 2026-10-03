import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Sale from "./models/Sale.js";
import Expense from "./models/Expense.js";

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
};

await mongoose.connect(process.env.MONGO_URI);

const email = (process.argv[2] || "").toLowerCase().trim();
const user = await User.findOne({ email });
if (!user) {
  console.log("No user found with that email.");
  process.exit(1);
}

// Demo cost = 65% of the selling price
const cost = [{ $set: { COST: { $round: [{ $multiply: ["$price", 0.65] }, 0] } } }];
await Product.collection.updateMany({ user: user._id }, [{ $set: { costPrice: { $round: [{ $multiply: ["$price", 0.65] }, 0] } } }]);
await Sale.collection.updateMany({ user: user._id }, [{ $set: { cost: { $round: [{ $multiply: ["$price", 0.65] }, 0] } } }]);

await Expense.deleteMany({ user: user._id });
const expenses = [
  { title: "Shop rent", category: "rent", amount: 5000, date: daysAgo(2) },
  { title: "Electricity bill", category: "electricity", amount: 1500, date: daysAgo(9) },
  { title: "Helper salary", category: "salary", amount: 5000, date: daysAgo(15) },
];
const names = { transport: "Delivery charges", stock: "Stock purchase", other: "Packaging & misc" };
for (let i = 0; i < 15; i++) {
  const category = ["transport", "stock", "other"][rand(0, 2)];
  expenses.push({ title: names[category], category, amount: rand(2, 8) * 50, date: daysAgo(rand(0, 29)) });
}
await Expense.insertMany(expenses.map((e) => ({ ...e, user: user._id })));

console.log(`Done: cost prices set, ${expenses.length} expenses added`);
process.exit(0);