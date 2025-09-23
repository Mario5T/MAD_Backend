import prisma from "../db/db.config.js";
export const addShuttle = async (req, res) => {
  try {
    const { route, time, location, contact } = req.body;
    const shuttle = await prisma.shuttle.create({
      data: { route, time, location, contact },
    });
    res.status(201).json(shuttle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding shuttle schedule" });
  }
};
export const getShuttles = async (req, res) => {
  try {
    const shuttles = await prisma.shuttle.findMany({
      orderBy: { time: "asc" },
    });
    res.json(shuttles);
  } catch (error) {
    res.status(500).json({ error: "Error fetching shuttle data" });
  }
};
