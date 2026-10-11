import { formatInTimeZone } from "date-fns-tz";

const TIME_ZONE = "America/Bogota";

export function todayInBogota(): string {
  return formatInTimeZone(new Date(), TIME_ZONE, "yyyy-MM-dd");
}

export function formatDateShort(date: string): string {
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return date;

  const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcDate);
}

export function formatDateLong(date: string): string {
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return date;

  const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(utcDate);
}

export function formatTime(value: string): string {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return value;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export function timeRangeToLabel(
  slots: { time_start: string; time_end: string }[],
): string {
  if (slots.length === 0) return "—";
  const start = formatTime(slots[0].time_start);
  const end = formatTime(slots[slots.length - 1].time_end);
  return `${start} – ${end}`;
}

export function isPastDate(date: string): boolean {
  return date < todayInBogota();
}