import React, { useState } from 'react';
import '../styles/design-tokens.css';

interface LifeMetricCardProps {
  title: string;
  value: string; // The formatted string to display (e.g., "3 / 8")
  currentValue: number;
  maxValue: number;
  icon: React.ReactNode;
  accentColor?: string;
  fillColor?: string;
  rewardLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const LifeMetricCard: React.FC<LifeMetricCardProps> = ({ 
  title, 
  value, 
  currentValue,
  maxValue,
  icon, 
  accentColor = 'var(--text-primary)', 
  fillColor = 'var(--glass-highlight)',
  rewardLabel,
  onClick,
  disabled = false
}) => {
  const [isPushed, setIsPushed] = useState(false);
  const [feedbacks, setFeedbacks] = useState<{id: number}[]>([]);

  const handlePointerDown = () => {
    if (disabled) return;
    setIsPushed(true);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handlePointerUp = () => {
    if (disabled) return;
    setIsPushed(false);
    
    // Add floating feedback animation
    const newId = Date.now();
    setFeedbacks(prev => [...prev, { id: newId }]);
    
    // Remove it after animation completes
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== newId));
    }, 1000);

    if (onClick) onClick();
  };

  const handlePointerLeave = () => {
    if (disabled) return;
    setIsPushed(false);
  };

  const fillPercentage = Math.min(100, Math.max(0, (currentValue / maxValue) * 100));

  return (
    <div 
      className={`glass-card ${isPushed ? 'pushed' : ''}`}
      style={{
        ...styles.card, 
        opacity: disabled ? 0.6 : 1
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Liquid Fill Background */}
      <div 
        style={{
          ...styles.fillBackground,
          height: `${fillPercentage}%`,
          backgroundColor: fillColor,
        }}
      />

      {/* Content */}
      <div style={styles.contentContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={styles.iconContainer}>
            {icon}
          </div>
          {rewardLabel && (
            <div style={styles.rewardBadge}>
              {rewardLabel}
            </div>
          )}
        </div>
        <div style={styles.infoContainer}>
          <span style={{...styles.value, color: accentColor}} className="mono-text">
            {value}
          </span>
          <h3 style={styles.title}>{title}</h3>
        </div>
      </div>
      
      {/* Floating feedback animations */}
      {feedbacks.map(f => (
        <div key={f.id} className="floating-feedback" style={{ color: accentColor }}>
          {rewardLabel || '+1'}
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    aspectRatio: '1 / 1', // Force square
  },
  fillBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    transition: 'height 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
    zIndex: 0,
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1, // Stay above the fill
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    borderRadius: '16px',
    width: 'fit-content',
    backdropFilter: 'blur(4px)',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'flex-start',
  },
  title: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    letterSpacing: '0.2px',
  },
  value: {
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    lineHeight: 1,
  },
  rewardBadge: {
    background: 'var(--glass-border)',
    backdropFilter: 'blur(4px)',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }
};
