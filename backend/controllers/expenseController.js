import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  const list = await Expense.find({ user: req.userId }).sort({ date: -1 }).limit(200);
  res.json(list);
};

export const addExpense = async (req, res) => {
  try {
    const { title, category, amount, date } = req.body;
    const expense = await Expense.create({
      user: req.userId, title, category, amount, date: date || undefined,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ message: "Deleted" });
};