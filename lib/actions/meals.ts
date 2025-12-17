"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Food from "@/models/Food";
import MealModel from "@/models/Meal";
import HabitsModel from "@/models/Habits";
import { revalidatePath } from "next/cache";
import type { Food as FoodType, Meal, DailyStats } from "@/types";

// Zod schema for food validation
const createFoodSchema = z.object({
  name: z.string().trim().min(1, "Food name is required"),
  calories: z
    .number()
    .int("Calories must be a whole number")
    .positive("Calories must be a positive number"),
  protein: z
    .number()
    .int("Protein must be a whole number")
    .min(0, "Protein must be 0 or greater"),
  emoji: z
    .string()
    .trim()
    .min(1, "Emoji is required")
    .max(2, "Emoji should be 1-2 characters"),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;

export interface CreateFoodResult {
  success: boolean;
  message: string;
}

export async function createFood(
  prevState: CreateFoodResult | null, // Required for useActionState hook
  formData: FormData,
): Promise<CreateFoodResult> {
  try {
    // Extract form data
    const input = {
      name: formData.get("name") as string,
      calories: Number(formData.get("calories")),
      protein: Number(formData.get("protein")),
      emoji: formData.get("emoji") as string,
    };

    // Validate input with Zod
    const validationResult = createFoodSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        message: firstError?.message || "Validation failed",
      };
    }

    const validatedInput = validationResult.data;

    // Connect to database
    await dbConnect();

    // Check if food with same name already exists
    const existingFood = await Food.findOne({
      name: validatedInput.name,
    });

    if (existingFood) {
      return {
        success: false,
        message: "A food with this name already exists",
      };
    }

    // Create new food
    await Food.create({
      name: validatedInput.name,
      calories: validatedInput.calories,
      protein: validatedInput.protein,
      icon: validatedInput.emoji,
      favorite: false,
    });
  } catch (error) {
    console.error("Error creating food:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while creating the food",
    };
  }

  // Revalidate the add-meal page to show the new food
  revalidatePath("/add-meal");

  // Redirect on success - this happens server-side
  redirect("/add-meal");
}

export interface GetFoodsResult {
  favoriteFoods: FoodType[];
  regularFoods: FoodType[];
}

export async function getFoods(): Promise<GetFoodsResult> {
  try {
    await dbConnect();

    // Fetch foods from database
    let favoriteFoods = await Food.find({ favorite: true }).sort({ name: 1 });
    let regularFoods = await Food.find({ favorite: false }).sort({ name: 1 });

    // Reformat fields to match Food type
    const formattedFavoriteFoods: FoodType[] = favoriteFoods.map((food) => ({
      id: food._id.toString(),
      name: food.name,
      icon: food.icon,
      calories: food.calories,
      protein: food.protein,
      favorite: true,
    }));
    const formattedRegularFoods: FoodType[] = regularFoods.map((food) => ({
      id: food._id.toString(),
      name: food.name,
      icon: food.icon,
      calories: food.calories,
      protein: food.protein,
      favorite: false,
    }));

    return {
      favoriteFoods: formattedFavoriteFoods,
      regularFoods: formattedRegularFoods,
    };
  } catch (error) {
    console.error("Error fetching foods:", error);
    return { favoriteFoods: [], regularFoods: [] };
  }
}

export interface ToggleFoodFavoriteResult {
  success: boolean;
  message?: string;
}

export async function toggleFoodFavorite(
  foodId: string,
  favorite: boolean,
): Promise<ToggleFoodFavoriteResult> {
  try {
    await dbConnect();

    const food = await Food.findById(foodId);
    if (!food) {
      return {
        success: false,
        message: "Food not found",
      };
    }

    food.favorite = favorite;
    await food.save();

    // Revalidate pages that depend on foods
    revalidatePath("/add-meal");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error toggling favorite for food:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while updating favorite status",
    };
  }
}

