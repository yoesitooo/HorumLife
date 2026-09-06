import React, { useState, useRef } from 'react';
import { LayoutDashboard, Wallet, GraduationCap, Dumbbell, BrainCircuit } from 'lucide-react';
import '../styles/design-tokens.css';

export type ViewType = 'habits' | 'finances' | 'university' | 'gym' | 'mentor';

interface BottomNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const TABS: { id: ViewType; label: string; icon: React.FC<any>; color: string }[] = [
  { id: 'habits', label: 'Life OS', icon: LayoutDashboard, color: 'var(--text-primary)' },
  { id: 'finances', label: 'Finanzas', icon: Wallet, color: 'var(--accent-green)' },
  { id: 'university', label: 'Estudio', icon: GraduationCap, color: 'var(--accent-blue)' },
  { id: 'gym', label: 'Gym', icon: Dumbbell, color: 'var(--accent-red)' },
  { id: 'mentor', label: 'Mentor IA', icon: BrainCircuit, color: 'var(--accent-orange)' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (index: number) => {
    setHoverIndex(index);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div 
      style={styles.navContainer} 
      className="ios-nav"
      ref={containerRef}
      onPointerLeave={handlePointerLeave}
    >
      {TABS.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        
        // Calculate magnification scale
        let scale = 1;
        let yOffset = 0;
        
        if (hoverIndex !== null) {
          const distance = Math.abs(hoverIndex - index);
          if (distance === 0) {
            scale = 1.3;
            yOffset = -12;
          } else if (distance === 1) {
            scale = 1.15;
            yOffset = -6;
          } else if (distance === 2) {
            scale = 1.05;
            yOffset = -2;
          }
        } else if (isActive) {
          scale = 1.1;
          yOffset = -4;
        }

        return (
          <button 
            key={tab.id}
            style={{
              ...styles.navButton,
              transform: `scale(${scale}) translateY(${yOffset}px)`,
              zIndex: hoverIndex === index ? 10 : isActive ? 5 : 1,
            }}
            onClick={() => onViewChange(tab.id)}
            onPointerEnter={() => handlePointerMove(index)}
            onTouchStart={() => handlePointerMove(index)}
            onTouchMove={(e) => {
              // Find element under touch
              if (!containerRef.current) return;
              const touch = e.touches[0];
              const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
              const button = elements.find(el => el.tagName === 'BUTTON');
              if (button && button.parentNode === containerRef.current) {
                const childIndex = Array.from(containerRef.current.children).indexOf(button);
                if (childIndex !== -1) setHoverIndex(childIndex);
              } else {
                setHoverIndex(null);
              }
            }}
            onTouchEnd={handlePointerLeave}
          >
            <div style={{
              ...styles.iconWrapper,
              backgroundColor: isActive || (hoverIndex === index) ? 'rgba(255,255,255,0.1)' : 'transparent',
              boxShadow: (hoverIndex === index) ? `0 8px 16px rgba(0,0,0,0.4), 0 0 12px ${tab.color}40` : 'none',
              border: (hoverIndex === index) ? `1px solid ${tab.color}80` : '1px solid transparent'
            }}>
              <Icon size={22} color={isActive || (hoverIndex === index) ? tab.color : 'var(--text-secondary)'} />
            </div>
            <span style={{
              ...styles.label,
              color: isActive || (hoverIndex === index) ? tab.color : 'var(--text-secondary)',
              opacity: (hoverIndex !== null && hoverIndex !== index) ? 0.5 : 1,
              transform: `scale(${1 / scale})` // counteract parent scale to keep text readable
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
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
    background: 'rgba(28, 28, 30, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom, 20px)',
    zIndex: 1000,
    touchAction: 'none' // Prevent scrolling while sliding over dock
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
    flex: 1,
    height: '100%',
    padding: '0 8px',
    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index 0s',
    WebkitTapHighlightColor: 'transparent',
  },
  iconWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  }
};
