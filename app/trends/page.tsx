import {
  TrendBarChart,
  TrendHeatmapChart,
  TrendLineChart,
} from "@/components/trend-charts";
import { getTrendsStatsLast14Days } from "@/lib/actions/meals";
import { CALORIE_GOAL, PROTEIN_GOAL } from "@/lib/constants";
import { getTodayEST } from "@/lib/utils";

export default async function TrendsPage() {
  const stats = await getTrendsStatsLast14Days();

  const caloriesData = stats.map((day) => ({
    date: day.date,
    value: day.totalCalories,
  }));

  const proteinData = stats.map((day) => ({
    date: day.date,
    value: day.totalProtein,
  }));

  const fruitsData = stats.map((day) => ({
    date: day.date,
    value: day.fruitsCount ?? 0,
  }));

  const workoutData = stats.map((day) => ({
    date: day.date,
    done: day.workoutDone ?? false,
  }));

  console.log(getTodayEST());

  return (
    <main className="md:scrollbar-hide mx-auto w-full max-w-md px-4 py-6 md:flex-1 md:overflow-y-auto md:pb-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Trends</h1>
          <p className="text-muted-foreground text-sm">
            See how your last 14 days of eating and habits are trending.
          </p>
        </div>

        <div className="space-y-4">
          <TrendLineChart
            title="Calories"
            description="Total calories eaten each day."
            data={caloriesData}
            goal={CALORIE_GOAL}
          />

          <TrendLineChart
            title="Protein"
            description="Total grams of protein per day."
            data={proteinData}
            goal={PROTEIN_GOAL}
          />

          <TrendBarChart
            title="Fruits"
            description="How many servings of fruit you logged per day."
            data={fruitsData}
          />

          <TrendHeatmapChart
            title="Workouts"
            description="Whether you logged a workout each day."
            data={workoutData}
          />
        </div>
      </div>
    </main>
  );
}
