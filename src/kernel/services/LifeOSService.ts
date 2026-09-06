import type { DailyLifeStatus, Chore, PlayerProfile, Reward, Quest } from '../../models/core';
import { StorageService } from './StorageService';

const STATUS_STORAGE_KEY = 'lifeos_daily_status';
const CHORES_STORAGE_KEY = 'lifeos_chores';
const PROFILE_STORAGE_KEY = 'lifeos_profile';
const REWARDS_STORAGE_KEY = 'lifeos_rewards';
const QUESTS_STORAGE_KEY = 'lifeos_quests';

export class LifeOSService {
  private static instance: LifeOSService;
  private storage: StorageService;
  private listeners: ((status: DailyLifeStatus, profile: PlayerProfile, chores: Chore[], quests: Quest[]) => void)[] = [];

  private constructor() {
    this.storage = StorageService.getInstance();
    this.initializeDefaults();
  }

  public static getInstance(): LifeOSService {
    if (!LifeOSService.instance) {
      LifeOSService.instance = new LifeOSService();
    }
    return LifeOSService.instance;
  }

  private initializeDefaults() {
    // Chores
    const existingChores = this.storage.get<Chore[]>(CHORES_STORAGE_KEY);
    if (!existingChores || existingChores.length === 0) {
      const defaultChores: Chore[] = [
        { choreId: 'c1', title: 'Leer 10 páginas', decayIntervalDays: 1, lastCompletedAt: new Date(0), rewardCoins: 10 },
        { choreId: 'c2', title: 'Estiramiento 15m', decayIntervalDays: 1, lastCompletedAt: new Date(0), rewardCoins: 15 },
        { choreId: 'c3', title: 'Planear semana', decayIntervalDays: 7, lastCompletedAt: new Date(0), rewardCoins: 50 },
        { choreId: 'c4', title: 'Meditar 10m', decayIntervalDays: 1, lastCompletedAt: new Date(0), rewardCoins: 15 },
        { choreId: 'c5', title: 'Revisar Finanzas', decayIntervalDays: 2, lastCompletedAt: new Date(0), rewardCoins: 20 },
      ];
      this.storage.set(CHORES_STORAGE_KEY, defaultChores);
    }

    // Profile
    const existingProfile = this.storage.get<PlayerProfile>(PROFILE_STORAGE_KEY);
    if (!existingProfile) {
      const defaultProfile: PlayerProfile = {
        horumCoins: 100,
        streakFreezes: 1,
        skills: {
          fuerza: { level: 1, xp: 0 },
          intelecto: { level: 1, xp: 0 },
          vitalidad: { level: 1, xp: 0 },
          carisma: { level: 1, xp: 0 },
        }
      };
      this.storage.set(PROFILE_STORAGE_KEY, defaultProfile);
    }

    // Rewards
    const existingRewards = this.storage.get<Reward[]>(REWARDS_STORAGE_KEY);
    if (!existingRewards || existingRewards.length === 0) {
      const defaultRewards: Reward[] = [
        { id: 'r1', title: '1h Videojuegos', cost: 150, icon: '🎮' },
        { id: 'r2', title: 'Comida trampa', cost: 500, icon: '🍔' },
        { id: 'r3', title: 'Comprar un libro', cost: 1000, icon: '📚' },
        { id: 'r4', title: 'Ticket: Cine IRL', cost: 200, icon: '🍿' },
        { id: 'r5', title: 'Ticket: Café IRL', cost: 50, icon: '☕' },
      ];
      this.storage.set(REWARDS_STORAGE_KEY, defaultRewards);
    }
    
    // Check Daily Quests
    this.generateDailyQuests();
  }

