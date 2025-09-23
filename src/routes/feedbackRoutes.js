import express from "express";
import { submitFeedback, getFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/submit", submitFeedback);
router.get("/", getFeedback);

export default router;
