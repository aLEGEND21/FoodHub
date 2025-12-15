"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getTodayHabits, updateHabits } from "@/lib/actions/habits";
import { deleteMeal, getTodayMeals } from "@/lib/actions/meals";
import { CALORIE_GOAL, PROTEIN_GOAL } from "@/lib/constants";
import type { DailyStats, Meal } from "@/types";
import { Apple, ChevronRight, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [workoutDone, setWorkoutDone] = useState(false);
  const [fruitsCount, setFruitsCount] = useState(0);

  useEffect(() => {
    const fetchTodayData = async () => {
      const todayStats = await getTodayMeals();
      setTodayStats(todayStats);
      setAllMeals(todayStats.meals);

      // Fetch today's habits
      const todayHabits = await getTodayHabits();
      if (todayHabits) {
        setWorkoutDone(todayHabits.workoutDone);
        setFruitsCount(todayHabits.fruitsCount);
      }
    };
    fetchTodayData();
  }, []);

  const handleDeleteMeal = async (id: string) => {
    const result = await deleteMeal(id);
    if (result.success) {
      // Refresh meals from backend
      const todayStats = await getTodayMeals();
      setTodayStats(todayStats);
      setAllMeals(todayStats.meals);
    }
  };

  const handleWorkoutClick = async () => {
    const newWorkoutDone = !workoutDone;
    setWorkoutDone(newWorkoutDone);

    // Save to database
    const today = new Date().toISOString().split("T")[0];
    await updateHabits(today, newWorkoutDone, fruitsCount);
  };

  const handleFruitsClick = async () => {
    const newFruitsCount = (fruitsCount + 1) % 3; // Cycle through 0, 1, 2
    setFruitsCount(newFruitsCount);

    // Save to database
    const today = new Date().toISOString().split("T")[0];
    await updateHabits(today, workoutDone, newFruitsCount);
  };

  const workoutLabel = workoutDone ? "Workout Done" : "Workout Not Done";
  const fruitsLabels = ["None", "1 Fruit", "2 Fruits"];

  const getWorkoutColor = () => {
    return workoutDone
      ? "!bg-green-500/30 text-green-700 dark:text-green-300 hover:!bg-green-500/40 border-green-500/50 dark:border-green-500/20 dark:!bg-green-500/10 dark:hover:!bg-green-500/15"
      : "!bg-red-500/30 text-red-700 dark:text-red-300 hover:!bg-red-500/40 border-red-500/50 dark:border-red-500/20 dark:!bg-red-500/10 dark:hover:!bg-red-500/15";
  };

  const getFruitColor = () => {
    if (fruitsCount === 0)
      return "!bg-red-500/30 text-red-700 dark:text-red-300 hover:!bg-red-500/40 border-red-500/50 dark:border-red-500/20 dark:!bg-red-500/10 dark:hover:!bg-red-500/15";
    if (fruitsCount === 1)
      return "!bg-yellow-500/30 text-yellow-700 dark:text-yellow-300 hover:!bg-yellow-500/40 border-yellow-500/50 dark:border-yellow-500/20 dark:!bg-yellow-500/10 dark:hover:!bg-yellow-500/15";
    return "!bg-green-500/30 text-green-700 dark:text-green-300 hover:!bg-green-500/40 border-green-500/50 dark:border-green-500/20 dark:!bg-green-500/10 dark:hover:!bg-green-500/15";
  };

  const mealsByType = {
    breakfast: allMeals.filter((m) => m.mealTime === "breakfast"),
    lunch: allMeals.filter((m) => m.mealTime === "lunch"),
    dinner: allMeals.filter((m) => m.mealTime === "dinner"),
    snack: allMeals.filter((m) => m.mealTime === "snack"),
  };

  // Use goals from constants
  const calorieGoal = CALORIE_GOAL;
  const proteinGoal = PROTEIN_GOAL;
  const caloriePercent = todayStats
    ? Math.min((todayStats.totalCalories / calorieGoal) * 100, 100)
    : 0;
  const proteinPercent = todayStats
    ? Math.min((todayStats.totalProtein / proteinGoal) * 100, 100)
    : 0;

  return (
    <>
      <main className="md:scrollbar-hide bg-background mx-auto w-full max-w-md space-y-6 px-4 pt-6 md:flex-1 md:overflow-y-auto md:pb-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold">Today</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Stats Summary */}
        {todayStats && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="from-primary/10 to-primary/5 border-primary/20 dark:from-primary/20 dark:to-primary/10 bg-gradient-to-br">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-primary text-3xl font-bold">
                    {todayStats.totalCalories}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Calories
                  </div>
                  <div className="bg-muted/50 dark:bg-muted/30 border-accent/20 dark:border-accent/30 mt-2 h-2 overflow-hidden rounded-full border">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${caloriePercent}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {calorieGoal} cal goal
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="from-accent/10 to-accent/5 border-accent/20 dark:from-accent/20 dark:to-accent/10 bg-gradient-to-br">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-accent text-3xl font-bold">
                    {todayStats.totalProtein}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Grams
                  </div>
                  <div className="bg-muted/50 dark:bg-muted/30 border-accent/20 dark:border-accent/30 mt-2 h-2 overflow-hidden rounded-full border">
                    <div
                      className="bg-accent h-full transition-all"
                      style={{ width: `${proteinPercent}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {proteinGoal}g goal
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Habits Section */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleWorkoutClick}
            className={`h-24 flex-col gap-1 transition-all ${getWorkoutColor()}`}
            variant="outline"
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs font-medium">{workoutLabel}</span>
          </Button>
          <Button
            onClick={handleFruitsClick}
            className={`h-24 flex-col gap-1 transition-all ${getFruitColor()}`}
            variant="outline"
          >
            <Apple className="h-5 w-5" />
            <span className="text-xs font-medium">
              {fruitsLabels[fruitsCount]}
            </span>
          </Button>
        </div>

        {/* Today's Meals Grouped by Type */}
        <div className="space-y-3">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => {
            const meals = mealsByType[type];
            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
            const isExpanded = expandedMeals.has(type);
            const sortedMeals = [...meals].sort((a, b) =>
              a.name.localeCompare(b.name),
            );

            const typeCalories = meals.reduce(
              (sum, meal) => sum + meal.calories,
              0,
            );
            const typeProtein = meals.reduce(
              (sum, meal) => sum + meal.protein,
              0,
            );
            const itemCount = meals.length;

            return (
              <Collapsible
                key={type}
                open={isExpanded}
                onOpenChange={(open) => {
                  if (open) {
                    setExpandedMeals((prev) => new Set(prev).add(type));
                  } else {
                    setExpandedMeals((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(type);
                      return newSet;
                    });
                  }
                }}
              >
                <Card className="border-border/50 dark:border-border/30 gap-3 overflow-hidden py-3 shadow-sm">
                  <CollapsibleTrigger className="hover:bg-muted/50 dark:hover:bg-muted/30 flex w-full items-center justify-between px-5 py-3 transition-colors">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-foreground text-base font-semibold">
                        {typeLabel}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <div className="flex items-center justify-end gap-3 text-right">
                        <div className="flex items-baseline gap-1">
                          <p className="text-primary text-sm font-bold">
                            {typeCalories}
                          </p>
                          <p className="text-muted-foreground text-xs">cal</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-primary text-sm font-bold">
                            {typeProtein}
                          </p>
                          <p className="text-muted-foreground text-xs">g</p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`text-muted-foreground h-5 w-5 shrink-0 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-border/50 dark:border-border/30 bg-muted/20 dark:bg-muted/10 border-t">
                      {sortedMeals.length === 0 ? (
                        <div className="px-5 py-3 pt-6 text-center">
                          <p className="text-muted-foreground text-sm">
                            No meals logged for {typeLabel.toLowerCase()}
                          </p>
                        </div>
                      ) : (
                        <div className="pt-3">
                          {sortedMeals.map((meal, index) => (
                            <div
                              key={meal.id}
                              className={`group hover:bg-muted/30 dark:hover:bg-muted/20 flex items-center justify-between px-5 py-2 transition-colors ${
                                index !== sortedMeals.length - 1
                                  ? "border-border/30 dark:border-border/20 border-b"
                                  : ""
                              }`}
                            >
                              <div className="flex flex-1 items-center gap-3">
                                <span className="text-base">{meal.icon}</span>
                                <div className="flex-1">
                                  <p className="text-foreground text-xs leading-tight font-medium">
                                    {meal.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 text-right">
                                  <p className="text-muted-foreground text-[10px]">
                                    {meal.servingSize} serving
                                  </p>
                                  <p className="text-foreground text-xs font-semibold">
                                    {meal.calories} cal
                                  </p>
                                  <p className="text-foreground text-xs font-semibold">
                                    {meal.protein} g
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMeal(meal.id);
                                  }}
                                  className="hover:bg-destructive/10 dark:hover:bg-destructive/20 h-8 w-8 p-0"
                                >
                                  <Trash2 className="text-destructive h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </main>
    </>
  );
}
