import express from "express";
import { addShuttle, getShuttles } from "../controllers/shuttleController.js";

const router = express.Router();

router.post("/add", addShuttle);
router.get("/", getShuttles);

export default router;
