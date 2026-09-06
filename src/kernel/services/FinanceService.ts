import type { BankTransaction, BudgetConfig, Subscription, FinanceEpicQuest } from '../../models/core';
import { StorageService } from './StorageService';
import { LifeOSService } from './LifeOSService';

const BUDGET_STORAGE_KEY = 'finance_budget';
const TRANSACTIONS_STORAGE_KEY = 'finance_transactions';
const SUBSCRIPTIONS_STORAGE_KEY = 'finance_subscriptions';
const QUESTS_STORAGE_KEY = 'finance_epic_quests';
const GOOGLE_APPS_SCRIPT_URL = ""; // PEGA AQUÍ TU URL DE LA APLICACIÓN WEB DE GOOGLE APPS SCRIPT

export class FinanceService {
  private static instance: FinanceService;
  private storage: StorageService;
  private lifeOS: LifeOSService;
  private listeners: ((budget: BudgetConfig, transactions: BankTransaction[], subscriptions: Subscription[], epicQuests: FinanceEpicQuest[]) => void)[] = [];

  private constructor() {
    this.storage = StorageService.getInstance();
    this.lifeOS = LifeOSService.getInstance();
    this.initializeDefaults();
  }

  public static getInstance(): FinanceService {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  private initializeDefaults() {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    // Budget
    const budgets = this.storage.get<Record<string, BudgetConfig>>(BUDGET_STORAGE_KEY) || {};
    if (!budgets[currentMonth]) {
      budgets[currentMonth] = {
        monthId: currentMonth,
        totalIncome: 1500000,
        targetSavings: 300000,
        currentSpend: 0,
        categoryLimits: {
          'ocio': 200000,
          'transporte': 150000,
          'delivery': 100000
        }
      };
      this.storage.set(BUDGET_STORAGE_KEY, budgets);
    }

    // Subscriptions
    const existingSubs = this.storage.get<Subscription[]>(SUBSCRIPTIONS_STORAGE_KEY);
    if (!existingSubs) {
      this.storage.set(SUBSCRIPTIONS_STORAGE_KEY, []);
    }

    // Epic Quests
    const existingQuests = this.storage.get<FinanceEpicQuest[]>(QUESTS_STORAGE_KEY);
    if (!existingQuests) {
      this.storage.set(QUESTS_STORAGE_KEY, []);
    }

    // Transactions (Start empty)
    const existingTx = this.storage.get<BankTransaction[]>(TRANSACTIONS_STORAGE_KEY);
    if (!existingTx) {
      this.storage.set(TRANSACTIONS_STORAGE_KEY, []);
    }
  }

  public subscribe(listener: (budget: BudgetConfig, transactions: BankTransaction[], subscriptions: Subscription[], epicQuests: FinanceEpicQuest[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const budget = this.getCurrentBudget();
    const transactions = this.getTransactions();
    const subscriptions = this.getSubscriptions();
    const epicQuests = this.getEpicQuests();
    this.listeners.forEach(listener => listener(budget, transactions, subscriptions, epicQuests));
  }

  public getCurrentBudget(): BudgetConfig {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const budgets = this.storage.get<Record<string, BudgetConfig>>(BUDGET_STORAGE_KEY) || {};
    return budgets[currentMonth]!;
  }

  public getTransactions(): BankTransaction[] {
    return this.storage.get<BankTransaction[]>(TRANSACTIONS_STORAGE_KEY) || [];
  }

  public getSubscriptions(): Subscription[] {
    return this.storage.get<Subscription[]>(SUBSCRIPTIONS_STORAGE_KEY) || [];
  }

  public getEpicQuests(): FinanceEpicQuest[] {
    return this.storage.get<FinanceEpicQuest[]>(QUESTS_STORAGE_KEY) || [];
  }

  public simulateIncomingTransaction(amount: number, merchant: string, category: BankTransaction['category']) {
    const txs = this.getTransactions();
    const newTx: BankTransaction = {
      id: 'tx_sim_' + Date.now(),
      amount,
      merchant,
      category,
      isAutoDetected: true,
      approvalStatus: 'pending',
      createdAt: new Date()
    };
    this.storage.set(TRANSACTIONS_STORAGE_KEY, [newTx, ...txs]);
    this.notifyListeners();
  }

  public approveTransaction(txId: string) {
    const txs = this.getTransactions();
    const txIndex = txs.findIndex(t => t.id === txId);
    
    if (txIndex >= 0 && txs[txIndex].approvalStatus === 'pending') {
      txs[txIndex].approvalStatus = 'approved';
      this.storage.set(TRANSACTIONS_STORAGE_KEY, txs);
      
      // Sync to Google Sheets
      this.syncToGoogleSheets(txs[txIndex]);
      
      // Update Budget
      const currentMonth = new Date().toISOString().substring(0, 7);
      const budgets = this.storage.get<Record<string, BudgetConfig>>(BUDGET_STORAGE_KEY) || {};
      const budget = budgets[currentMonth];
      if (budget) {
        budget.currentSpend += txs[txIndex].amount;
        this.storage.set(BUDGET_STORAGE_KEY, budgets);
      }
      
      // Gamification Reward or Penalty
      if (budget && budget.categoryLimits[txs[txIndex].category]) {
        // Find how much is spent in this category
        const categorySpend = txs.filter(t => t.category === txs[txIndex].category && t.approvalStatus === 'approved').reduce((sum, t) => sum + t.amount, 0);
        
        if (categorySpend > budget.categoryLimits[txs[txIndex].category]) {
          // Penalty: Took damage
          this.lifeOS.takeDamage(10);
        } else {
          // Normal reward
          this.lifeOS.addXP('intelecto', 10);
          this.lifeOS.addCoins(5);
        }
      } else {
        this.lifeOS.addXP('intelecto', 10);
        this.lifeOS.addCoins(5);
      }
      
      this.notifyListeners();
    }
  }

  public rejectTransaction(txId: string) {
    const txs = this.getTransactions();
    const updatedTxs = txs.filter(t => t.id !== txId);
    this.storage.set(TRANSACTIONS_STORAGE_KEY, updatedTxs);
    this.notifyListeners();
  }
  
  public addMoneyToEpicQuest(questId: string, amount: number) {
    const quests = this.getEpicQuests();
    const quest = quests.find(q => q.id === questId);
    if (quest) {
      quest.currentAmount += amount;
      if (quest.currentAmount >= quest.targetAmount) {
        // Complete Quest!
        this.lifeOS.addXP('intelecto', quest.rewardXp);
        this.lifeOS.addCoins(500); // Big reward
      }
      this.storage.set(QUESTS_STORAGE_KEY, quests);
      
      // We also should deduct this from budget theoretically or just add as a transaction, 
      // but for now we just track it.
      
      this.notifyListeners();
    }
  }

  public addIRLPurchase(amount: number, merchant: string, category: BankTransaction['category']) {
    const txs = this.getTransactions();
    const newTx: BankTransaction = {
      id: 'tx_irl_' + Date.now(),
      amount,
      merchant,
      category,
      isAutoDetected: false,
      approvalStatus: 'approved', // already approved because we used coins
      createdAt: new Date()
    };
    
    // Update budget directly without penalties since it was paid with Coins
    const currentMonth = new Date().toISOString().substring(0, 7);
    const budgets = this.storage.get<Record<string, BudgetConfig>>(BUDGET_STORAGE_KEY) || {};
    const budget = budgets[currentMonth];
    if (budget) {
      budget.currentSpend += amount;
      this.storage.set(BUDGET_STORAGE_KEY, budgets);
    }
    
    
    this.storage.set(TRANSACTIONS_STORAGE_KEY, [newTx, ...txs]);
    this.syncToGoogleSheets(newTx);
    this.notifyListeners();
  }

  private async syncToGoogleSheets(tx: BankTransaction) {
    if (!GOOGLE_APPS_SCRIPT_URL) return;
    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: tx.id,
          amount: tx.amount,
          description: tx.merchant,
          category: tx.category,
          type: 'expense',
          date: tx.createdAt
        })
      });
      console.log('Synchronized with Google Sheets');
    } catch (e) {
      console.error('Failed to sync to Google Sheets', e);
    }
  }

  // --- NEW METHODS FOR FORMS ---
  public addSubscription(name: string, cost: number, category: string, effect: 'buff' | 'debuff', xpBonus?: number) {
    const subs = this.getSubscriptions();
    const newSub: Subscription = {
      id: 'sub_' + Date.now(),
      name,
      cost,
      category,
      effect,
      xpBonus
    };
    this.storage.set(SUBSCRIPTIONS_STORAGE_KEY, [...subs, newSub]);
    this.notifyListeners();
  }

  public addEpicQuest(title: string, targetAmount: number, rewardXp: number) {
    const quests = this.getEpicQuests();
    const newQuest: FinanceEpicQuest = {
      id: 'fq_' + Date.now(),
      title,
      targetAmount,
      currentAmount: 0,
      rewardXp
    };
    this.storage.set(QUESTS_STORAGE_KEY, [...quests, newQuest]);
    this.notifyListeners();
  }

  public addManualTransaction(amount: number, merchant: string, category: BankTransaction['category']) {
    const txs = this.getTransactions();
    const newTx: BankTransaction = {
      id: 'tx_man_' + Date.now(),
      amount,
      merchant,
      category,
      isAutoDetected: false,
      approvalStatus: 'pending',
      createdAt: new Date()
    };
    this.storage.set(TRANSACTIONS_STORAGE_KEY, [newTx, ...txs]);
    this.notifyListeners();
  }

  public updateBudgetConfig(totalIncome: number, targetSavings: number, categoryLimits: Record<string, number>) {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const budgets = this.storage.get<Record<string, BudgetConfig>>(BUDGET_STORAGE_KEY) || {};
    
    if (budgets[currentMonth]) {
      budgets[currentMonth].totalIncome = totalIncome;
      budgets[currentMonth].targetSavings = targetSavings;
      budgets[currentMonth].categoryLimits = categoryLimits;
    } else {
      budgets[currentMonth] = {
        monthId: currentMonth,
        totalIncome,
        targetSavings,
        currentSpend: 0,
        categoryLimits
      };
    }
    
    this.storage.set(BUDGET_STORAGE_KEY, budgets);
    this.notifyListeners();
  }
}
