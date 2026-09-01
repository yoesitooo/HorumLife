import React from 'react';
import type { Habit } from '../../kernel/models/Habit';
import { Droplet, Book, Moon } from 'lucide-react';
import '../styles/design-tokens.css';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, onToggle }) => {
  // Select icon based on habit id for now
  const getIcon = () => {
    switch (habit.id) {
      case 'habit_water': return <Droplet size={28} color={isCompleted ? 'var(--accent-blue)' : 'var(--text-secondary)'} />;
      case 'habit_read': return <Book size={28} color={isCompleted ? 'var(--accent-purple)' : 'var(--text-secondary)'} />;
      case 'habit_sleep': return <Moon size={28} color={isCompleted ? 'var(--accent-green)' : 'var(--text-secondary)'} />;
      default: return <Droplet size={28} color="var(--text-secondary)" />;
    }
  };

  // Select glow class based on habit
  const getGlowClass = () => {
    if (!isCompleted) return '';
    switch (habit.id) {
      case 'habit_water': return 'glow-border-blue';
      case 'habit_read': return 'glow-border-purple';
      case 'habit_sleep': return 'glow-border-green';
      default: return 'glow-border-blue';
    }
  };

  return (
    <div 
      className={`clay-card ${getGlowClass()}`} 
      style={styles.card}
      onClick={onToggle}
    >
      <div style={styles.iconContainer}>
        {getIcon()}
      </div>
      <div style={styles.infoContainer}>
        <h3 style={{...styles.title, color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)'}}>
          {habit.name}
        </h3>
        <div style={styles.streakContainer}>
          <span style={styles.streakNumber} className="mono-text">🔥 {habit.streak}</span>
          <span style={styles.streakLabel}>días</span>
        </div>
      </div>
      <div style={styles.checkboxContainer}>
        <div style={{
          ...styles.checkbox,
          backgroundColor: isCompleted ? getCheckboxColor(habit.id) : 'transparent',
          borderColor: isCompleted ? getCheckboxColor(habit.id) : 'var(--text-secondary)'
        }}>
          {isCompleted && (
            <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{width: '14px', height: '14px'}}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

const getCheckboxColor = (id: string) => {
  switch(id) {
    case 'habit_water': return 'var(--accent-blue)';
    case 'habit_read': return 'var(--accent-purple)';
    case 'habit_sleep': return 'var(--accent-green)';
    default: return 'var(--accent-blue)';
  }
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    margin: '16px 0',
    cursor: 'pointer',
    userSelect: 'none',
  },
  iconContainer: {
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
  },
  infoContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    transition: 'color 0.3s ease',
  },
  streakContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  streakNumber: {
    color: '#FFA500', /* Orange fire */
    fontSize: '14px',
    fontWeight: 'bold',
  },
  streakLabel: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
  },
  checkboxContainer: {
    marginLeft: '16px',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  }
};
