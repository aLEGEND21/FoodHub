// Habits type matching the Habits model structure
export interface Habits {
  id: string; // Always use 'id' in frontend (converted from MongoDB _id)
  date: Date;
  workoutDone: boolean;
  fruitsCount: number; // 0, 1, or 2
}
