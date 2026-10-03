import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";   // with the other imports
import saleRoutes from "./routes/saleRoutes.js";   // with the other imports
import customerRoutes from "./routes/customerRoutes.js";   // with the other imports
import dashboardRoutes from "./routes/dashboardRoutes.js";   // with the other imports
import assistantRoutes from "./routes/assistantRoutes.js";   // with the other imports
import expenseRoutes from "./routes/expenseRoutes.js";   // with the other imports



connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("BizPilot API running"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);                  // below the auth routes line
app.use("/api/sales", saleRoutes);                  // below the products line
app.use("/api/customers", customerRoutes);                  // below the sales line
app.use("/api/dashboard", dashboardRoutes);                   // below the customers line
app.use("/api/assistant", assistantRoutes);                   // below the dashboard line
app.use("/api/expenses", expenseRoutes);                  // with the other app.use lines

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));