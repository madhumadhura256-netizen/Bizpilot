import express from "express";
import auth from "../middleware/auth.js";
import { getDashboard, getTrend } from "../controllers/dashboardController.js";

const router = express.Router();
router.use(auth);

router.get("/", getDashboard);
router.get("/trend", getTrend);

export default router;