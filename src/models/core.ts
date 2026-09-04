/* ARCHIVO: src/models/core.ts */

// 1. Módulo Financiero (Auto-Tracking)
export interface BankTransaction {
  id: string; 
  amount: number;
  merchant: string;
  category: 'mercado' | 'transporte' | 'delivery' | 'suscripcion' | 'ocio';
  isAutoDetected: boolean;
  approvalStatus: 'pending' | 'approved';
  createdAt: Date; // As specified in PRD
}

export interface BudgetConfig {
  monthId: string; // "YYYY-MM"
  totalIncome: number;
  targetSavings: number; // 300000 - 500000
  currentSpend: number;
  categoryLimits: Record<string, number>; // e.g. { 'ocio': 100000 }
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  category: string;
  effect: 'buff' | 'debuff';
  xpBonus?: number; // Only for buff
}

export interface FinanceEpicQuest {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  rewardXp: number;
}

// 2. Módulo Académico (Ingeniería de Sistemas)
export interface AcademicCourse {
  courseId: string;
  title: string;
  credits: number;
  appleColorTag: string; // "systemBlue", "systemOrange"
  scheduleBlocks: Array<{
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6;
    startTime: string; // "10:00"
    durationMinutes: number;
    room: string;
  }>;
}

// 3. Sistema de Hábitos y "Life Status" (RPG Gamificado)
export interface DailyLifeStatus {
  dateId: string; // "YYYY-MM-DD"
  stepsCount: number;
  waterGlasses: number;
  gymTrainedMuscles: string[];
  deepWorkMinutes: number;
  hasFocusFailures: boolean;
  mood?: number; // 1 to 5 stars
  energyLevel: number; // 0 to 100
}

export interface Chore {
  choreId: string;
  title: string;
  decayIntervalDays: number;
  lastCompletedAt: Date;
  rewardCoins: number;
}

// 4. Modelos RPG
export interface SkillStat {
  level: number;
  xp: number; // XP to next level could be based on formula (e.g. 100 * level)
}

export interface PlayerProfile {
  horumCoins: number;
  streakFreezes: number;
  skills: {
    fuerza: SkillStat; // Gym, Steps
    intelecto: SkillStat; // Deep work
    vitalidad: SkillStat; // Water, Sleep, Mood
    carisma: SkillStat; // Social
  };
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: { skill: 'fuerza' | 'intelecto' | 'vitalidad' | 'carisma'; amount: number };
  isCompleted: boolean;
  expiresAt: Date;
}
