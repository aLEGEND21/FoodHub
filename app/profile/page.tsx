import { logout } from "@/lib/actions/auth";
import { getUserProfile, getProfileStats } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { ThemePicker } from "@/components/theme-picker";

function StatCard({ value, label }: { value: number; label: string }) {
  // Pluralize label: remove trailing 's' from first word if value is 1
  const pluralizedLabel =
    value === 1 ? label.replace(/^(\w+)s(\s|$)/, "$1$2").trim() : label;

  return (
    <div className="border-primary/20 from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex flex-col items-center justify-center gap-1 rounded-2xl border bg-gradient-to-br p-6 text-center">
      <span className="text-primary text-3xl font-bold">
        {value.toLocaleString()}
      </span>
      <span className="text-muted-foreground text-sm">{pluralizedLabel}</span>
    </div>
  );
}

export default async function ProfilePage() {
  const [user, stats] = await Promise.all([
    getUserProfile(),
    getProfileStats(),
  ]);

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-6 pb-24">
      {/* User Header */}
      <div className="border-border/50 bg-card/25 mb-8 flex items-center gap-4 rounded-2xl border p-4">
        <div className="relative h-16 w-16 shrink-0">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || "Profile"}
              fill
              className="border-border rounded-full border-2 object-cover"
            />
          ) : (
            <div className="border-border bg-muted flex h-full w-full items-center justify-center rounded-full border-2">
              <span className="text-muted-foreground text-xl font-semibold">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">
            <span className="mr-2">👋</span>Hi, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Your Stats Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={stats.mealsEaten} label="meals eaten" />
          <StatCard value={stats.foodsSaved} label="foods saved" />
          <StatCard value={stats.workoutsLogged} label="workouts" />
          <StatCard value={stats.fruitsEaten} label="fruits eaten" />
        </div>
      </section>

      {/* Settings Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Settings</h2>
        <div className="flex flex-col gap-3">
          <ThemePicker />
          <form action={logout}>
            <Button
              type="submit"
              variant="destructive"
              size="lg"
              className="w-full"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
