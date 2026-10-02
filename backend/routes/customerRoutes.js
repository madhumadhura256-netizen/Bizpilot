import express from "express";
import auth from "../middleware/auth.js";
import { getCustomers, addCustomer, updateDue, deleteCustomer } from "../controllers/customerController.js";

const router = express.Router();
router.use(auth);

router.get("/", getCustomers);
router.post("/", addCustomer);
router.put("/:id/due", updateDue);
router.delete("/:id", deleteCustomer);

export default router;