  public subscribe(listener: (status: DailyLifeStatus, profile: PlayerProfile, chores: Chore[], quests: Quest[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const status = this.getTodayStatus();
    const profile = this.getPlayerProfile();
    const chores = this.getChores();
    const quests = this.getQuests();
    this.listeners.forEach(listener => listener(status, profile, chores, quests));
  }

  // --- STATUS & ENERGY ---
  public getTodayStatus(): DailyLifeStatus {
    const todayId = new Date().toISOString().split('T')[0];
    const allStatuses = this.storage.get<Record<string, DailyLifeStatus>>(STATUS_STORAGE_KEY) || {};

    if (!allStatuses[todayId]) {
      allStatuses[todayId] = {
        dateId: todayId,
        stepsCount: 0,
        waterGlasses: 0,
        gymTrainedMuscles: [],
        deepWorkMinutes: 0,
        hasFocusFailures: false,
        energyLevel: 100, // Start with 100 energy
      };
      this.storage.set(STATUS_STORAGE_KEY, allStatuses);
    }
    return allStatuses[todayId];
  }

  public getWeeklyHistory(): { day: string, energy: number | null }[] {
    const history = [];
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const allStatuses = this.storage.get<Record<string, DailyLifeStatus>>(STATUS_STORAGE_KEY) || {};
    
    // We want the last 7 days ending with today.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateId = d.toISOString().split('T')[0];
      const dayStr = days[d.getDay()];
      
      if (i === 0) {
        history.push({ day: dayStr, energy: null }); // Today is dynamic
      } else {
        const status = allStatuses[dateId];
        history.push({ day: dayStr, energy: status ? status.energyLevel : 0 });
      }
    }
    
    return history;
  }

  public updateTodayStatus(updates: Partial<DailyLifeStatus>): void {
    const todayId = new Date().toISOString().split('T')[0];
    const allStatuses = this.storage.get<Record<string, DailyLifeStatus>>(STATUS_STORAGE_KEY) || {};
    
    const current = this.getTodayStatus();
    
    // Calculate Energy and Rewards based on changes
    let energyChange = 0;
    
    if (updates.waterGlasses !== undefined && updates.waterGlasses > current.waterGlasses) {
      energyChange += 5; // Hydration gives energy
      this.addXP('vitalidad', 10);
      this.addCoins(2);
    }
    if (updates.gymTrainedMuscles !== undefined && updates.gymTrainedMuscles.length > current.gymTrainedMuscles.length) {
      energyChange -= 30; // Gym costs energy
      this.addXP('fuerza', 50);
      this.addCoins(20);
    }
    if (updates.deepWorkMinutes !== undefined && updates.deepWorkMinutes > current.deepWorkMinutes) {
      energyChange -= 10; // Deep work costs energy
      this.addXP('intelecto', 15);
      this.addCoins(5);
    }
    
    const newEnergy = Math.max(0, Math.min(100, current.energyLevel + energyChange));
    
    const updated = { ...current, ...updates, energyLevel: updates.energyLevel !== undefined ? updates.energyLevel : newEnergy };
    
    allStatuses[todayId] = updated;
    this.storage.set(STATUS_STORAGE_KEY, allStatuses);
    
    this.checkQuestCompletions(updated);
    this.notifyListeners();
  }

  public updateMood(mood: number): void {
    this.updateTodayStatus({ mood });
    this.addXP('vitalidad', 5);
  }

  public takeDamage(amount: number): void {
    const current = this.getTodayStatus();
    const newEnergy = Math.max(0, current.energyLevel - amount);
    this.updateTodayStatus({ energyLevel: newEnergy });
    this.notifyListeners();
  }

  // --- RPG PROFILE ---
  public getPlayerProfile(): PlayerProfile {
    return this.storage.get<PlayerProfile>(PROFILE_STORAGE_KEY)!;
  }

  private updateProfile(updates: Partial<PlayerProfile>) {
    const current = this.getPlayerProfile();
    this.storage.set(PROFILE_STORAGE_KEY, { ...current, ...updates });
  }

  public addCoins(amount: number) {
    const profile = this.getPlayerProfile();
    this.updateProfile({ horumCoins: profile.horumCoins + amount });
  }

  public addXP(skill: keyof PlayerProfile['skills'], amount: number) {
    const profile = this.getPlayerProfile();
    const currentSkill = profile.skills[skill];
    
    let newXp = currentSkill.xp + amount;
    let newLevel = currentSkill.level;
    
    const xpNeeded = newLevel * 100;
    
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
      this.addCoins(50); // Level up bonus
    }
    
    profile.skills[skill] = { level: newLevel, xp: newXp };
    this.updateProfile({ skills: profile.skills });
  }

