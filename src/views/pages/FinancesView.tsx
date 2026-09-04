import React, { useEffect, useState } from 'react';
import { FinanceService } from '../../kernel/services/FinanceService';
import type { BudgetConfig, BankTransaction, Subscription, FinanceEpicQuest } from '../../models/core';
import { BudgetRingCard } from '../components/BudgetRingCard';
import { TransactionItem } from '../components/TransactionItem';
import { Inbox, CheckCircle2, Zap, Target, Smartphone } from 'lucide-react';
import '../styles/design-tokens.css';

export const FinancesView: React.FC = () => {
  const financeService = FinanceService.getInstance();
  
  const [budget, setBudget] = useState<BudgetConfig>(() => financeService.getCurrentBudget());
  const [transactions, setTransactions] = useState<BankTransaction[]>(() => financeService.getTransactions());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => financeService.getSubscriptions());
  const [epicQuests, setEpicQuests] = useState<FinanceEpicQuest[]>(() => financeService.getEpicQuests());

  useEffect(() => {
    const unsubscribe = financeService.subscribe((newBudget, newTxs, newSubs, newQuests) => {
      setBudget({ ...newBudget });
      setTransactions([...newTxs]);
      setSubscriptions([...newSubs]);
      setEpicQuests([...newQuests]);
    });
    return () => unsubscribe();
  }, [financeService]);

  const simulateSms = () => {
    financeService.simulateIncomingTransaction(
      Math.floor(Math.random() * 50000) + 10000, 
      ['Uber', 'Rappi', 'Cine Colombia', 'Starbucks'][Math.floor(Math.random() * 4)], 
      ['transporte', 'delivery', 'ocio'][Math.floor(Math.random() * 3)] as any
    );
  };

  const handleApprove = (id: string) => {
    financeService.approveTransaction(id);
  };

  const handleReject = (id: string) => {
    financeService.rejectTransaction(id);
  };

  const pendingTxs = transactions.filter(t => t.approvalStatus === 'pending');
  const approvedTxs = transactions.filter(t => t.approvalStatus === 'approved');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={styles.title}>Finanzas</h1>
            <p style={styles.subtitle}>Gestión Inteligente</p>
          </div>
          <button style={styles.simButton} onClick={simulateSms}>
            <Smartphone size={16} /> SMS
          </button>
        </div>
      </header>

      <BudgetRingCard budget={budget} />

      {epicQuests.length > 0 && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <Target size={20} color="var(--accent-purple)" />
            <h3 style={styles.sectionTitle}>Misión Épica</h3>
          </div>
          {epicQuests.map(quest => {
            const progress = (quest.currentAmount / quest.targetAmount) * 100;
            return (
              <div key={quest.id} style={styles.questCard}>
                <div style={styles.questHeader}>
                  <span style={styles.questTitle}>{quest.title}</span>
                  <span style={styles.questReward}>+{quest.rewardXp} XP</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div style={styles.questFooter}>
                  <span>${quest.currentAmount.toLocaleString()}</span>
                  <span>${quest.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {subscriptions.length > 0 && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <Zap size={20} color="var(--accent-blue)" />
            <h3 style={styles.sectionTitle}>Efectos Pasivos (Suscripciones)</h3>
          </div>
          <div style={styles.list}>
            {subscriptions.map(sub => (
              <div key={sub.id} style={styles.subItem}>
                <div>
                  <div style={styles.subName}>{sub.name}</div>
                  <div style={styles.subCost}>${sub.cost.toLocaleString()} / mes</div>
                </div>
                <div style={{
                  ...styles.subBadge,
                  backgroundColor: sub.effect === 'buff' ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 69, 58, 0.2)',
                  color: sub.effect === 'buff' ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {sub.effect === 'buff' ? `Buff (+${sub.xpBonus}XP)` : 'Debuff (Drena)'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <Inbox size={20} color="var(--accent-orange)" />
          <h3 style={styles.sectionTitle}>Bandeja de Entrada ({pendingTxs.length})</h3>
        </div>
        
        {pendingTxs.length === 0 ? (
          <div style={styles.emptyState}>
            <CheckCircle2 size={32} color="var(--accent-green)" style={{ marginBottom: '12px' }} />
            <p>¡Todo al día!</p>
            <span style={styles.emptySub}>No hay transacciones pendientes por revisar.</span>
          </div>
        ) : (
          <div style={styles.list}>
            {pendingTxs.map(tx => (
              <TransactionItem 
                key={tx.id} 
                transaction={tx} 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            ))}
          </div>
        )}
      </section>

      {approvedTxs.length > 0 && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <CheckCircle2 size={20} color="var(--accent-green)" />
            <h3 style={styles.sectionTitle}>Aprobadas Recientemente</h3>
          </div>
          <div style={styles.list}>
            {approvedTxs.slice().reverse().slice(0, 5).map(tx => ( // show last 5
              <TransactionItem 
                key={tx.id} 
                transaction={tx} 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Spacer for bottom navigation */}
      <div style={{height: '110px'}}></div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 20px',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
    WebkitOverflowScrolling: 'touch',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.5px',
    background: 'linear-gradient(90deg, #FFFFFF, var(--text-secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
    fontWeight: 500,
  },
  section: {
    marginTop: '32px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    color: 'var(--text-primary)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    background: 'var(--glass-bg)',
    borderRadius: '16px',
    border: '1px dashed var(--glass-border)',
    textAlign: 'center',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  emptySub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  simButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,159,10,0.15)',
    color: 'var(--accent-orange)',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  questCard: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '16px',
  },
  questHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  questTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  questReward: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--accent-purple)',
  },
  progressBarBg: {
    height: '12px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent-purple)',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  questFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  subItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  subName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  subCost: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  subBadge: {
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
  }
};
