import React from 'react';
import type { PlayerProfile } from '../../models/core';

interface RPGStatsCardProps {
  skills: PlayerProfile['skills'];
}

export const RPGStatsCard: React.FC<RPGStatsCardProps> = ({ skills }) => {
  
  const renderSkill = (name: string, stat: { level: number; xp: number }, icon: string, color: string) => {
    const xpNeeded = stat.level * 100;
    const progress = Math.min(100, Math.max(0, (stat.xp / xpNeeded) * 100));
    
    return (
      <div style={styles.skillRow} key={name}>
        <div style={styles.skillHeader}>
          <div style={styles.skillIconName}>
            <span>{icon}</span>
            <span style={styles.skillName}>{name}</span>
          </div>
          <span style={styles.skillLevel}>Lv. {stat.level}</span>
        </div>
        
        <div style={styles.progressBarBg}>
          <div 
            style={{
              ...styles.progressBarFill,
              width: `${progress}%`,
              backgroundColor: color,
            }} 
          />
        </div>
        <div style={styles.xpText}>{stat.xp} / {xpNeeded} XP</div>
      </div>
    );
  };

  return (
    <div className="glass-card" style={styles.container}>
      <h3 style={styles.title}>Atributos RPG</h3>
      <div style={styles.skillsGrid}>
        {renderSkill('Fuerza', skills.fuerza, '💪', 'var(--accent-orange)')}
        {renderSkill('Intelecto', skills.intelecto, '🧠', 'var(--accent-blue)')}
        {renderSkill('Vitalidad', skills.vitalidad, '🌿', 'var(--accent-green)')}
        {renderSkill('Carisma', skills.carisma, '💬', 'var(--accent-purple)')}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  skillRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  skillHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillIconName: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  skillName: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  skillLevel: {
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
  },
  progressBarBg: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease-out',
  },
  xpText: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
  }
};
