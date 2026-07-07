/**
 * Date utility functions for chat date separators and expense entries
 */

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Calendar date in local timezone as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function localDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface DateParts {
  year: number;
  month: number; // 0-indexed
  day: number;
}

/**
 * Parse expense entry date for filtering. DATE columns (YYYY-MM-DD) are treated as
 * calendar dates. Timestamps (created_at) use local timezone.
 */
export function parseExpenseDateParts(
  dateStr?: string | null,
  fallbackIso?: string | null,
): DateParts | null {
  if (dateStr) {
    const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return { year: +m[1], month: +m[2] - 1, day: +m[3] };
  }
  if (fallbackIso) {
    const d = new Date(fallbackIso);
    if (!isNaN(d.getTime())) {
      return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    }
  }
  return null;
}

export function entryMatchesMonthYear(
  dateStr: string | undefined | null,
  fallbackIso: string | undefined | null,
  month: number,
  year: number,
): boolean {
  const parts = parseExpenseDateParts(dateStr, fallbackIso);
  if (!parts) return false;
  return parts.month === month && parts.year === year;
}

export function formatExpenseDate(
  dateStr?: string | null,
  fallbackIso?: string | null,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  const parts = parseExpenseDateParts(dateStr, fallbackIso);
  if (!parts) return '—';
  return new Date(parts.year, parts.month, parts.day).toLocaleDateString('en-IN', options);
}

