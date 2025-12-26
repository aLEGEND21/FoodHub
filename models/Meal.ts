import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  icon: { type: String, required: true },
  servingSize: { type: String, required: true },
  mealTime: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snack"],
    required: true,
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  userId: { type: String, required: true, index: true },
});

// Compound index for efficient queries by user and date
MealSchema.index({ userId: 1, date: 1 });

export default mongoose.models.Meal || mongoose.model("Meal", MealSchema);
