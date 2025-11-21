import express from "express";
import { uploadMenuFile, getAllMenu, uploadMenu, getMenuByDay, testUpload } from "../controllers/menuController.js";
import { upload } from "../controllers/menuController.js";

const router = express.Router();

// Wrap multer to ensure JSON errors instead of default HTML
router.post("/upload", (req, res, next) => {
  upload.single("menuFile")(req, res, function (err) {
    if (err) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ error: err.message || "Upload error" });
    }
    next();
  });
}, uploadMenuFile);
router.post("/test-upload", upload.single("testFile"), testUpload);
router.get("/all", getAllMenu);
router.post("/item", uploadMenu);
router.get("/:day", getMenuByDay);

export default router; 


