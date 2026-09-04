import React, { useState } from 'react';
import { FinanceService } from '../../kernel/services/FinanceService';
import { X } from 'lucide-react';
import type { BankTransaction } from '../../models/core';

// Shared styles for modals
const modalStyles: Record<string, React.CSSProperties> = {
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: { margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' },
  closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '12px',
    color: 'var(--text-primary)',
    fontSize: '15px'
  },
  select: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '12px',
    color: 'var(--text-primary)',
    fontSize: '15px'
  },
  submitBtn: {
    background: 'var(--accent-blue)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px'
  }
};

// 1. Add Transaction Modal
export const AddTransactionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<BankTransaction['category']>('ocio');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FinanceService.getInstance().addManualTransaction(Number(amount), merchant, category);
    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Registrar Gasto</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}><X color="var(--text-primary)" /></button>
        </div>
        <form style={modalStyles.form} onSubmit={handleSubmit}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Comercio / Lugar</label>
            <input required style={modalStyles.input} value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Ej. Restaurante..." />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Valor ($)</label>
            <input required type="number" style={modalStyles.input} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Categoría</label>
            <select style={modalStyles.select} value={category} onChange={e => setCategory(e.target.value as any)}>
              <option value="mercado">Mercado</option>
              <option value="transporte">Transporte</option>
              <option value="delivery">Delivery</option>
              <option value="suscripcion">Suscripción</option>
              <option value="ocio">Ocio</option>
            </select>
          </div>
          <button type="submit" style={modalStyles.submitBtn}>Guardar Gasto</button>
        </form>
      </div>
    </div>
  );
};

// 2. Add Subscription Modal
export const AddSubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('suscripcion');
  const [effect, setEffect] = useState<'buff' | 'debuff'>('debuff');
  const [xpBonus, setXpBonus] = useState('0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FinanceService.getInstance().addSubscription(name, Number(cost), category, effect, Number(xpBonus));
    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Nueva Suscripción</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}><X color="var(--text-primary)" /></button>
        </div>
        <form style={modalStyles.form} onSubmit={handleSubmit}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Nombre</label>
            <input required style={modalStyles.input} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Costo Mensual ($)</label>
            <input required type="number" style={modalStyles.input} value={cost} onChange={e => setCost(e.target.value)} />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Efecto en Vida</label>
            <select style={modalStyles.select} value={effect} onChange={e => setEffect(e.target.value as any)}>
              <option value="debuff">Debuff (Drena sin beneficio)</option>
              <option value="buff">Buff (Aporta a mi crecimiento)</option>
            </select>
          </div>
          {effect === 'buff' && (
            <div style={modalStyles.inputGroup}>
              <label style={modalStyles.label}>XP Mensual Otorgada</label>
              <input type="number" style={modalStyles.input} value={xpBonus} onChange={e => setXpBonus(e.target.value)} />
            </div>
          )}
          <button type="submit" style={modalStyles.submitBtn}>Añadir Suscripción</button>
        </form>
      </div>
    </div>
  );
};

// 3. Add Epic Quest Modal
export const AddEpicQuestModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [rewardXp, setRewardXp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FinanceService.getInstance().addEpicQuest(title, Number(targetAmount), Number(rewardXp));
    onClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Nueva Misión Épica</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}><X color="var(--text-primary)" /></button>
        </div>
        <form style={modalStyles.form} onSubmit={handleSubmit}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Título de la Meta</label>
            <input required style={modalStyles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. PC Gamer, Viaje..." />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Monto Objetivo ($)</label>
            <input required type="number" style={modalStyles.input} value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Recompensa de XP</label>
            <input required type="number" style={modalStyles.input} value={rewardXp} onChange={e => setRewardXp(e.target.value)} />
          </div>
          <button type="submit" style={{...modalStyles.submitBtn, background: 'var(--accent-purple)'}}>Crear Misión</button>
        </form>
      </div>
    </div>
  );
};

// 4. Budget Settings Modal
export const BudgetSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; initialIncome: number; initialSavings: number; initialLimits: Record<string, number> }> = ({ isOpen, onClose, initialIncome, initialSavings, initialLimits }) => {
  const [income, setIncome] = useState(initialIncome.toString());
  const [savings, setSavings] = useState(initialSavings.toString());
  const [limits, setLimits] = useState(initialLimits || {});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FinanceService.getInstance().updateBudgetConfig(Number(income), Number(savings), limits);
    onClose();
  };

  const handleLimitChange = (cat: string, val: string) => {
    setLimits({ ...limits, [cat]: Number(val) });
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Configurar Presupuesto</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}><X color="var(--text-primary)" /></button>
        </div>
        <form style={modalStyles.form} onSubmit={handleSubmit}>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Ingresos Mensuales</label>
            <input required type="number" style={modalStyles.input} value={income} onChange={e => setIncome(e.target.value)} />
          </div>
          <div style={modalStyles.inputGroup}>
            <label style={modalStyles.label}>Meta de Ahorro Mensual</label>
            <input required type="number" style={modalStyles.input} value={savings} onChange={e => setSavings(e.target.value)} />
          </div>
          
          <h3 style={{...modalStyles.title, fontSize: '16px', marginTop: '12px'}}>Límites por Categoría</h3>
          {['ocio', 'transporte', 'delivery', 'mercado'].map(cat => (
            <div key={cat} style={{...modalStyles.inputGroup, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <label style={{...modalStyles.label, textTransform: 'capitalize'}}>{cat}</label>
              <input type="number" style={{...modalStyles.input, width: '120px', padding: '8px'}} value={limits[cat] || ''} onChange={e => handleLimitChange(cat, e.target.value)} />
            </div>
          ))}
          
          <button type="submit" style={modalStyles.submitBtn}>Guardar Ajustes</button>
        </form>
      </div>
    </div>
  );
};
