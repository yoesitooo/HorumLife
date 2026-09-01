export interface Habit {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  category: 'health' | 'learning' | 'home' | 'other';
  streak: number;
  completedDates: string[]; // ISO string dates e.g. "2026-08-31"
  createdAt: string;
}

// Initial habits requested in the PRD (Tomar agua, Leer, Dormir a tiempo)
export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit_water',
    name: 'Tomar Agua',
    category: 'health',
    streak: 0,
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_read',
    name: 'Leer',
    category: 'learning',
    streak: 0,
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_sleep',
    name: 'Dormir a Tiempo',
    category: 'health',
    streak: 0,
    completedDates: [],
    createdAt: new Date().toISOString(),
  }
];
