import type { Habit } from '../models/Habit';
import { DEFAULT_HABITS } from '../models/Habit';
import { StorageService } from './StorageService';

const HABITS_STORAGE_KEY = 'horumlife_habits';

export class HabitService {
  private static instance: HabitService;
  private storage: StorageService;
  // Use a simple observable pattern so React views can subscribe to changes
  private listeners: ((habits: Habit[]) => void)[] = [];

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): HabitService {
    if (!HabitService.instance) {
      HabitService.instance = new HabitService();
    }
    return HabitService.instance;
  }

  public subscribe(listener: (habits: Habit[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(habits: Habit[]) {
    this.listeners.forEach(listener => listener(habits));
  }

  public getHabits(): Habit[] {
    const stored = this.storage.get<Habit[]>(HABITS_STORAGE_KEY);
    if (!stored || stored.length === 0) {
      this.saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    return stored;
  }

  private saveHabits(habits: Habit[]) {
    this.storage.set(HABITS_STORAGE_KEY, habits);
    this.notifyListeners(habits);
  }

  public toggleHabitCompletion(habitId: string, date: string): void {
    const habits = this.getHabits();
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;

    const habit = habits[habitIndex];
    const isCompleted = habit.completedDates.includes(date);

    if (isCompleted) {
      habit.completedDates = habit.completedDates.filter(d => d !== date);
    } else {
      habit.completedDates.push(date);
    }

    // Recalculate streak naively (count of consecutive days ending today or yesterday)
    habit.streak = this.calculateStreak(habit.completedDates);

    this.saveHabits(habits);
  }

  private calculateStreak(completedDates: string[]): number {
    if (completedDates.length === 0) return 0;
    
    // Sort dates in descending order
    const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if the most recent completion is today or yesterday
    const mostRecent = new Date(sorted[0]);
    mostRecent.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - mostRecent.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays > 1) {
      return 0; // Streak lost
    }

    // Count backwards
    let dateToCheck = mostRecent;
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i]);
      d.setHours(0, 0, 0, 0);
      
      if (d.getTime() === dateToCheck.getTime()) {
        streak++;
        // Go back one day
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
