export type MuscleGroup = 'pecho' | 'espalda' | 'piernas' | 'hombros' | 'brazos' | 'core' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

export interface WorkoutSet {
  reps: number;
  weight: number; // in kg or lbs
}

export interface WorkoutLog {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: Date;
  durationMinutes: number;
  logs: WorkoutLog[];
  xpEarned: number;
}
