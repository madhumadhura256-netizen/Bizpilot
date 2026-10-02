import Customer from "../models/Customer.js";

export const getCustomers = async (req, res) => {
  const customers = await Customer.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(customers);
};

export const addCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const customer = await Customer.create({ user: req.userId, name, phone });
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// type = "add" (customer owes more) or "pay" (customer paid)
export const updateDue = async (req, res) => {
  const amount = Number(req.body.amount);
  const { type } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Enter a valid amount" });

  const filter = { _id: req.params.id, user: req.userId };
  if (type === "pay") filter.due = { $gte: amount };

  const customer = await Customer.findOneAndUpdate(
    filter,
    { $inc: { due: type === "pay" ? -amount : amount } },
    { new: true }
  );

  if (!customer)
    return res.status(400).json({ message: "Customer not found or payment exceeds due" });

  res.json(customer);
};

export const deleteCustomer = async (req, res) => {
  await Customer.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ message: "Deleted" });
};