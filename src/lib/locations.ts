import locationData from '../data/locations.json';

export type Location = {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population: number;
  timeZone: string;
};

export const locations = locationData.locations as Location[];

export const countryName = (countryCode: string) =>
  new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode.toUpperCase()) ?? countryCode.toUpperCase();

export const locationsForCountry = (countryCode: string) =>
  locations.filter((location) => location.countryCode === countryCode.toLowerCase());

export const countries = [...new Set(locations.map((location) => location.countryCode))]
  .map((countryCode) => ({
    code: countryCode,
    name: countryName(countryCode),
    cityCount: locationsForCountry(countryCode).length,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));
