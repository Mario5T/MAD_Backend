import "../db/db.config.js";
import Shuttle from "../models/Shuttle.js";
export const addShuttle = async (req, res) => {
  try {
    const { route, time, location, contact } = req.body;
    const shuttle = await Shuttle.create({ route, time, location, contact });
    res.status(201).json(shuttle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding shuttle schedule" });
  }
};
export const getShuttles = async (req, res) => {
  try {
    const shuttles = await Shuttle.find({}).sort({ time: 1 }).lean();
    res.json(shuttles);
  } catch (error) {
    res.status(500).json({ error: "Error fetching shuttle data" });
  }
};
