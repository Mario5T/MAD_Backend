import mongoose from "mongoose";

const MenuDaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    mealType: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.MenuDay || mongoose.model("MenuDay", MenuDaySchema);
