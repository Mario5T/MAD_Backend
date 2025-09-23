import prisma from "../db/db.config.js";

export const uploadMenu = async (req, res) => {
  try {
    const { day, mealType, item } = req.body;
    const menu = await prisma.menu.create({
      data: { day, mealType, item }
    });
    res.status(201).json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading menu" });
  }
};

export const getMenuByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const menu = await prisma.menu.findMany({
      where: { day }
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Error fetching menu" });
  }
};
