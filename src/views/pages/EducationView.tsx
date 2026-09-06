import React, { useEffect, useState } from 'react';
import { EducationService } from '../../kernel/services/EducationService';
import { LifeOSService } from '../../kernel/services/LifeOSService';
import type { Course, Assignment, StudySession } from '../../models/education';
import type { PlayerProfile } from '../../models/core';
import { AddCourseModal, AddAssignmentModal } from '../components/EducationModals';
import { Brain, Target, BookOpen, CheckCircle2, Plus, AlertCircle } from 'lucide-react';
import '../styles/design-tokens.css';

export const EducationView: React.FC = () => {
  const eduService = EducationService.getInstance();
  const lifeService = LifeOSService.getInstance();
  
  const [courses, setCourses] = useState<Course[]>(() => eduService.getCourses());
  const [assignments, setAssignments] = useState<Assignment[]>(() => eduService.getAssignments());
  const [, setSessions] = useState<StudySession[]>(() => eduService.getStudySessions());
  
  const [profile, setProfile] = useState<PlayerProfile>(() => lifeService.getPlayerProfile());

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssModalOpen, setIsAssModalOpen] = useState(false);

  useEffect(() => {
    const unsubEdu = eduService.subscribe((c, a, s) => {
      setCourses([...c]);
      setAssignments([...a]);
      setSessions([...s]);
    });
    
    const unsubLife = lifeService.subscribe((_, p) => {
      setProfile({ ...p });
    });
    
    return () => {
      unsubEdu();
      unsubLife();
    };
  }, [eduService, lifeService]);

  const handleCompleteAss = (id: string) => {
    eduService.completeAssignment(id);
  };

  const pendingAss = assignments.filter(a => a.status === 'pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Universidad</h1>
          <p style={styles.subtitle}>Comando Académico</p>
        </div>
      </header>

      {/* DASHBOARD */}
      <div style={styles.dashboardGrid}>
        <div style={styles.statCard}>
          <Brain size={24} color="var(--accent-blue)" style={{ marginBottom: '8px' }} />
          <div style={styles.statLabel}>Inteligencia (INT)</div>
          <div style={styles.statValue}>Nvl. {profile.skills.intelecto.level}</div>
          <div style={styles.progressBarBg}>
             <div style={{ ...styles.progressBarFill, width: `${Math.min((profile.skills.intelecto.xp / (profile.skills.intelecto.level * 100)) * 100, 100)}%`, backgroundColor: 'var(--accent-blue)' }} />
          </div>
        </div>
        <div style={styles.statCard}>
          <BookOpen size={24} color="var(--accent-green)" style={{ marginBottom: '8px' }} />
          <div style={styles.statLabel}>Materias Activas</div>
          <div style={styles.statValue}>{courses.length}</div>
        </div>
      </div>

      {/* QUESTS (Assignments) */}
      <section style={styles.section}>
        <div style={styles.sectionHeaderRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="var(--accent-purple)" />
            <h3 style={styles.sectionTitle}>Quests Pendientes</h3>
          </div>
          <button style={styles.addBtn} onClick={() => setIsAssModalOpen(true)}>
            <Plus size={16} color="var(--text-primary)" />
          </button>
        </div>

        {pendingAss.length === 0 ? (
          <div style={styles.emptyState}>
            <CheckCircle2 size={32} color="var(--accent-green)" style={{ marginBottom: '12px' }} />
            <p>¡Sin entregables!</p>
            <span style={styles.emptySub}>No tienes tareas pendientes.</span>
          </div>
        ) : (
          <div style={styles.list}>
            {pendingAss.map(ass => {
              const course = courses.find(c => c.id === ass.courseId);
              const isUrgent = new Date(ass.dueDate).getTime() - new Date().getTime() < 86400000; // < 24h
              return (
                <div key={ass.id} style={styles.assCard}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{...styles.courseDot, backgroundColor: course?.color || '#999'}} />
                    <div>
                      <div style={styles.assTitle}>{ass.title}</div>
                      <div style={styles.assSub}>{course?.name} • {ass.type}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{...styles.dateBadge, color: isUrgent ? 'var(--accent-red)' : 'var(--text-secondary)'}}>
                      {isUrgent && <AlertCircle size={14} style={{ marginRight: '4px' }} />}
                      {new Date(ass.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </div>
                    <button style={styles.checkBtn} onClick={() => handleCompleteAss(ass.id)}>
                      <CheckCircle2 size={24} color="var(--text-secondary)" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* COURSES */}
      <section style={styles.section}>
        <div style={styles.sectionHeaderRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--accent-green)" />
            <h3 style={styles.sectionTitle}>Tus Materias</h3>
          </div>
          <button style={styles.addBtn} onClick={() => setIsCourseModalOpen(true)}>
            <Plus size={16} color="var(--text-primary)" />
          </button>
        </div>

        {courses.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No tienes materias registradas.</p>
            <button style={{...styles.simButton, marginTop: '8px', color: 'var(--accent-green)', backgroundColor: 'rgba(48, 209, 88, 0.15)'}} onClick={() => setIsCourseModalOpen(true)}>+ Añadir Materia</button>
          </div>
        ) : (
          <div style={styles.courseGrid}>
            {courses.map(course => (
              <div key={course.id} style={{...styles.courseItem, borderLeft: `4px solid ${course.color}`}}>
                <div style={styles.courseName}>{course.name}</div>
                <div style={styles.courseCredits}>{course.credits} Créditos</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Spacer */}
      <div style={{height: '110px'}}></div>

      {/* Modals */}
      <AddCourseModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} />
      <AddAssignmentModal isOpen={isAssModalOpen} onClose={() => setIsAssModalOpen(false)} courses={courses} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 20px', height: '100%', overflowY: 'auto', boxSizing: 'border-box'
  },
  header: { marginBottom: '24px' },
  title: {
    fontSize: '32px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px',
    background: 'linear-gradient(90deg, #FFFFFF, var(--text-secondary))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  subtitle: { fontSize: '16px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 500 },
  
  dashboardGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px'
  },
  statCard: {
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column'
  },
  statLabel: { fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' },
  statValue: { fontSize: '24px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '12px' },
  progressBarBg: { height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },

  section: { marginTop: '32px' },
  sectionHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  addBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
  },
  
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  assCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: '16px', padding: '16px'
  },
  courseDot: { width: '12px', height: '12px', borderRadius: '50%' },
  assTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' },
  assSub: { fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' },
  dateBadge: { fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center' },
  checkBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 },
  
  courseGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  courseItem: {
    background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)',
    borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)',
    borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  courseName: { fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' },
  courseCredits: { fontSize: '14px', color: 'var(--text-secondary)' },

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '32px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px dashed var(--glass-border)',
    textAlign: 'center', color: 'var(--text-primary)', fontWeight: 500
  },
  emptySub: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' },
  simButton: {
    padding: '8px 12px', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
  },
};
