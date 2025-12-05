export interface CargoItem {
  destinations: string[];
  volumeCbm: number | null;
  unitCount: number | null;
  poDate?: string;
  notes?: string;
}

export interface ParsedMessage {
  date: string;
  origin: string;
  items: CargoItem[];
  safetyNote?: string;
}
