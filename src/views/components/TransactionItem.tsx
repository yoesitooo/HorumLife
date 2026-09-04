import React from 'react';
import type { BankTransaction } from '../../models/core';
import { ShoppingCart, Car, Coffee, Tv, Gamepad2, Check, X } from 'lucide-react';

interface TransactionItemProps {
  transaction: BankTransaction;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onApprove, onReject }) => {
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mercado': return <ShoppingCart size={20} color="var(--accent-blue)" />;
      case 'transporte': return <Car size={20} color="var(--accent-orange)" />;
      case 'delivery': return <Coffee size={20} color="var(--accent-red)" />;
      case 'suscripcion': return <Tv size={20} color="var(--accent-purple)" />;
      case 'ocio': return <Gamepad2 size={20} color="var(--accent-green)" />;
      default: return <ShoppingCart size={20} color="var(--text-secondary)" />;
    }
  };

  const isPending = transaction.approvalStatus === 'pending';

  return (
    <div style={{...styles.container, opacity: isPending ? 1 : 0.6}}>
      <div style={styles.iconBox}>
        {getCategoryIcon(transaction.category)}
      </div>
      
      <div style={styles.details}>
        <span style={styles.merchant}>{transaction.merchant}</span>
        <span style={styles.category}>{transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</span>
      </div>
      
      <div style={styles.amountBox}>
        <span style={styles.amount}>${transaction.amount.toLocaleString()}</span>
        {isPending ? (
          <div style={styles.actions}>
            <button style={styles.actionBtnReject} onClick={() => onReject(transaction.id)}>
              <X size={16} color="var(--accent-red)" />
            </button>
            <button style={styles.actionBtnApprove} onClick={() => onApprove(transaction.id)}>
              <Check size={16} color="var(--accent-green)" />
            </button>
          </div>
        ) : (
          <span style={styles.approvedText}>Aprobado</span>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '16px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    marginBottom: '12px',
    transition: 'all 0.3s ease',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'var(--glass-highlight)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
  },
  details: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  merchant: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  category: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  amountBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  amount: {
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtnReject: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  actionBtnApprove: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  approvedText: {
    fontSize: '11px',
    color: 'var(--accent-green)',
    fontWeight: 600,
  }
};
