import express from "express";
import { signup, login, getUserProfile, getUserSessions, logout, getDrivers } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", getUserProfile);
router.get("/sessions", getUserSessions);
router.post("/logout", logout);
router.get("/drivers", getDrivers);

export default router;
