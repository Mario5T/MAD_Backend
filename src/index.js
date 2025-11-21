import express from "express";
import cors from "cors";
import menuRoutes from "./routes/menuRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import shuttleRoutes from "./routes/shuttleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import "./db/db.config.js";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/menu", menuRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/shuttle", shuttleRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => res.send("Backend running 🚀"));
app.listen(PORT, "0.0.0.0", () => {
});

