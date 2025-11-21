import mongoose from "mongoose";

const UserSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, unique: true, index: true },
    device: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.UserSession || mongoose.model("UserSession", UserSessionSchema);
