import { readFile, writeFile } from 'node:fs/promises';

const [inputFile, outputFile] = process.argv.slice(2);

if (!inputFile || !outputFile) {
  throw new Error('Usage: node scripts/import-geonames-locations.mjs <cities500.txt> <output.json>');
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'city';
}

const raw = await readFile(inputFile, 'utf8');
const locations = raw
  .split('\n')
  .filter(Boolean)
  .map((line) => line.split('\t'))
  .filter((fields) => fields[6] === 'P' && Number(fields[14]) > 250_000 && fields[8] && fields[17])
  .map((fields) => {
    const id = fields[0];
    const name = fields[1];
    const asciiName = fields[2] || name;
    const countryCode = fields[8].toLowerCase();

    return {
      id,
      name,
      slug: `${slugify(asciiName)}-${id}`,
      countryCode,
      latitude: Number(fields[4]),
      longitude: Number(fields[5]),
      population: Number(fields[14]),
      timeZone: fields[17],
    };
  })
  .sort((a, b) =>
    a.countryCode.localeCompare(b.countryCode) || a.name.localeCompare(b.name, 'en'),
  );

await writeFile(
  outputFile,
  `${JSON.stringify(
    {
      source: 'GeoNames cities500.txt',
      sourceUrl: 'https://download.geonames.org/export/dump/cities500.zip',
      license: 'CC BY 4.0',
      importedAt: new Date().toISOString(),
      populationThreshold: 250_000,
      locations,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(`Wrote ${locations.length} locations to ${outputFile}`);
