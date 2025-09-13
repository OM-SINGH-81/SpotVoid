import { CrimeData, PatrolHotspot } from './types';

export const policeStations = [
  { value: 'all', label: 'All Stations' },
  { value: 'Central', label: 'Central Station' },
  { value: 'Southern', label: 'Southern Station' },
  { value: 'Bayview', label: 'Bayview Station' },
  { value: 'Mission', label: 'Mission Station' },
  { value: 'Northern', label: 'Northern Station' },
];

export const crimeTypes = [
  { value: 'Theft', label: 'Theft' },
  { value: 'Accident', label: 'Accident' },
  { value: 'Harassment', label: 'Harassment' },
];

const SF_BOUNDS = {
  north: 37.81,
  south: 37.70,
  west: -122.52,
  east: -122.36,
};

const getRandomCoordinate = () => {
  const lat = Math.random() * (SF_BOUNDS.north - SF_BOUNDS.south) + SF_BOUNDS.south;
  const lng = Math.random() * (SF_BOUNDS.east - SF_BOUNDS.west) + SF_BOUNDS.west;
  return { lat, lng };
};

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const crimeData: CrimeData[] = Array.from({ length: 200 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // a date in the last 90 days
  const randomCrimeType = getRandomElement(crimeTypes);
  const randomStation = getRandomElement(policeStations.filter(p => p.value !== 'all'));
  
  return {
    id: `FIR${1000 + i}`,
    position: getRandomCoordinate(),
    crimeType: randomCrimeType.value,
    date: date.toISOString(),
    policeStation: randomStation.value,
  };
});

export const patrolHotspots: PatrolHotspot[] = Array.from({ length: 5 }, (_, i) => ({
  id: `HS${i + 1}`,
  name: `Hotspot ${i + 1}`,
  position: getRandomCoordinate(),
  order: i + 1,
}));
