import { describe, expect, it } from "vitest";
import { formatListDate, isWithinDay } from "./formatListDate";

// a Monday morning, local time
const now = new Date(2026, 9, 12, 10, 0);
const at = (...parts: [number, number, number, number?, number?]) =>
    new Date(...parts).toISOString();

describe("list dates", () => {
    it("counts minutes and hours for the last day", () => {
        expect(formatListDate(at(2026, 9, 12, 9, 48), now)).toBe("12 min ago");
        expect(formatListDate(at(2026, 9, 12, 8, 0), now)).toBe("2 hr ago");
        // a clock a little ahead
        expect(formatListDate(at(2026, 9, 12, 10, 1), now)).toBe("1 min ago");
    });

    it("counts calendar days for a week", () => {
        expect(formatListDate(at(2026, 9, 11, 9, 0), now)).toBe("Yesterday");
        expect(formatListDate(at(2026, 9, 9, 12, 0), now)).toBe("3 days ago");
        expect(formatListDate(at(2026, 9, 6, 9, 0), now)).toBe("6 days ago");
    });

    it("shows the day, and the year only when it isn't this year", () => {
        expect(formatListDate(at(2026, 9, 5, 9, 0), now)).toBe("5 Oct");
        expect(formatListDate(at(2025, 2, 2, 8, 44), now)).toBe("2 Mar 2025");
    });

    it("marks the last 24 hours", () => {
        expect(isWithinDay(at(2026, 9, 11, 10, 30), now)).toBe(true);
        expect(isWithinDay(at(2026, 9, 11, 9, 30), now)).toBe(false);
    });
});
