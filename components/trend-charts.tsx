"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getYAxisTicks(maxValue: number): number[] {
  if (maxValue <= 0) return [0];

  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const niceSteps = [1, 2, 5, 10];
  const step =
    niceSteps.find((s) => s * magnitude >= roughStep) ??
    niceSteps[0] * magnitude;

  const ticks: number[] = [];
  for (let v = 0; v <= maxValue; v += step) {
    ticks.push(v);
  }
  if (ticks[ticks.length - 1] !== maxValue) {
    ticks.push(maxValue);
  }
  return ticks;
}

function getValueFormatter(title: string): (value: number) => string {
  if (title === "Protein") {
    return (v: number) => `${v}g`;
  }
  return (v: number) => `${v}`;
}

export function TrendLineChart({
  title,
  description,
  data,
  goal,
}: {
  title: string;
  description: string;
  data: { date: string; value: number }[];
  goal?: number;
}) {
  const maxValue = Math.max(0, ...data.map((d) => d.value), goal ?? 0);
  const startLabel = data.length ? formatDateLabel(data[0].date) : "";
  const endLabel =
    data.length > 1 ? formatDateLabel(data[data.length - 1].date) : startLabel;

  // Prepare chart data with formatted dates for display
  const chartData = data.map((point) => ({
    date: point.date,
    value: point.value,
    displayDate: formatDateLabel(point.date),
  }));

  const chartConfig: ChartConfig = {
    value: {
      label: title,
      color: "hsl(var(--chart-1))",
    },
  };

  const yAxisTicks = getYAxisTicks(maxValue);
  const valueFormatter = getValueFormatter(title);
  const gradientId = `gradient-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Card className="border-muted/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {maxValue === 0 ? (
          <p className="text-muted-foreground text-sm">
            No data for the past 14 days yet.
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                    hide
                  />
                  <YAxis
                    ticks={yAxisTicks}
                    tickFormatter={valueFormatter}
                    className="text-muted-foreground text-[10px]"
                    width={50}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div className="flex flex-col gap-1">
                            <div className="text-muted-foreground text-xs">
                              {data.displayDate}
                            </div>
                            <div className="font-medium tabular-nums">
                              {valueFormatter(data.value)}
                            </div>
                          </div>
                        </ChartTooltipContent>
                      );
                    }}
                  />
                  {goal !== undefined && (
                    <ReferenceLine
                      y={goal}
                      stroke="var(--primary)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px]">
              <span>{startLabel}</span>
              <span>→</span>
              <span>{endLabel}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function TrendBarChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: { date: string; value: number }[];
}) {
  const maxValue = Math.max(0, ...data.map((d) => d.value));
  const startLabel = data.length ? formatDateLabel(data[0].date) : "";
  const endLabel =
    data.length > 1 ? formatDateLabel(data[data.length - 1].date) : startLabel;

  // Prepare chart data with formatted dates for display
  const chartData = data.map((point) => ({
    date: point.date,
    value: point.value,
    displayDate: formatDateLabel(point.date),
  }));

  const chartConfig: ChartConfig = {
    value: {
      label: title,
      color: "hsl(var(--chart-1))",
    },
  };

  const yAxisTicks = getYAxisTicks(maxValue);
  const valueFormatter = getValueFormatter(title);

  return (
    <Card className="border-muted/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {maxValue === 0 ? (
          <p className="text-muted-foreground text-sm">
            No data for the past 14 days yet.
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                    hide
                  />
                  <YAxis
                    ticks={yAxisTicks}
                    tickFormatter={valueFormatter}
                    className="text-muted-foreground text-[10px]"
                    width={50}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div className="flex flex-col gap-1">
                            <div className="text-muted-foreground text-xs">
                              {data.displayDate}
                            </div>
                            <div className="font-medium tabular-nums">
                              {valueFormatter(data.value)}
                            </div>
                          </div>
                        </ChartTooltipContent>
                      );
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px]">
              <span>{startLabel}</span>
              <span>→</span>
              <span>{endLabel}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function TrendHeatmapChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: { date: string; done: boolean }[];
}) {
  const hasAny = data.some((d) => d.done);
  const startLabel = data.length ? formatDateLabel(data[0].date) : "";
  const endLabel =
    data.length > 1 ? formatDateLabel(data[data.length - 1].date) : startLabel;

  // Calculate current streak
  let currentStreak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].done) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <Card className="border-muted/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged in the past 14 days yet.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {currentStreak > 0 && (
                <div className="text-center">
                  <div className="text-primary text-2xl font-bold">
                    {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Current streak
                  </div>
                </div>
              )}
              <div className="flex gap-1.5">
                {data.map((point, index) => {
                  const [year, month, day] = point.date.split("-").map(Number);
                  const date = new Date(Date.UTC(year, month - 1, day));
                  const dayLabel = date.toLocaleDateString(undefined, {
                    weekday: "short",
                  });

                  return (
                    <div
                      key={point.date}
                      className="group relative flex flex-1 flex-col items-center gap-1"
                    >
                      <div
                        className={`h-8 w-full rounded-md transition-all ${
                          point.done ? "bg-primary" : "bg-muted/40"
                        }`}
                        title={`${formatDateLabel(point.date)}: ${point.done ? "Yes" : "No"}`}
                      />
                      <span className="text-muted-foreground text-[9px] font-medium">
                        {dayLabel.slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-muted-foreground mt-4 flex items-center justify-between text-[10px]">
              <span>{startLabel}</span>
              <span>→</span>
              <span>{endLabel}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
