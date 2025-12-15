"use server";

import dbConnect from "@/lib/mongodb";
import HabitsModel from "@/models/Habits";
import { revalidatePath } from "next/cache";
import type { Habits } from "@/types";

export interface UpdateHabitsResult {
  success: boolean;
  message?: string;
}

export async function updateHabits(
  date: string, // YYYY-MM-DD format
  workoutDone: boolean,
  fruitsCount: number // 0, 1, or 2
): Promise<UpdateHabitsResult> {
  try {
    await dbConnect();

    // Validate fruitsCount
    if (fruitsCount < 0 || fruitsCount > 2) {
      return {
        success: false,
        message: "Fruits count must be between 0 and 2",
      };
    }

    // Parse date string (YYYY-MM-DD) and create Date object at start of day in UTC
    const [year, month, day] = date.split("-").map(Number);
    const habitDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Use upsert to create or update habits for the date
    await HabitsModel.findOneAndUpdate(
      { date: habitDate },
      {
        date: habitDate,
        workoutDone,
        fruitsCount,
      },
      {
        upsert: true,
        new: true,
      }
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
    await dbConnect();

    // Parse date string (YYYY-MM-DD) and create Date object at start of day in UTC
    const [year, month, day] = date.split("-").map(Number);
    const habitDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    const habits = await HabitsModel.findOne({ date: habitDate });

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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split("T")[0];
    return await getHabitsByDate(dateStr);
  } catch (error) {
    console.error("Error fetching today's habits:", error);
    return null;
  }
}
