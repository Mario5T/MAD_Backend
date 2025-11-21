import mongoose from "mongoose";

const ShuttleSchema = new mongoose.Schema(
  {
    route: { type: String, required: true },
    time: { type: Date, required: true },
    location: { type: String },
    contact: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Shuttle || mongoose.model("Shuttle", ShuttleSchema);
