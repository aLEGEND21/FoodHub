"use client";

import DateView from "@/components/date-view";
import { getLocalDateString } from "@/lib/utils";

export default function HomePage() {
  const today = getLocalDateString();
  return <DateView date={today} />;
}
