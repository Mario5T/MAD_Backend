import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userName: { type: String },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
