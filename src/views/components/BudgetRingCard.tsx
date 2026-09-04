import React from 'react';
import type { BudgetConfig } from '../../models/core';

interface BudgetRingCardProps {
  budget: BudgetConfig;
}

export const BudgetRingCard: React.FC<BudgetRingCardProps> = ({ budget }) => {
  const { totalIncome, targetSavings, currentSpend } = budget;
  
  // Calculate max spendable before eating into savings
  const spendable = totalIncome - targetSavings;
  const progressPercent = Math.min(100, Math.max(0, (currentSpend / spendable) * 100));
  
  // Determine color based on progress
  let ringColor = 'var(--accent-green)'; // Good
  if (progressPercent > 75) ringColor = 'var(--accent-orange)'; // Warning
  if (progressPercent >= 100) ringColor = 'var(--accent-red)'; // Bad

  return (
    <div className="glass-card" style={styles.container}>
      <h3 style={styles.title}>Presupuesto de este Mes</h3>
      
      <div style={styles.ringWrapper}>
        <svg viewBox="0 0 100 100" style={styles.svgRing}>
          {/* Background Ring */}
          <circle 
            cx="50" cy="50" r="40" 
            fill="transparent" 
            stroke="var(--glass-border)" 
            strokeWidth="8" 
          />
          {/* Progress Ring */}
          <circle 
            cx="50" cy="50" r="40" 
            fill="transparent" 
            stroke={ringColor} 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeDasharray="251.2" // 2 * pi * r (40)
            strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
            style={styles.progressCircle}
          />
        </svg>
        
        <div style={styles.ringCenterText}>
          <span style={styles.spendText}>${currentSpend.toLocaleString()}</span>
          <span style={styles.totalText}>de ${spendable.toLocaleString()}</span>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCol}>
          <span style={styles.statLabel}>Ingresos</span>
          <span style={styles.statValue}>${totalIncome.toLocaleString()}</span>
        </div>
        <div style={styles.statCol}>
          <span style={styles.statLabel}>Meta de Ahorro</span>
          <span style={styles.statValue}>${targetSavings.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    alignSelf: 'flex-start',
  },
  ringWrapper: {
    position: 'relative',
    width: '180px',
    height: '180px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
  },
  svgRing: {
    transform: 'rotate(-90deg)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressCircle: {
    transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease',
  },
  ringCenterText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  spendText: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  },
  totalText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: '16px',
    borderTop: '1px solid var(--glass-border)',
  },
  statCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  },
};
