import React from 'react';
import { LayoutDashboard, Wallet, GraduationCap, Dumbbell } from 'lucide-react';
import '../styles/design-tokens.css';

interface BottomNavigationProps {
  currentView: 'habits' | 'finances' | 'university' | 'gym';
  onViewChange: (view: 'habits' | 'finances' | 'university' | 'gym') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <div style={styles.navContainer} className="ios-nav">
      <button 
        style={currentView === 'habits' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
        onClick={() => onViewChange('habits')}
      >
        <LayoutDashboard size={24} color={currentView === 'habits' ? 'var(--text-primary)' : 'var(--text-secondary)'} />
        <span style={currentView === 'habits' ? { ...styles.label, color: 'var(--text-primary)' } : styles.label}>
          Life OS
        </span>
      </button>

      <button 
        style={currentView === 'finances' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
        onClick={() => onViewChange('finances')}
      >
        <Wallet size={24} color={currentView === 'finances' ? 'var(--accent-green)' : 'var(--text-secondary)'} />
        <span style={currentView === 'finances' ? { ...styles.label, color: 'var(--accent-green)' } : styles.label}>
          Finanzas
        </span>
      </button>

      <button 
        style={currentView === 'university' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
        onClick={() => onViewChange('university')}
      >
        <GraduationCap size={24} color={currentView === 'university' ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
        <span style={currentView === 'university' ? { ...styles.label, color: 'var(--accent-blue)' } : styles.label}>
          Universidad
        </span>
      </button>

      <button 
        style={currentView === 'gym' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
        onClick={() => onViewChange('gym')}
      >
        <Dumbbell size={24} color={currentView === 'gym' ? 'var(--accent-red)' : 'var(--text-secondary)'} />
        <span style={currentView === 'gym' ? { ...styles.label, color: 'var(--accent-red)' } : styles.label}>
          Gimnasio
        </span>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom, 20px)',
    zIndex: 1000,
  },
  navButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer',
    padding: '8px 16px',
    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
  activeButton: {
    transform: 'scale(1.05)',
  },
  label: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    letterSpacing: '0.2px',
  }
};
