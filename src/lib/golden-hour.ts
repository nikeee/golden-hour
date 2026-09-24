import * as SunCalc from 'suncalc';
import type { Location } from './locations';

const DAY_IN_MS = 86_400_000;
export const CALENDAR_DAYS = 180;

type LocalDate = { year: number; month: number; day: number };

function localDateAt(date: Date, timeZone: string): LocalDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);

  return { year: part('year'), month: part('month'), day: part('day') };
}

function zonedNoon(date: LocalDate, timeZone: string) {
  const target = Date.UTC(date.year, date.month - 1, date.day, 12);
  let candidate = target;

  // Convert a wall-clock noon to an instant. Noon avoids daylight-saving transitions.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(candidate));
    const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
    const observed = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'));
    candidate += target - observed;
  }

  return new Date(candidate);
}

function nextDate(date: LocalDate): LocalDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day) + DAY_IN_MS);
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
}

export type GoldenHourEvent = {
  start: Date;
  end: Date;
  period: 'Morning' | 'Evening';
};

/**
 * Matches the supplied Golden Hour Map logic: one fixed hour after sunrise and
 * one fixed hour before sunset, instead of SunCalc's variable goldenHour values.
 */
export function goldenHourEvents(location: Location, days = CALENDAR_DAYS): GoldenHourEvent[] {
  const events: GoldenHourEvent[] = [];
  let date = localDateAt(new Date(), location.timeZone);

  for (let index = 0; index < days; index += 1) {
    const times = SunCalc.getTimes(zonedNoon(date, location.timeZone), location.latitude, location.longitude);

    if (times.sunrise) {
      events.push({
        start: times.sunrise,
        end: new Date(times.sunrise.getTime() + 60 * 60 * 1000),
        period: 'Morning',
      });
    }

    if (times.sunset) {
      events.push({
        start: new Date(times.sunset.getTime() - 60 * 60 * 1000),
        end: times.sunset,
        period: 'Evening',
      });
    }

    date = nextDate(date);
  }

  return events;
}
