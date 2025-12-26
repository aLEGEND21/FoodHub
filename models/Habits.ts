import mongoose from "mongoose";

const HabitsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  workoutDone: {
    type: Boolean,
    required: true,
    default: false,
  },
  fruitsCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 2, // 0, 1, or 2 fruits
  },
  userId: { type: String, required: true, index: true },
});

// Compound unique index to ensure only one habits document per user per date
HabitsSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Habits || mongoose.model("Habits", HabitsSchema);
