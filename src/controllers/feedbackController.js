import "../db/db.config.js";
import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    const feedback = await Feedback.create({ userName, rating, comment });
    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error submitting feedback" });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).lean();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching feedback" });
  }
};