// Zod schema for meal creation validation
const createMealSchema = z.object({
  foodId: z.string().min(1, "Food ID is required"),
  mealTime: z.enum(["breakfast", "lunch", "dinner", "snack"], {
    message: "Invalid meal type",
  }),
  servingSize: z.enum(["1/4", "1/3", "1/2", "2/3", "3/4", "1"], {
    message: "Invalid serving size",
  }),
  date: z.string().min(1, "Date is required"),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;

export interface CreateMealResult {
  success: boolean;
  message: string;
}

// Helper function to convert serving size to multiplier
function getServingMultiplier(servingSize: string): number {
  const multipliers: Record<string, number> = {
    "1/4": 0.25,
    "1/3": 0.333,
    "1/2": 0.5,
    "2/3": 0.667,
    "3/4": 0.75,
    "1": 1.0,
  };
  return multipliers[servingSize] || 1.0;
}

export async function createMeal(
  input: CreateMealInput,
  options?: { isToday?: boolean },
): Promise<CreateMealResult> {
  // Validate input with Zod first
  const validationResult = createMealSchema.safeParse(input);

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return {
      success: false,
      message: firstError?.message || "Validation failed",
    };
  }

  const validatedInput = validationResult.data;
  const mealDateStr = validatedInput.date;
  const isToday = options?.isToday ?? false;

  try {
    // Connect to database
    await dbConnect();

    // Fetch the food to get base nutritional values
    const food = await Food.findById(validatedInput.foodId);
    if (!food) {
      return {
        success: false,
        message: "Food not found",
      };
    }

    // Calculate adjusted values based on serving size
    const multiplier = getServingMultiplier(validatedInput.servingSize);
    const adjustedCalories = Math.round(food.calories * multiplier);
    const adjustedProtein = Math.round(food.protein * multiplier);

    // Parse date string (YYYY-MM-DD) and create Date object at start of day in UTC
    // This ensures consistent date storage regardless of server timezone
    const [year, month, day] = validatedInput.date.split("-").map(Number);
    const mealDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Create new meal
    await MealModel.create({
      name: food.name,
      calories: adjustedCalories,
      protein: adjustedProtein,
      icon: food.icon,
      servingSize: validatedInput.servingSize,
      mealTime: validatedInput.mealTime,
      foodId: validatedInput.foodId,
      date: mealDate,
    });

    // Revalidate relevant paths
    revalidatePath("/add-meal");
    revalidatePath("/");
    revalidatePath(`/history/${validatedInput.date}`);
  } catch (error) {
    console.error("Error creating meal:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while creating the meal",
    };
  }

  // Redirect on success - this happens server-side
  // Redirect to home if the meal is for today, otherwise to history page for that date
  // isToday is determined on the client side where we know the user's timezone
  // This is outside try-catch so NEXT_REDIRECT errors are not caught
  if (isToday) {
    redirect("/");
  } else {
    redirect(`/history/${mealDateStr}`);
  }
}

export async function getFoodById(foodId: string): Promise<FoodType | null> {
  try {
    await dbConnect();
    const food = await Food.findById(foodId);
    if (!food) {
      return null;
    }
    return {
      id: food._id.toString(),
      name: food.name,
      icon: food.icon,
      calories: food.calories,
      protein: food.protein,
      favorite: food.favorite || false,
    };
  } catch (error) {
    console.error("Error fetching food:", error);
    return null;
  }
}

export async function getMealsByDate(date: string): Promise<DailyStats> {
  try {
    await dbConnect();

    // Parse date string (YYYY-MM-DD) and create Date object at start of day in UTC
    const [year, month, day] = date.split("-").map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const nextDate = new Date(targetDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    // Fetch all meals for the specified date
    const meals = await MealModel.find({
      date: {
        $gte: targetDate,
        $lt: nextDate,
      },
    }).sort({ mealTime: 1, name: 1 });

    // Convert MongoDB documents to Meal type format
    const formattedMeals: Meal[] = meals.map((meal) => ({
      id: meal._id.toString(),
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      icon: meal.icon,
      servingSize: meal.servingSize as Meal["servingSize"],
      mealTime: meal.mealTime as Meal["mealTime"],
      foodId: meal.foodId.toString(),
      date: meal.date,
    }));

    // Calculate totals
    const totalCalories = formattedMeals.reduce(
      (sum, meal) => sum + meal.calories,
      0,
    );
    const totalProtein = formattedMeals.reduce(
      (sum, meal) => sum + meal.protein,
      0,
    );

    return {
      date,
      totalCalories,
      totalProtein,
      meals: formattedMeals,
    };
  } catch (error) {
    console.error("Error fetching meals by date:", error);
    // Return empty stats on error
    return {
      date,
      totalCalories: 0,
      totalProtein: 0,
      meals: [],
    };
  }
}

export async function deleteMeal(
  mealId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    await dbConnect();
    await MealModel.findByIdAndDelete(mealId);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting meal:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete meal",
    };
  }
}

