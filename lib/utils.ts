import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get today's date in the user's local timezone as YYYY-MM-DD string
 * This ensures dates are based on the user's timezone, not UTC
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get the EST/EDT offset in hours for a given date
 * EST is UTC-5, EDT is UTC-4
 * DST in US typically runs from second Sunday in March to first Sunday in November
 */
function getESTOffset(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Find second Sunday in March
  const marchSecondSunday = (() => {
    let d = new Date(year, 2, 1); // March 1
    const firstDay = d.getDay();
    const daysToAdd = firstDay === 0 ? 7 : 7 - firstDay; // Days to first Sunday
    d.setDate(1 + daysToAdd + 7); // Second Sunday
    return d.getDate();
  })();

  // Find first Sunday in November
  const novemberFirstSunday = (() => {
    let d = new Date(year, 10, 1); // November 1
    const firstDay = d.getDay();
    const daysToAdd = firstDay === 0 ? 0 : 7 - firstDay; // Days to first Sunday
    d.setDate(1 + daysToAdd);
    return d.getDate();
  })();

  // Check if date is in DST period
  const isDST =
    month > 2 && month < 10
      ? true
      : month === 2
        ? day >= marchSecondSunday
        : month === 10
          ? day < novemberFirstSunday
          : false;

  return isDST ? -4 : -5; // EDT is -4, EST is -5
}

/**
 * Convert a YYYY-MM-DD date string to a Date object representing midnight in EST/EDT
 * Returns a Date object that, when stored in UTC, represents the start of that day in EST/EDT
 */
export function dateStringToEST(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create a date object for this date
  const date = new Date(year, month - 1, day);

  // Get EST offset for this date
  const offsetHours = getESTOffset(date);

  // Create UTC date by subtracting the EST offset
  // If EST is UTC-5, midnight EST = 5:00 UTC
  // So we create a UTC date at (0 - offset) hours
  return new Date(Date.UTC(year, month - 1, day, -offsetHours, 0, 0, 0));
}

/**
 * Get today's date in EST/EDT as YYYY-MM-DD string
 */
export function getTodayEST(): string {
  const now = new Date();
  // Convert current UTC time to EST time
  // EST offset is UTC-5 (or UTC-4 for EDT), so we need to subtract the offset from UTC to get EST
  // For example: if UTC is 5:00 AM and EST offset is -5, EST time is 0:00 AM (5 + (-5) = 0)
  const estOffset = getESTOffset(now);
  // Use toLocaleString to get the date in EST timezone
  const estDateStr = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // Parse the date string (format: MM/DD/YYYY)
  const [month, day, year] = estDateStr.split(/[\/,\s]+/);
  return `${year}-${month}-${day}`;
}

/**
 * Convert a UTC Date object (that represents midnight EST) back to EST date string (YYYY-MM-DD)
 * This is the inverse of dateStringToEST
 * Since the date is stored as midnight EST (4:00 or 5:00 UTC), the UTC date components
 * represent the EST date, so we can format directly from UTC components
 */
export function estDateToString(utcDate: Date): string {
  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