  // --- CHORES ---
  public getChores(): Chore[] {
    return this.storage.get<Chore[]>(CHORES_STORAGE_KEY) || [];
  }

  public completeChore(choreId: string): void {
    const chores = this.getChores();
    const chore = chores.find(c => c.choreId === choreId);
    if (!chore) return;
    
    const updatedChores = chores.map(c => 
      c.choreId === choreId ? { ...c, lastCompletedAt: new Date() } : c
    );
    this.storage.set(CHORES_STORAGE_KEY, updatedChores);
    
    this.addCoins(chore.rewardCoins);
    this.addXP('carisma', 5); // Base completion xp
    this.notifyListeners();
  }

  // --- REWARDS ---
  public getRewards(): Reward[] {
    return this.storage.get<Reward[]>(REWARDS_STORAGE_KEY) || [];
  }

  public purchaseReward(rewardId: string): boolean {
    const rewards = this.getRewards();
    const reward = rewards.find(r => r.id === rewardId);
    const profile = this.getPlayerProfile();
    
    if (reward && profile.horumCoins >= reward.cost) {
      this.updateProfile({ horumCoins: profile.horumCoins - reward.cost });
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // --- QUESTS ---
  public getQuests(): Quest[] {
    const quests = this.storage.get<Quest[]>(QUESTS_STORAGE_KEY) || [];
    // Filter expired ones if needed
    return quests;
  }

  private generateDailyQuests() {
    const quests = this.getQuests();
    // Basic logic: if no quests generated today, create a random one
    const activeQuests = quests.filter(q => !q.isCompleted && new Date(q.expiresAt).getTime() > Date.now());
    
    if (activeQuests.length === 0) {
      const expirationDaily = new Date();
      expirationDaily.setHours(23, 59, 59);
      
      const newDailyQuest: Quest = {
        id: 'q_daily_' + Date.now(),
        title: 'Misión Diaria: Hidratación',
        description: 'Bebe los 8 vasos de agua requeridos hoy.',
        rewardCoins: 50,
        rewardXp: { skill: 'vitalidad', amount: 20 },
        isCompleted: false,
        expiresAt: expirationDaily
      };

      const expirationWeekly = new Date();
      expirationWeekly.setDate(expirationWeekly.getDate() + 7);
      expirationWeekly.setHours(23, 59, 59);

      const newWeeklyQuest: Quest = {
        id: 'q_weekly_' + Date.now(),
        title: 'Misión Semanal: Ultra Enfoque',
        description: 'Acumula más de 120 minutos de Deep Work en un solo día.',
        rewardCoins: 200,
        rewardXp: { skill: 'intelecto', amount: 100 },
        isCompleted: false,
        expiresAt: expirationWeekly
      };
      
      this.storage.set(QUESTS_STORAGE_KEY, [...quests.filter(q => q.isCompleted === false), newDailyQuest, newWeeklyQuest]);
    }
  }

  private checkQuestCompletions(status: DailyLifeStatus) {
    const quests = this.getQuests();
    let updated = false;
    
    quests.forEach(q => {
      if (!q.isCompleted && new Date(q.expiresAt).getTime() > Date.now()) {
        if (q.title.includes('Hidratación') && status.waterGlasses >= 8) {
          q.isCompleted = true;
          this.addCoins(q.rewardCoins);
          this.addXP(q.rewardXp.skill, q.rewardXp.amount);
          updated = true;
        }
        if (q.title.includes('Ultra Enfoque') && status.deepWorkMinutes >= 120) {
          q.isCompleted = true;
          this.addCoins(q.rewardCoins);
          this.addXP(q.rewardXp.skill, q.rewardXp.amount);
          updated = true;
        }
      }
    });
    
    if (updated) {
      this.storage.set(QUESTS_STORAGE_KEY, quests);
    }
  }
}
