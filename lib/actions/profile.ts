"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Food from "@/models/Food";
import MealModel from "@/models/Meal";
import HabitsModel from "@/models/Habits";
import { getCurrentUserId } from "@/lib/utils";

export interface UserProfile {
  name: string;
  email: string;
  image?: string;
}

export interface ProfileStats {
  mealsEaten: number;
  foodsSaved: number;
  workoutsLogged: number;
  fruitsEaten: number;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    return {
      name: session.user.name || "User",
      email: session.user.email || "",
      image: session.user.image || undefined,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function getProfileStats(): Promise<ProfileStats> {
  try {
    const userId = await getCurrentUserId();
    await dbConnect();

    // Run all queries in parallel for better performance
    const [mealsCount, foodsCount, workoutsCount, allHabits] =
      await Promise.all([
        // Count total meals eaten
        MealModel.countDocuments({ userId }),

        // Count total foods saved
        Food.countDocuments({ userId }),

        // Count workouts logged (habits where workoutDone is true)
        HabitsModel.countDocuments({ userId, workoutDone: true }),

        // Get all habits to sum fruits eaten
        HabitsModel.find({ userId }).select("fruitsCount"),
      ]);

    // Sum up all fruits eaten across all habits
    const fruitsEaten = allHabits.reduce(
      (sum, habit) => sum + (habit.fruitsCount || 0),
      0,
    );

    return {
      mealsEaten: mealsCount,
      foodsSaved: foodsCount,
      workoutsLogged: workoutsCount,
      fruitsEaten,
    };
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return {
      mealsEaten: 0,
      foodsSaved: 0,
      workoutsLogged: 0,
      fruitsEaten: 0,
    };
  }
}
