import React, { useState } from 'react';
import { X, Plus, Trash2, Search, ChevronDown, Activity, Flame, Shield, Target } from 'lucide-react';
import { GymService } from '../../kernel/services/GymService';
import type { WorkoutLog } from '../../models/gym';
import '../styles/design-tokens.css';

interface LogWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({ isOpen, onClose }) => {
  const gymService = GymService.getInstance();
  const availableExercises = gymService.getExercises();

  const [duration, setDuration] = useState('60');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredExercises = availableExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = (exerciseId: string) => {
    if (logs.find(l => l.exerciseId === exerciseId)) return;
    setLogs([...logs, { exerciseId, sets: [{ reps: 10, weight: 0 }] }]);
    setIsSelectorOpen(false);
    setSearchQuery('');
  };

  const handleAddSet = (logIndex: number) => {
    const newLogs = [...logs];
    newLogs[logIndex].sets.push({ reps: 10, weight: 0 });
    setLogs(newLogs);
  };

  const handleRemoveSet = (logIndex: number, setIndex: number) => {
    const newLogs = [...logs];
    newLogs[logIndex].sets.splice(setIndex, 1);
    if (newLogs[logIndex].sets.length === 0) {
      newLogs.splice(logIndex, 1);
    }
    setLogs(newLogs);
  };

  const handleSetChange = (logIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    const newLogs = [...logs];
    newLogs[logIndex].sets[setIndex][field] = Number(value);
    setLogs(newLogs);
  };

  const isValid = () => {
    if (logs.length === 0) return false;
    for (const log of logs) {
      if (log.sets.length === 0) return false;
      for (const set of log.sets) {
        if (set.reps <= 0) return false;
        // weight can be 0 (bodyweight)
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    gymService.logWorkout(Number(duration), logs);
    setDuration('60');
    setLogs([]);
    onClose();
  };

  const getMuscleIcon = (muscle: string) => {
    switch(muscle) {
      case 'pecho': return <Shield size={16} color="var(--accent-blue)" />;
      case 'espalda': return <Activity size={16} color="var(--accent-green)" />;
      case 'piernas': return <Flame size={16} color="var(--accent-red)" />;
      default: return <Target size={16} color="var(--text-secondary)" />;
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Registrar Entrenamiento</h2>
          <button type="button" style={styles.closeButton} onClick={onClose}>
            <X size={24} color="var(--text-primary)" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Duración (minutos)</label>
            <input 
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={styles.input}
              required
              min="1"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Añadir Ejercicio</label>
            <div 
              style={styles.selectorTrigger}
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            >
              <span style={{ color: 'var(--text-primary)' }}>Seleccionar de la lista...</span>
              <ChevronDown size={20} color="var(--text-secondary)" />
            </div>

            {isSelectorOpen && (
              <div style={styles.selectorDropdown}>
                <div style={styles.searchBox}>
                  <Search size={16} color="var(--text-secondary)" />
                  <input 
                    type="text" 
                    placeholder="Buscar ejercicio..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <div style={styles.exerciseList}>
                  {filteredExercises.map(ex => (
                    <div 
                      key={ex.id} 
                      style={styles.exerciseListItem}
                      onClick={() => handleAddExercise(ex.id)}
                    >
                      <div style={styles.exerciseIconWrapper}>
                        {getMuscleIcon(ex.muscleGroup)}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{ex.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{ex.muscleGroup}</div>
                      </div>
                      <Plus size={18} color="var(--accent-blue)" style={{ marginLeft: 'auto' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log, lIdx) => {
              const exercise = gymService.getExerciseById(log.exerciseId);
              return (
                <div key={log.exerciseId} style={styles.exerciseCard}>
                  <div style={styles.exerciseHeader}>
                    {getMuscleIcon(exercise?.muscleGroup || '')}
                    {exercise?.name}
                  </div>
                  {log.sets.map((set, sIdx) => (
                    <div key={sIdx} style={styles.setRow}>
                      <span style={{ width: '40px', fontWeight: 600 }}>Set {sIdx + 1}</span>
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        onChange={(e) => handleSetChange(lIdx, sIdx, 'reps', e.target.value)}
                        style={styles.setRowInput}
                        placeholder="Reps"
                      /> <span style={{fontSize: '12px'}}>reps</span>
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        onChange={(e) => handleSetChange(lIdx, sIdx, 'weight', e.target.value)}
                        style={styles.setRowInput}
                        placeholder="Kg"
                      /> <span style={{fontSize: '12px'}}>kg</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSet(lIdx, sIdx)}
                        style={styles.removeSetButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => handleAddSet(lIdx)}
                    style={styles.addSetButton}
                  >
                    + Añadir Set
                  </button>
                </div>
              );
            })}
          </div>

          <button 
            type="submit" 
            style={{ 
              ...styles.submitButton, 
              opacity: isValid() ? 1 : 0.5,
              cursor: isValid() ? 'pointer' : 'not-allowed'
            }}
            disabled={!isValid()}
          >
            Guardar Entrenamiento
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '400px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    borderRadius: '24px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
  },
  title: { margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' },
  closeButton: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '12px',
    color: 'var(--text-primary)',
    fontSize: '15px',
    outline: 'none'
  },
  selectorTrigger: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer'
  },
  selectorDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0, right: 0,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    marginTop: '4px',
    zIndex: 10,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    maxHeight: '250px'
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px', borderBottom: '1px solid var(--glass-border)'
  },
  searchInput: {
    background: 'transparent', border: 'none', color: 'var(--text-primary)',
    outline: 'none', width: '100%', fontSize: '15px'
  },
  exerciseList: {
    overflowY: 'auto', display: 'flex', flexDirection: 'column'
  },
  exerciseListItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  exerciseIconWrapper: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  exerciseCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px', padding: '16px',
    border: '1px solid var(--glass-border)'
  },
  exerciseHeader: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)', fontSize: '15px'
  },
  setRow: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
    fontSize: '14px', color: 'var(--text-secondary)'
  },
  setRowInput: {
    width: '60px', 
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--glass-border)', 
    borderRadius: '8px',
    padding: '8px', color: 'var(--text-primary)', outline: 'none',
    fontSize: '14px', textAlign: 'center'
  },
  removeSetButton: {
    background: 'rgba(255, 59, 48, 0.1)', border: 'none', color: 'var(--accent-red)',
    cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginLeft: 'auto'
  },
  addSetButton: {
    background: 'rgba(10, 132, 255, 0.1)', border: 'none', color: 'var(--accent-blue)',
    cursor: 'pointer', fontSize: '14px', padding: '8px 12px', marginTop: '8px', borderRadius: '8px', fontWeight: 600,
    width: '100%'
  },
  submitButton: {
    background: 'var(--accent-red)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 700,
    marginTop: '12px',
    boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)',
    transition: 'opacity 0.2s'
  }
};
