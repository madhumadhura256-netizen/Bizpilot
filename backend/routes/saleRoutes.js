import express from "express";
import auth from "../middleware/auth.js";
import { getSales, addSale } from "../controllers/saleController.js";

const router = express.Router();
router.use(auth);

router.get("/", getSales);
router.post("/", addSale);

export default router;