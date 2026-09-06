import React, { useEffect, useState } from 'react';
import { LifeOSService } from '../../kernel/services/LifeOSService';
import { FinanceService } from '../../kernel/services/FinanceService';
import type { DailyLifeStatus, Chore, PlayerProfile, Quest, Reward } from '../../models/core';
import { LifeMetricCard } from '../components/LifeMetricCard';
import { RPGStatsCard } from '../components/RPGStatsCard';
import { RewardStoreModal } from '../components/RewardStoreModal';
import { Droplet, Dumbbell, Brain, CheckCircle2, Circle, Coins, Battery, Target, Star, CloudDownload, LogOut, Bell } from 'lucide-react';
import { StorageService } from '../../kernel/services/StorageService';
import { firebaseService } from '../../kernel/services/FirebaseService';
import { NotificationService } from '../../kernel/services/NotificationService';
import '../styles/design-tokens.css';



export const HabitsView: React.FC = () => {
  const lifeService = LifeOSService.getInstance();
  
  const [status, setStatus] = useState<DailyLifeStatus>(() => lifeService.getTodayStatus());
  const [profile, setProfile] = useState<PlayerProfile>(() => lifeService.getPlayerProfile());
  const [chores, setChores] = useState<Chore[]>(() => lifeService.getChores());
  const [quests, setQuests] = useState<Quest[]>(() => lifeService.getQuests());
  const [rewards] = useState<Reward[]>(() => lifeService.getRewards());
  const [weeklyHistory, setWeeklyHistory] = useState(() => lifeService.getWeeklyHistory());
  
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = lifeService.subscribe((newStatus, newProfile, newChores, newQuests) => {
      setStatus({ ...newStatus });
      setProfile({ ...newProfile });
      setChores([...newChores]);
      setQuests([...newQuests]);
      setWeeklyHistory(lifeService.getWeeklyHistory());
    });

    return () => unsubscribe();
  }, [lifeService]);

  const handleAddWater = () => {
    lifeService.updateTodayStatus({ waterGlasses: status.waterGlasses + 1 });
  };

  const handleAddDeepWork = () => {
    lifeService.updateTodayStatus({ deepWorkMinutes: status.deepWorkMinutes + 25 });
  };

  const handleCompleteChore = (choreId: string) => {
    lifeService.completeChore(choreId);
  };

  const handlePurchase = (rewardId: string) => {
    const success = lifeService.purchaseReward(rewardId);
    if (success) {
      if (rewardId === 'r4') {
        FinanceService.getInstance().addIRLPurchase(45000, 'Cine Colombia (IRL)', 'ocio');
      } else if (rewardId === 'r5') {
        FinanceService.getInstance().addIRLPurchase(15000, 'Starbucks (IRL)', 'ocio');
      }
    }
  };

  const handleMoodSelect = (mood: number) => {
    lifeService.updateMood(mood);
  };

  const isGymDisabled = status.gymTrainedMuscles.length > 0;
  
  const energyColor = status.energyLevel < 30 ? 'var(--accent-red)' : status.energyLevel < 70 ? 'var(--accent-orange)' : 'var(--accent-green)';
  const activeQuests = quests.filter(q => new Date(q.expiresAt).toDateString() === new Date().toDateString());

  const handleSyncFromCloud = async () => {
    await StorageService.getInstance().syncFromCloud();
  };

  const handleSignOut = async () => {
    await firebaseService.signOut();
  };

  const handleEnablePush = () => {
    NotificationService.getInstance().requestPermission();
  };

  return (
    <div style={styles.container}>
      
      {/* Top Bar: Level and Coins */}
      <div style={styles.topBar}>
        <div style={styles.levelBadge}>
          <Star size={16} color="var(--accent-orange)" fill="var(--accent-orange)" />
          <span style={styles.levelText}>Nv. {profile.skills.fuerza.level + profile.skills.intelecto.level + profile.skills.vitalidad.level + profile.skills.carisma.level - 3}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={styles.storeBtn} onClick={handleEnablePush} title="Activar Notificaciones Push">
            <Bell size={16} color="var(--accent-orange)" />
          </button>
          <button style={styles.storeBtn} onClick={handleSyncFromCloud} title="Sincronizar desde la Nube">
            <CloudDownload size={16} color="var(--accent-blue)" />
          </button>
          <button style={styles.storeBtn} onClick={() => setIsStoreOpen(true)}>
            <Coins size={16} color="var(--accent-orange)" />
            <span style={styles.coinsText}>{profile.horumCoins}</span>
          </button>
          <button style={styles.storeBtn} onClick={handleSignOut} title="Cerrar Sesión">
            <LogOut size={16} color="var(--accent-red)" />
          </button>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div style={styles.weeklyContainer}>
        {weeklyHistory.map((dayData, idx) => {
          const isToday = dayData.energy === null;
          const displayEnergy = isToday ? status.energyLevel : dayData.energy!;
          const dayColor = displayEnergy < 30 ? 'var(--accent-red)' : displayEnergy < 70 ? 'var(--accent-orange)' : 'var(--accent-green)';
          
          return (
            <div key={idx} style={styles.dayCol}>
              <div style={styles.dayDotContainer}>
                <div 
                  style={{
                    ...styles.dayDot, 
                    backgroundColor: dayColor,
                    opacity: isToday || dayData.energy ? 1 : 0.2,
                    boxShadow: isToday ? `0 0 10px ${dayColor}` : 'none',
                    border: isToday ? '2px solid white' : 'none'
                  }} 
                />
              </div>
              <span style={{...styles.dayLabel, color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)'}}>{dayData.day}</span>
            </div>
          );
        })}
      </div>

      <header style={styles.header}>
        <div style={styles.greetingSection}>
          <p style={styles.greeting}>Resumen Diario</p>
          <h1 style={styles.title}>Panel RPG</h1>
        </div>
        
        <div style={styles.scoreTextContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Battery size={28} color={energyColor} />
            <span style={{...styles.scoreValue, color: energyColor}}>{status.energyLevel}%</span>
          </div>
          <span style={styles.scoreLabel}>Energía Vital</span>
        </div>
      </header>

      {/* RPG Stats */}
      <RPGStatsCard skills={profile.skills} />

      {/* Grid of Square Widgets */}
      <section style={styles.metricsGrid}>
        <LifeMetricCard 
          title="Lectura (+15 XP)"
          value="Pendiente"
          currentValue={0}
          maxValue={1}
          icon={<Star size={28} color="var(--text-primary)" />}
          fillColor="var(--glass-highlight)"
          accentColor="var(--text-primary)"
          rewardLabel="+10 🪙"
          onClick={() => {
            lifeService.addXP('intelecto', 15);
            lifeService.addCoins(10);
            alert("¡Lectura registrada! +15 XP Intelecto");
          }}
        />

        <LifeMetricCard 
          title="Agua (+10 XP)"
          value={`${status.waterGlasses} / 8`}
          currentValue={status.waterGlasses}
          maxValue={8}
          icon={<Droplet size={28} color="var(--accent-blue)" />}
          fillColor="var(--accent-blue-glow)"
          accentColor="var(--accent-blue)"
          rewardLabel="+2 🪙"
          onClick={handleAddWater}
        />

        <LifeMetricCard 
          title="Deep Work (+15 XP)"
          value={`${status.deepWorkMinutes}m`}
          currentValue={status.deepWorkMinutes}
          maxValue={100}
          icon={<Brain size={28} color={status.hasFocusFailures ? 'var(--accent-red)' : 'var(--accent-green)'} />}
          fillColor="var(--accent-green-glow)"
          accentColor={status.hasFocusFailures ? 'var(--accent-red)' : 'var(--text-primary)'}
          rewardLabel="+5 🪙"
          onClick={handleAddDeepWork}
        />

        <LifeMetricCard 
          title="Gimnasio (+50 XP)"
          value={isGymDisabled ? "Listo" : "Pendiente"}
          currentValue={isGymDisabled ? 1 : 0}
          maxValue={1}
          icon={<Dumbbell size={28} color={isGymDisabled ? 'var(--accent-orange)' : 'var(--text-secondary)'} />}
          disabled={isGymDisabled}
          fillColor="rgba(245, 158, 11, 0.3)"
          accentColor={isGymDisabled ? 'var(--accent-orange)' : 'var(--text-primary)'}
          rewardLabel="+20 🪙"
          onClick={() => {
            if (!isGymDisabled) {
              lifeService.updateTodayStatus({ gymTrainedMuscles: ['Pecho'] });
            }
          }}
        />
      </section>

      {/* Dynamic Quests */}
      {activeQuests.length > 0 && (
        <section style={styles.choresSection}>
          <div style={styles.sectionHeader}>
            <Target size={20} color="var(--accent-orange)" />
            <h3 style={styles.sectionTitle}>Misiones Activas</h3>
          </div>
          <div style={styles.choresList}>
            {activeQuests.map(quest => (
              <div 
                key={quest.id} 
                style={{
                  ...styles.choreItem, 
                  opacity: quest.isCompleted ? 0.5 : 1,
                  background: quest.isCompleted ? 'var(--glass-border)' : 'rgba(245, 158, 11, 0.1)',
                  borderColor: 'var(--accent-orange)'
                }}
              >
                {quest.isCompleted ? (
                  <CheckCircle2 size={24} color="var(--accent-green)" />
                ) : (
                  <Target size={24} color="var(--accent-orange)" />
                )}
                <div style={{ flex: 1, marginLeft: '12px' }}>
                  <span style={{ 
                    ...styles.choreTitle, 
                    marginLeft: 0,
                    textDecoration: quest.isCompleted ? 'line-through' : 'none' 
                  }}>
                    {quest.title}
                  </span>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{quest.description}</p>
                </div>
                <div style={styles.questReward}>
                  <span>+{quest.rewardCoins} 🪙</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Chores Section */}
      <section style={styles.choresSection}>
        <h3 style={styles.sectionTitle}>Hábitos Rápidos</h3>
        <div style={styles.choresList}>
          {chores.map(chore => {
            const isCompletedToday = new Date(chore.lastCompletedAt).toDateString() === new Date().toDateString();
            return (
              <div 
                key={chore.choreId} 
                style={{
                  ...styles.choreItem, 
                  opacity: isCompletedToday ? 0.5 : 1,
                  background: isCompletedToday ? 'var(--glass-border)' : 'var(--glass-bg)'
                }}
                onClick={() => !isCompletedToday && handleCompleteChore(chore.choreId)}
              >
                {isCompletedToday ? (
                  <CheckCircle2 size={20} color="var(--accent-green)" />
                ) : (
                  <Circle size={20} color="var(--text-secondary)" />
                )}
                <span style={{ 
                  ...styles.choreTitle, 
                  flex: 1,
                  textDecoration: isCompletedToday ? 'line-through' : 'none' 
                }}>
                  {chore.title}
                </span>
                {!isCompletedToday && (
                  <span style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: 600 }}>
                    +{chore.rewardCoins} 🪙
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mood Tracker */}
      {!status.mood && (
        <section style={{...styles.choresSection, marginBottom: '20px'}}>
          <h3 style={{...styles.sectionTitle, textAlign: 'center'}}>¿Cómo te sientes hoy?</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star}
                style={styles.moodBtn}
                onClick={() => handleMoodSelect(star)}
              >
                <Star size={32} color="var(--text-secondary)" />
              </button>
            ))}
          </div>
        </section>
      )}
      {status.mood && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '32px' }}>
          Estado de ánimo registrado: {status.mood} ⭐
        </div>
      )}

      <RewardStoreModal 
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        rewards={rewards}
        userCoins={profile.horumCoins}
        onPurchase={handlePurchase}
      />

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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--glass-border)',
    padding: '6px 12px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
  },
  levelText: {
    fontSize: '14px',
    fontWeight: 600,
  },
  storeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid var(--accent-orange)',
    padding: '6px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
  },
  coinsText: {
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  weeklyContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '20px',
    padding: '12px 16px',
    marginBottom: '24px',
    border: '1px solid var(--glass-border)',
  },
  dayCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  dayDotContainer: {
    height: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  dayLabel: {
    fontSize: '11px',
    fontWeight: 600,
  },
  header: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 4px',
  },
  greetingSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  greeting: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: '0 0 4px 0',
    fontWeight: 500,
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
  scoreTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: '36px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    lineHeight: 1,
    transition: 'color 0.5s ease',
  },
  scoreLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '4px',
    fontWeight: 600,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  choresSection: {
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
  choresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  choreItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  choreTitle: {
    marginLeft: '12px',
    fontSize: '15px',
    fontWeight: 500,
  },
  questReward: {
    background: 'rgba(245, 158, 11, 0.2)',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--accent-orange)'
  },
  moodBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    transition: 'transform 0.2s',
  }
};
