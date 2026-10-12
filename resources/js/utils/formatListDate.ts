// English like the rest of the UI, so a German browser doesn't mix in "vor 2 Std."
const relative = new Intl.RelativeTimeFormat("en-GB", {
    numeric: "auto",
    style: "short",
});
const dayMonth = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
});
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
});
const dateAndTime = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
});

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// "12 min ago" and "Yesterday" for a week, then "12 Oct", then "12 Oct 2025"
export function formatListDate(value: string, now = new Date()): string {
    const date = new Date(value);
    const ago = now.getTime() - date.getTime();

    if (ago < HOUR) {
        // a clock a little ahead still reads "1 min ago"
        return relative.format(-Math.max(1, Math.floor(ago / MINUTE)), "minute");
    }
    if (ago < DAY) {
        return relative.format(-Math.floor(ago / HOUR), "hour");
    }

    // whole calendar days, so last night reads "Yesterday"
    const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY);
    if (days < 7) {
        return capitalize(relative.format(-days, "day"));
    }

    const sameYear = date.getFullYear() === now.getFullYear();
    return (sameYear ? dayMonth : dayMonthYear).format(date);
}

// for the title on hover: "12 Oct 2026, 09:31"
export const formatFullDate = (value: string): string =>
    dateAndTime.format(new Date(value));

export const isWithinDay = (value: string, now = new Date()): boolean =>
    now.getTime() - new Date(value).getTime() < DAY;
