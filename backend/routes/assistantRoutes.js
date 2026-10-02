import express from "express";
import auth from "../middleware/auth.js";
import { askAssistant } from "../controllers/assistantController.js";

const router = express.Router();
router.use(auth);

router.post("/", askAssistant);

export default router;