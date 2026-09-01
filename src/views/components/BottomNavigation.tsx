import React from 'react';
import { Home, DollarSign, BookOpen } from 'lucide-react';
import '../styles/design-tokens.css';

interface BottomNavigationProps {
  currentView: 'habits' | 'finances' | 'university';
  onViewChange: (view: 'habits' | 'finances' | 'university') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <div style={styles.navContainer} className="glass">
      <button 
        style={currentView === 'habits' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
        onClick={() => onViewChange('habits')}
      >
        <Home size={24} color={currentView === 'habits' ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
        <span style={currentView === 'habits' ? { ...styles.label, color: 'var(--accent-blue)' } : styles.label}>
          Hábitos
        </span>
      </button>

      <button 
        style={currentView === 'finances' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
        onClick={() => onViewChange('finances')}
      >
        <DollarSign size={24} color={currentView === 'finances' ? 'var(--accent-green)' : 'var(--text-secondary)'} />
        <span style={currentView === 'finances' ? { ...styles.label, color: 'var(--accent-green)' } : styles.label}>
          Finanzas
        </span>
      </button>

      <button 
        style={currentView === 'university' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
        onClick={() => onViewChange('university')}
      >
        <BookOpen size={24} color={currentView === 'university' ? 'var(--accent-purple)' : 'var(--text-secondary)'} />
        <span style={currentView === 'university' ? { ...styles.label, color: 'var(--accent-purple)' } : styles.label}>
          Universidad
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
    height: '80px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom)',
    zIndex: 1000,
  },
  navButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: '8px 16px',
    transition: 'all 0.3s ease',
  },
  activeButton: {
    transform: 'translateY(-4px)',
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  }
};
