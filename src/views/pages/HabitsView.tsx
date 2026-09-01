import React, { useEffect, useState } from 'react';
import { HabitService } from '../../kernel/services/HabitService';
import type { Habit } from '../../kernel/models/Habit';
import { HabitCard } from '../components/HabitCard';
import '../styles/design-tokens.css';

export const HabitsView: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const habitService = HabitService.getInstance();
  
  // Format today's date
  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Initial fetch
    setHabits(habitService.getHabits());

    // Subscribe to changes
    const unsubscribe = habitService.subscribe((updatedHabits) => {
      // Create a new array reference to trigger re-render
      setHabits([...updatedHabits]);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleHabit = (habitId: string) => {
    habitService.toggleHabitCompletion(habitId, todayDateStr);
  };

  // Very simple heatmap placeholder representation
  const renderHeatmap = () => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const blocks = [];
    
    // Naive heatmap generation for visual purpose
    for(let i=1; i<=daysInMonth; i++) {
      // Randomize slightly for the mockup, or just show empty
      const isToday = i === new Date().getDate();
      blocks.push(
        <div 
          key={i} 
          style={{
            ...styles.heatmapBlock,
            background: isToday ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
            boxShadow: isToday ? 'var(--glow-blue)' : 'none'
          }}
        />
      );
    }

    return (
      <div style={styles.heatmapContainer}>
        <h3 style={styles.sectionTitle}>Mapa de Calor (Mensual)</h3>
        <div style={styles.heatmapGrid}>
          {blocks}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <img src="/logo.jpg" alt="HorumLife Logo" style={styles.logo} />
        </div>
        <h1 style={styles.title}>Daily Status</h1>
        <p style={styles.subtitle}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      <section style={styles.listSection}>
        {habits.map(habit => (
          <HabitCard 
            key={habit.id}
            habit={habit}
            isCompleted={habit.completedDates.includes(todayDateStr)}
            onToggle={() => handleToggleHabit(habit.id)}
          />
        ))}
      </section>

      {renderHeatmap()}
      
      {/* Spacer for bottom navigation */}
      <div style={{height: '100px'}}></div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 20px',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  logoContainer: {
    marginBottom: '16px',
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-out), var(--glow-blue)'
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    margin: '0 0 8px 0',
    background: 'linear-gradient(90deg, #FFFFFF, #A0A0B0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: 0,
    textTransform: 'capitalize',
  },
  listSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: 'var(--text-secondary)',
  },
  heatmapContainer: {
    background: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-out)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
  },
  heatmapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  heatmapBlock: {
    aspectRatio: '1',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  }
};
