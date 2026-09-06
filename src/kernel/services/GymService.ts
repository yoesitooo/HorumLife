import { StorageService } from './StorageService';
import { LifeOSService } from './LifeOSService';
import type { WorkoutSession, Exercise } from '../../models/gym';
import { EXERCISE_DATABASE } from '../../data/exercises';

const GYM_STORAGE_KEY = 'horum_gym_sessions';

type Listener = (sessions: WorkoutSession[]) => void;

export class GymService {
  private static instance: GymService;
  private storage: StorageService;
  private lifeOsService: LifeOSService;
  private listeners: Listener[] = [];

  private constructor() {
    this.storage = StorageService.getInstance();
    this.lifeOsService = LifeOSService.getInstance();
  }

  public static getInstance(): GymService {
    if (!GymService.instance) {
      GymService.instance = new GymService();
    }
    return GymService.instance;
  }

  public getExercises(): Exercise[] {
    return EXERCISE_DATABASE;
  }

  public getExerciseById(id: string): Exercise | undefined {
    return EXERCISE_DATABASE.find(ex => ex.id === id);
  }

  public getSessions(): WorkoutSession[] {
    const data = this.storage.get<any[]>(GYM_STORAGE_KEY) || [];
    // Convert string dates back to Date objects
    return data.map(session => ({
      ...session,
      date: new Date(session.date)
    }));
  }

  public logWorkout(durationMinutes: number, logs: WorkoutSession['logs']) {
    const sessions = this.getSessions();
    
    // XP Calculation logic
    // Let's say 2 XP per minute + 5 XP per exercise log
    const xpEarned = (durationMinutes * 2) + (logs.length * 5);

    const newSession: WorkoutSession = {
      id: 'workout_' + Date.now(),
      date: new Date(),
      durationMinutes,
      logs,
      xpEarned
    };

    sessions.push(newSession);
    this.storage.set(GYM_STORAGE_KEY, sessions);
    
    // Add XP to Fuerza skill
    this.lifeOsService.addXP('fuerza', xpEarned);

    // Give coins for going to the gym (e.g., 5 coins per workout)
    this.lifeOsService.addCoins(5);

    this.notifyListeners();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.getSessions());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const sessions = this.getSessions();
    this.listeners.forEach(l => l(sessions));
  }
}
