import { firebaseService } from './FirebaseService';

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Error reading from localStorage key: ${key}`, error);
      return null;
    }
  }

  public set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Fire and forget cloud sync
      firebaseService.syncDataToCloud(key, value).catch(console.error);
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Error writing to localStorage key: ${key}`, error);
    }
  }

  public async syncFromCloud(): Promise<void> {
    const keys = ['lifeos_profile', 'finance_data', 'gym_sessions', 'education_data'];
    for (const key of keys) {
      const data = await firebaseService.loadDataFromCloud(key);
      if (data) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
    // Reload to rehydrate all singleton services with new localStorage data
    window.location.reload();
  }

  public remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Error removing localStorage key: ${key}`, error);
    }
  }

  public clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error clearing localStorage', error);
    }
  }
}
