import express from "express";
import { uploadMenu, getMenuByDay } from "../controllers/menuController.js";

const router = express.Router();

router.post("/upload", uploadMenu);
router.get("/:day", getMenuByDay);

export default router;
