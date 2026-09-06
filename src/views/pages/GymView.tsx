import React, { useEffect, useState } from 'react';
import { GymService } from '../../kernel/services/GymService';
import { LifeOSService } from '../../kernel/services/LifeOSService';
import type { WorkoutSession } from '../../models/gym';
import type { PlayerProfile } from '../../models/core';
import { Dumbbell, Calendar, Flame, Activity, Shield, TrendingUp } from 'lucide-react';
import { LogWorkoutModal } from '../components/GymModals';
import '../styles/design-tokens.css';

export const GymView: React.FC = () => {
  const gymService = GymService.getInstance();
  const lifeService = LifeOSService.getInstance();

  const [sessions, setSessions] = useState<WorkoutSession[]>(() => gymService.getSessions());
  const [profile, setProfile] = useState<PlayerProfile>(() => lifeService.getPlayerProfile());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubGym = gymService.subscribe((s) => setSessions([...s]));
    const unsubLife = lifeService.subscribe((_, p) => setProfile({ ...p }));
    return () => {
      unsubGym();
      unsubLife();
    };
  }, [gymService, lifeService]);

  const strengthStat = profile.skills.fuerza;

  // PR Calculation
  const prs = { bench: 0, squat: 0, deadlift: 0 };
  sessions.forEach(s => {
    s.logs.forEach(l => {
      const maxWeight = Math.max(...l.sets.map(set => set.weight || 0));
      if (l.exerciseId === 'bench-press' && maxWeight > prs.bench) prs.bench = maxWeight;
      if (l.exerciseId === 'squat' && maxWeight > prs.squat) prs.squat = maxWeight;
      if (l.exerciseId === 'deadlift' && maxWeight > prs.deadlift) prs.deadlift = maxWeight;
    });
  });

  // Chart calculation (last 14 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chartDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    const session = sessions.find(s => {
      const sDate = new Date(s.date);
      return sDate.getDate() === d.getDate() && sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
    });
    
    const val = session ? session.logs.length : 0;
    chartDays.push({ date: d, value: val, isToday: i === 0, hasSession: !!session });
  }

  const maxVal = Math.max(...chartDays.map(d => d.value), 1);
  const chartWidth = 300;
  const chartHeight = 80;
  const chartPadding = 10;
  
  const chartPoints = chartDays.map((day, i) => {
    const x = (i / (chartDays.length - 1)) * chartWidth;
    const y = chartHeight - (day.value / maxVal) * (chartHeight - chartPadding*2) - chartPadding;
    return { x, y, ...day };
  });

  const generateSmoothPath = (pts: typeof chartPoints) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const pathD = generateSmoothPath(chartPoints);
  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div style={styles.container} className="ios-scroll">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gimnasio</h1>
          <p style={styles.subtitle}>Forja tu Fuerza</p>
        </div>
        <button style={styles.logButton} onClick={() => setIsModalOpen(true)}>
          <Dumbbell size={20} />
          <span>Registrar</span>
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Flame size={24} color="var(--accent-red)" style={{ marginBottom: '8px' }} />
          <div style={styles.statLabel}>Fuerza (STR)</div>
          <div style={styles.statValue}>Nvl. {strengthStat.level}</div>
          <div style={styles.progressBarBg}>
             <div style={{ ...styles.progressBarFill, width: `${Math.min((strengthStat.xp / (strengthStat.level * 100)) * 100, 100)}%`, backgroundColor: 'var(--accent-red)' }} />
          </div>
        </div>
        
        <div style={styles.statCard}>
          <Activity size={24} color="var(--accent-green)" style={{ marginBottom: '8px' }} />
          <div style={styles.statLabel}>Entrenamientos</div>
          <div style={styles.statValue}>{sessions.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Total registrados
          </div>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Récords Personales (PRs)</h2>
      <div style={styles.prGrid}>
        <div style={styles.prCard}>
          <div style={styles.prIcon}><Shield size={20} color="var(--accent-blue)" /></div>
          <div style={styles.prInfo}>
            <div style={styles.prTitle}>Press Banca</div>
            <div style={styles.prValue}>{prs.bench} <span style={styles.prUnit}>kg</span></div>
          </div>
        </div>
        <div style={styles.prCard}>
          <div style={styles.prIcon}><TrendingUp size={20} color="var(--accent-blue)" /></div>
          <div style={styles.prInfo}>
            <div style={styles.prTitle}>Sentadilla</div>
            <div style={styles.prValue}>{prs.squat} <span style={styles.prUnit}>kg</span></div>
          </div>
        </div>
        <div style={styles.prCard}>
          <div style={styles.prIcon}><Flame size={20} color="var(--accent-red)" /></div>
          <div style={styles.prInfo}>
            <div style={styles.prTitle}>Peso Muerto</div>
            <div style={styles.prValue}>{prs.deadlift} <span style={styles.prUnit}>kg</span></div>
          </div>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Actividad (Últimos 14 días)</h2>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100px', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#chartGradient)" />
          <path d={pathD} fill="none" stroke="var(--accent-green)" strokeWidth="3" strokeLinecap="round" />
          
          {chartPoints.map((p, i) => (
            p.hasSession && (
              <circle 
                key={i} 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                fill="#1C1C1E" 
                stroke="var(--accent-green)" 
                strokeWidth="2" 
              />
            )
          ))}
          {/* Today indicator if no session */}
          {!chartPoints[chartPoints.length-1].hasSession && (
            <circle 
              cx={chartPoints[chartPoints.length-1].x} 
              cy={chartPoints[chartPoints.length-1].y} 
              r="3" 
              fill="rgba(255,255,255,0.3)" 
            />
          )}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
          <span>{chartDays[0].date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
          <span>Hoy</span>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Historial</h2>
      
      {sessions.length === 0 ? (
        <div style={styles.emptyState}>
          <Calendar size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p>Aún no has registrado entrenamientos.</p>
        </div>
      ) : (
        <div style={styles.historyList}>
          {sessions.slice().reverse().map(session => (
            <div key={session.id} style={styles.sessionCard}>
              <div style={styles.sessionHeader}>
                <div style={styles.sessionDate}>
                  {session.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div style={styles.sessionXp}>+{session.xpEarned} XP</div>
              </div>
              <div style={styles.sessionDetails}>
                <ClockIcon /> {session.durationMinutes} min • {session.logs.length} ejercicios
              </div>
              <div style={styles.exercisesList}>
                {session.logs.map((log, idx) => {
                  const ex = gymService.getExerciseById(log.exerciseId);
                  return (
                    <div key={idx} style={styles.exerciseItem}>
                      <span style={{ color: 'var(--text-primary)' }}>{ex?.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {log.sets.length} sets
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <LogWorkoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <div style={{ height: '100px' }} />
    </div>
  );
};

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    height: '100%',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    margin: '0 0 4px 0',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  logButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--accent-red)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '24px',
    padding: '20px',
    border: '1px solid var(--border-color)',
  },
  statLabel: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '3px',
    marginTop: '12px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sessionCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid var(--border-color)',
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sessionDate: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    textTransform: 'capitalize',
  },
  sessionXp: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--accent-red)',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  sessionDetails: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
  },
  exercisesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  exerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
  },

  prGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '32px'
  },
  prCard: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px'
  },
  prIcon: {
    width: '40px', height: '40px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  prInfo: {
    display: 'flex', flexDirection: 'column', gap: '2px'
  },
  prTitle: {
    fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500
  },
  prValue: {
    fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)'
  },
  prUnit: {
    fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)'
  },
  heatmapContainer: {
    display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '32px', alignItems: 'center'
  },
  heatmapBlock: {
    width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0
  }
};