export async function getHistoryMeals(): Promise<DailyStats[]> {
  try {
    await dbConnect();

    // Fetch all meals, sorted by date (newest first)
    const meals = await MealModel.find({}).sort({
      date: -1,
      mealTime: 1,
      name: 1,
    });

    // Group meals by date
    const mealsByDate = new Map<string, Meal[]>();

    meals.forEach((meal) => {
      // Convert date to YYYY-MM-DD format for grouping
      const dateStr = meal.date.toISOString().split("T")[0];

      if (!mealsByDate.has(dateStr)) {
        mealsByDate.set(dateStr, []);
      }

      const formattedMeal: Meal = {
        id: meal._id.toString(),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        icon: meal.icon,
        servingSize: meal.servingSize as Meal["servingSize"],
        mealTime: meal.mealTime as Meal["mealTime"],
        foodId: meal.foodId.toString(),
        date: meal.date,
      };

      mealsByDate.get(dateStr)!.push(formattedMeal);
    });

    // Fetch all habits for the dates we have meals
    const dateStrings = Array.from(mealsByDate.keys());
    const habitDates = dateStrings.map((dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    });

    const habits = await HabitsModel.find({
      date: { $in: habitDates },
    });

    // Create a map of date string to habits
    const habitsByDate = new Map<
      string,
      { workoutDone: boolean; fruitsCount: number }
    >();
    habits.forEach((habit) => {
      const dateStr = habit.date.toISOString().split("T")[0];
      habitsByDate.set(dateStr, {
        workoutDone: habit.workoutDone,
        fruitsCount: habit.fruitsCount,
      });
    });

    // Convert to DailyStats array
    const historyStats: DailyStats[] = Array.from(mealsByDate.entries())
      .map(([date, meals]) => {
        const totalCalories = meals.reduce(
          (sum, meal) => sum + meal.calories,
          0,
        );
        const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

        const habitsData = habitsByDate.get(date);

        return {
          date,
          totalCalories,
          totalProtein,
          meals,
          workoutDone: habitsData?.workoutDone ?? false,
          fruitsCount: habitsData?.fruitsCount ?? 0,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date, newest first

    return historyStats;
  } catch (error) {
    console.error("Error fetching history meals:", error);
    return [];
  }
}

export async function getTrendsStatsLast14Days(): Promise<DailyStats[]> {
  try {
    await dbConnect();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - 13);

    const endExclusive = new Date(today);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    const meals = await MealModel.find({
      date: {
        $gte: startDate,
        $lt: endExclusive,
      },
    }).sort({ date: 1, mealTime: 1, name: 1 });

    const mealsByDate = new Map<string, Meal[]>();

    meals.forEach((meal) => {
      const dateStr = meal.date.toISOString().split("T")[0];

      if (!mealsByDate.has(dateStr)) {
        mealsByDate.set(dateStr, []);
      }

      const formattedMeal: Meal = {
        id: meal._id.toString(),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        icon: meal.icon,
        servingSize: meal.servingSize as Meal["servingSize"],
        mealTime: meal.mealTime as Meal["mealTime"],
        foodId: meal.foodId.toString(),
        date: meal.date,
      };

      mealsByDate.get(dateStr)!.push(formattedMeal);
    });

    const habits = await HabitsModel.find({
      date: {
        $gte: startDate,
        $lt: endExclusive,
      },
    });

    const habitsByDate = new Map<
      string,
      { workoutDone: boolean; fruitsCount: number }
    >();

    habits.forEach((habit) => {
      const dateStr = habit.date.toISOString().split("T")[0];
      habitsByDate.set(dateStr, {
        workoutDone: habit.workoutDone,
        fruitsCount: habit.fruitsCount,
      });
    });

    const trends: DailyStats[] = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const dayMeals = mealsByDate.get(dateStr) ?? [];
      const totalCalories = dayMeals.reduce(
        (sum, meal) => sum + meal.calories,
        0,
      );
      const totalProtein = dayMeals.reduce(
        (sum, meal) => sum + meal.protein,
        0,
      );

      const habitsData = habitsByDate.get(dateStr);

      trends.push({
        date: dateStr,
        totalCalories,
        totalProtein,
        meals: dayMeals,
        workoutDone: habitsData?.workoutDone ?? false,
        fruitsCount: habitsData?.fruitsCount ?? 0,
      });
    }

    return trends;
  } catch (error) {
    console.error("Error fetching 14-day trends stats:", error);
    return [];
  }
}
