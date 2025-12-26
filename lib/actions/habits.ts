"use server";

import dbConnect from "@/lib/mongodb";
import HabitsModel from "@/models/Habits";
import { revalidatePath } from "next/cache";
import type { Habits } from "@/types";
import { dateStringToEST, getTodayEST, getCurrentUserId } from "@/lib/utils";

export interface UpdateHabitsResult {
  success: boolean;
  message?: string;
}

export async function updateHabits(
  date: string, // YYYY-MM-DD format
  workoutDone: boolean,
  fruitsCount: number, // 0, 1, or 2
): Promise<UpdateHabitsResult> {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();

    await dbConnect();

    // Validate fruitsCount
    if (fruitsCount < 0 || fruitsCount > 2) {
      return {
        success: false,
        message: "Fruits count must be between 0 and 2",
      };
    }

    // Parse date string (YYYY-MM-DD) and create Date object at start of day in EST/EDT
    const habitDate = dateStringToEST(date);

    // Use upsert to create or update habits for the date and user
    await HabitsModel.findOneAndUpdate(
      { userId, date: habitDate },
      {
        userId,
        date: habitDate,
        workoutDone,
        fruitsCount,
      },
      {
        upsert: true,
        new: true,
      },
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating habits:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while updating habits",
    };
  }
}

export async function getHabitsByDate(date: string): Promise<Habits | null> {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();

    await dbConnect();

    // Parse date string (YYYY-MM-DD) and create Date object at start of day in EST/EDT
    const habitDate = dateStringToEST(date);

    const habits = await HabitsModel.findOne({ userId, date: habitDate });

    if (!habits) {
      return null;
    }

    return {
      id: habits._id.toString(),
      date: habits.date,
      workoutDone: habits.workoutDone,
      fruitsCount: habits.fruitsCount,
    };
  } catch (error) {
    console.error("Error fetching habits:", error);
    return null;
  }
}

export async function getTodayHabits(): Promise<Habits | null> {
  try {
    const dateStr = getTodayEST();
    return await getHabitsByDate(dateStr);
  } catch (error) {
    console.error("Error fetching today's habits:", error);
    return null;
  }
}
