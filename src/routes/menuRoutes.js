import express from "express";
import { uploadMenuFile, getAllMenu, uploadMenu, getMenuByDay, testUpload } from "../controllers/menuController.js";
import { upload } from "../controllers/menuController.js";

const router = express.Router();

router.post("/upload", upload.single("menuFile"), uploadMenuFile);
router.post("/test-upload", upload.single("testFile"), testUpload);
router.get("/all", getAllMenu);
router.post("/item", uploadMenu);
router.get("/:day", getMenuByDay);

export default router; 
