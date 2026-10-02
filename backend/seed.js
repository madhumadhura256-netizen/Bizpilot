import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Sale from "./models/Sale.js";
import Customer from "./models/Customer.js";

const email = process.argv[2];
if (!email) {
  console.log("Usage: node seed.js your@email.com");
  process.exit(1);
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const productList = [
  ["Rice 5kg", 320], ["Wheat Flour 5kg", 250], ["Sugar 1kg", 45], ["Salt 1kg", 22],
  ["Sunflower Oil 1L", 150], ["Toor Dal 1kg", 140], ["Tea Powder 500g", 210],
  ["Coffee 200g", 260], ["Milk Packet", 28], ["Biscuits Pack", 20],
  ["Soap Bar", 38], ["Shampoo Sachet", 3], ["Toothpaste", 85], ["Detergent 1kg", 120],
  ["Notebook", 55], ["Pen Box", 90], ["Chips Pack", 20], ["Cold Drink 1L", 65],
  ["Bread", 40], ["Eggs (12)", 84],
];

const names = [
  "Ravi Kumar", "Priya Sharma", "Arun Raj", "Meena Devi", "Suresh Babu",
  "Lakshmi N", "Karthik S", "Anita Joshi", "Mohan Das", "Divya R",
  "Vijay Anand", "Kavitha M", "Rahul Verma", "Sneha Patel", "Imran Khan",
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const all = await User.find({}, "email");
    console.log("No user found. Emails in this database:", all.map((u) => u.email));
    process.exit(1);
  }

  // Clear this account's old data so the script can be re-run
  await Promise.all([
    Product.deleteMany({ user: user._id }),
    Sale.deleteMany({ user: user._id }),
    Customer.deleteMany({ user: user._id }),
  ]);

  // Products with starting stock
  const products = await Product.insertMany(
    productList.map(([name, price]) => ({
      user: user._id, name, price, quantity: rand(60, 150),
    }))
  );

  // Sales over the last 30 days (stock reduced as we go)
  const stock = {};
  products.forEach((p) => (stock[p._id] = p.quantity));

  const sales = [];
  for (let i = 0; i < 200; i++) {
    const p = products[rand(0, products.length - 1)];
    const qty = rand(1, 6);
    if (stock[p._id] < qty) continue;
    stock[p._id] -= qty;

    const date = new Date();
    date.setDate(date.getDate() - rand(0, 29));
    date.setHours(rand(9, 20), rand(0, 59), 0, 0);

    sales.push({
      user: user._id, product: p._id, productName: p.name,
      quantity: qty, price: p.price, total: p.price * qty,
      createdAt: date, updatedAt: date,
    });
  }
  await Sale.insertMany(sales);

  // Save final stock; force a few items to be low stock for the demo
  const lowStockIds = products.slice(0, 5).map((p) => String(p._id));
  for (const p of products) {
    const final = lowStockIds.includes(String(p._id)) ? rand(1, 5) : stock[p._id];
    await Product.updateOne({ _id: p._id }, { quantity: final });
  }

  // Customers with dues
  await Customer.insertMany(
    names.map((name, i) => ({
      user: user._id,
      name,
      phone: "9" + rand(100000000, 999999999),
      due: i % 4 === 0 ? 0 : rand(1, 40) * 50,
    }))
  );

  console.log(`Done: ${products.length} products, ${sales.length} sales, ${names.length} customers`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});