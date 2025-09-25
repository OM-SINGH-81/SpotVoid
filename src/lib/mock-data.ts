import { CrimeData, PatrolHotspot } from './types';

// Seeded random number generator for deterministic data
function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

let seededRandom = createSeededRandom(1);

export const policeStations = [
  { value: 'all', label: 'All Stations' },
  { value: 'Connaught Place', label: 'Connaught Place' },
  { value: 'Karol Bagh', label: 'Karol Bagh' },
  { value: 'Chandni Chowk', label: 'Chandni Chowk' },
  { value: 'Vasant Kunj', label: 'Vasant Kunj' },
  { value: 'Hauz Khas', label: 'Hauz Khas' },
];

export const crimeTypes = [
  { value: 'Theft', label: 'Theft' },
  { value: 'Accident', label: 'Accident' },
  { value: 'Harassment', label: 'Harassment' },
];

const DELHI_BOUNDS = {
  north: 28.88,
  south: 28.40,
  west: 76.84,
  east: 77.24,
};

const getRandomCoordinate = () => {
  const lat = seededRandom() * (DELHI_BOUNDS.north - DELHI_BOUNDS.south) + DELHI_BOUNDS.south;
  const lng = seededRandom() * (DELHI_BOUNDS.east - DELHI_BOUNDS.west) + DELHI_BOUNDS.west;
  return { lat, lng };
};

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(seededRandom() * arr.length)];

export const crimeData: CrimeData[] = Array.from({ length: 200 }, (_, i) => {
  const date = new Date(); 
  date.setDate(date.getDate() - Math.floor(seededRandom() * 90)); // a date in the last 90 days
  date.setHours(Math.floor(seededRandom() * 24)); // Random hour
  date.setMinutes(Math.floor(seededRandom() * 60)); // Random minute
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
