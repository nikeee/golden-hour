import { goldenHourEvents } from './golden-hour';
import type { Location } from './locations';

function escapeIcalText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function icalDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icalDay(value: Date) {
  return value.toISOString().slice(0, 10).replace(/-/g, '');
}

export function createCalendar(location: Location) {
  const now = icalDate(new Date());
  const events = goldenHourEvents(location).flatMap((event) => {
    const day = icalDay(event.start);
    const summary = `Golden Hour — ${event.period}`;
    const description = `Golden Hour for photography in ${location.name}.\nLocation: ${location.latitude}, ${location.longitude}.`;

    return [
      'BEGIN:VEVENT',
      `UID:golden-hour-${location.id}-${day}-${event.period.toLowerCase()}@golden-hour-calendar`,
      `DTSTAMP:${now}`,
      `DTSTART:${icalDate(event.start)}`,
      `DTEND:${icalDate(event.end)}`,
      `SUMMARY:${escapeIcalText(summary)}`,
      `DESCRIPTION:${escapeIcalText(description)}`,
      'CATEGORIES:Photography',
      'END:VEVENT',
    ];
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//Golden Hour Calendar//EN',
    `X-WR-CALNAME:${escapeIcalText(`${location.name} Golden Hour`)}`,
    `X-WR-TIMEZONE:${location.timeZone}`,
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
