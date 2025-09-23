import prisma from "../db/db.config.js";

export const submitFeedback = async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    const feedback = await prisma.feedback.create({
      data: { userName, rating, comment },
    });
    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error submitting feedback" });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching feedback" });
  }
};
