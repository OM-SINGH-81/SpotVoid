export type Position = {
  lat: number;
  lng: number;
};

export type CrimeData = {
  id: string;
  position: Position;
  crimeType: 'Theft' | 'Accident' | 'Harassment' | string;
  date: string;
  policeStation: string;
};

export type PoliceStation = {
  value: string;
  label: string;
};

export type CrimeType = {
  value: string;
  label: string;
};

export type PatrolHotspot = {
    id: string;
    name: string;
    position: Position;
    order: number;
}
