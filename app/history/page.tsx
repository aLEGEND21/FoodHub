"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DailyStats } from "@/types";
import { getHistoryMeals } from "@/lib/actions/meals";
import { getLocalDateString } from "@/lib/utils";

export default function HistoryPage() {
  const router = useRouter();
  const [historyStats, setHistoryStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const stats = await getHistoryMeals();
      // Filter out today's date from history (it's shown on the home page)
      const today = getLocalDateString();
      const filteredStats = stats.filter((stat) => stat.date !== today);
      setHistoryStats(filteredStats);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const monthName = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();

    // Get ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${dayName}, ${monthName} ${day}${getOrdinalSuffix(day)}`;
  };

  const getWorkoutColor = (workoutDone: boolean) => {
    return workoutDone
      ? "bg-green-500 dark:bg-green-500/80"
      : "bg-red-500 dark:bg-red-500/80";
  };

  const getFruitColor = (fruitsCount: number) => {
    if (fruitsCount === 0) return "bg-red-500 dark:bg-red-500/80";
    if (fruitsCount === 1) return "bg-yellow-500 dark:bg-yellow-500/80";
    return "bg-green-500 dark:bg-green-500/80";
  };

  if (loading) {
    return (
      <main className="md:scrollbar-hide mx-auto w-full max-w-md px-4 pt-6 pb-24 md:flex-1 md:overflow-y-auto md:pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="md:scrollbar-hide mx-auto w-full max-w-md space-y-4 px-4 pt-6 pb-24 md:flex-1 md:overflow-y-auto md:pb-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">History</h1>
      </div>

      {historyStats.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No meal history found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyStats.map((dayStats) => (
            <div
              key={dayStats.date}
              onClick={() => router.push(`/history/${dayStats.date}`)}
              className="bg-card text-card-foreground hover:bg-accent/5 cursor-pointer rounded-lg border p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span className="text-sm leading-none">
                    {formatDate(dayStats.date)}
                  </span>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${getWorkoutColor(
                          dayStats.workoutDone ?? false,
                        )}`}
                      />
                      <span className="text-muted-foreground text-xs">
                        Workout
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${getFruitColor(
                          dayStats.fruitsCount ?? 0,
                        )}`}
                      />
                      <span className="text-muted-foreground text-xs">
                        Fruit
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 leading-none">
                  <span className="flex items-center gap-0.5">
                    <span className="text-primary text-sm leading-none font-bold">
                      {dayStats.totalCalories}
                    </span>
                    <span className="text-muted-foreground text-xs leading-none">
                      cal
                    </span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="text-primary text-sm leading-none font-bold">
                      {dayStats.totalProtein}
                    </span>
                    <span className="text-muted-foreground text-xs leading-none">
                      g
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
