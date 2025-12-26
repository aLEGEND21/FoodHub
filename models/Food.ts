import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  icon: { type: String, required: true },
  favorite: { type: Boolean, default: false },
  userId: { type: String, required: true, index: true },
});

// Compound index to ensure unique food names per user
FoodSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.models.Food || mongoose.model("Food", FoodSchema);
