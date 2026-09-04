import React, { useState } from 'react';
import { EducationService } from '../../kernel/services/EducationService';
import { X } from 'lucide-react';
import type { Course, AssignmentType } from '../../models/education';

// Reusing modal styles
const modalStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 2000, padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: '400px', maxHeight: '90vh',
    display: 'flex', flexDirection: 'column', padding: '24px',
    borderRadius: '24px', background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)', overflowY: 'auto',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
    borderRadius: '12px', padding: '12px', color: 'var(--text-primary)', fontSize: '15px'
  },
  submitBtn: {
    background: 'var(--accent-blue)', color: 'white', border: 'none',
    borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 700,
    cursor: 'pointer', marginTop: '8px'
  }
};

export const AddCourseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [color, setColor] = useState('#30D158'); // default green

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    EducationService.getInstance().addCourse(name, Number(credits), color);
    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Nuevo Curso</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}><X color="var(--text-primary)" /></button>
        </div>
        <form style={modalStyles.form} onSubmit={handleSubmit}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Nombre de la Materia</label>
            <input required style={modalStyles.input} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Créditos</label>
            <input required type="number" style={modalStyles.input} value={credits} onChange={e => setCredits(e.target.value)} />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Color</label>
            <input type="color" style={{...modalStyles.input, height: '50px', padding: '4px'}} value={color} onChange={e => setColor(e.target.value)} />
          </div>
          <button type="submit" style={modalStyles.submitBtn}>Guardar Curso</button>
        </form>
      </div>
    </div>
  );
};

export const AddAssignmentModal: React.FC<{ isOpen: boolean; onClose: () => void; courses: Course[] }> = ({ isOpen, onClose, courses }) => {
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [type, setType] = useState<AssignmentType>('tarea');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      alert("Primero debes crear un curso!");
      return;
    }
    EducationService.getInstance().addAssignment(courseId, title, type, new Date(dueDate));
    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Nuevo Quest (Entregable)</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}><X color="var(--text-primary)" /></button>
        </div>
        <form style={modalStyles.form} onSubmit={handleSubmit}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Título</label>
            <input required style={modalStyles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Ensayo final" />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Curso</label>
            <select required style={modalStyles.input as any} value={courseId} onChange={e => setCourseId(e.target.value)}>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Tipo</label>
            <select required style={modalStyles.input as any} value={type} onChange={e => setType(e.target.value as any)}>
              <option value="tarea">Tarea</option>
              <option value="proyecto">Proyecto</option>
              <option value="examen">Examen</option>
              <option value="lectura">Lectura</option>
            </select>
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Fecha Límite</label>
            <input required type="datetime-local" style={modalStyles.input} value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <button type="submit" style={{...modalStyles.submitBtn, background: 'var(--accent-purple)'}}>Crear Quest</button>
        </form>
      </div>
    </div>
  );
};
