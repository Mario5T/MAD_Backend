import express from "express";
import { signup, login, getUserProfile, getUserSessions, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", getUserProfile);
router.get("/sessions", getUserSessions);
router.post("/logout", logout);

export default router;
