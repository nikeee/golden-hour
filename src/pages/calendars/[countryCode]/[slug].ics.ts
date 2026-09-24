import type { APIRoute } from 'astro';
import { createCalendar } from '../../../lib/ical';
import { locations, type Location } from '../../../lib/locations';

export function getStaticPaths() {
  return locations.map((location) => ({
    params: { countryCode: location.countryCode, slug: location.slug },
    props: { location },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { location } = props as { location: Location };

  return new Response(createCalendar(location), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${location.slug}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
