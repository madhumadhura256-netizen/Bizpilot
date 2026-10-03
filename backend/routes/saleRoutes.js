import express from "express";
import auth from "../middleware/auth.js";
import { getSales, addSale, addBill } from "../controllers/saleController.js";

const router = express.Router();
router.use(auth);

router.get("/", getSales);
router.post("/", addSale);
router.post("/bill", addBill);

export default router;