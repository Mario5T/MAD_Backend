import express from "express";
import cors from "cors";
import menuRoutes from "./routes/menuRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import shuttleRoutes from "./routes/shuttleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import prisma from "./db/db.config.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/menu", menuRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/shuttle", shuttleRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => res.send("Backend running 🚀"));

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});

