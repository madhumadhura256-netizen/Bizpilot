import express from "express";
import auth from "../middleware/auth.js";
import { getExpenses, addExpense, deleteExpense } from "../controllers/expenseController.js";

const router = express.Router();
router.use(auth);

router.get("/", getExpenses);
router.post("/", addExpense);
router.delete("/:id", deleteExpense);

export default router;