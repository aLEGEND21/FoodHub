"use client";

import DateView from "@/components/date-view";
import { useParams } from "next/navigation";

export default function DateDetailPage() {
  const params = useParams();
  const date = params.date as string;

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <main className="mx-auto w-full max-w-md px-4 pt-6">
        <div className="text-destructive py-8 text-center">
          Invalid date format
        </div>
      </main>
    );
  }

  return <DateView date={date} showAddMealButton={true} />;
}
