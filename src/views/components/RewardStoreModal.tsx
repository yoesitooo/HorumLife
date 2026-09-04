import React from 'react';
import type { Reward } from '../../models/core';
import { X, Coins } from 'lucide-react';

interface RewardStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: Reward[];
  userCoins: number;
  onPurchase: (rewardId: string) => void;
}

export const RewardStoreModal: React.FC<RewardStoreModalProps> = ({ 
  isOpen, onClose, rewards, userCoins, onPurchase 
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div className="glass-card" style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tienda de Recompensas</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={24} color="var(--text-primary)" />
          </button>
        </div>
        
        <div style={styles.balanceContainer}>
          <span style={styles.balanceText}>Tu saldo:</span>
          <div style={styles.coinBadge}>
            <Coins size={18} color="var(--accent-orange)" />
            <span style={styles.coinText}>{userCoins}</span>
          </div>
        </div>
        
        <div style={styles.rewardsList}>
          {rewards.map(reward => {
            const canAfford = userCoins >= reward.cost;
            return (
              <div key={reward.id} style={{
                ...styles.rewardItem,
                opacity: canAfford ? 1 : 0.5
              }}>
                <div style={styles.rewardIcon}>{reward.icon}</div>
                <div style={styles.rewardInfo}>
                  <h4 style={styles.rewardTitle}>{reward.title}</h4>
                  <div style={styles.rewardCost}>
                    <Coins size={12} color="var(--text-secondary)" />
                    <span>{reward.cost} Coins</span>
                  </div>
                </div>
                <button 
                  style={{
                    ...styles.buyBtn,
                    background: canAfford ? 'var(--accent-blue)' : 'var(--glass-border)',
                    color: canAfford ? '#fff' : 'var(--text-secondary)',
                  }}
                  disabled={!canAfford}
                  onClick={() => onPurchase(reward.id)}
                >
                  Canjear
                </button>
              </div>
            );
          })}
        </div>
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
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '400px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    borderRadius: '24px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--glass-highlight)',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  balanceText: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  coinBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(245, 158, 11, 0.1)',
    padding: '8px 16px',
    borderRadius: '12px',
  },
  coinText: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--accent-orange)',
    fontFamily: 'var(--font-mono)',
  },
  rewardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  rewardItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    gap: '16px',
  },
  rewardIcon: {
    fontSize: '24px',
  },
  rewardInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  rewardTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
  },
  rewardCost: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  buyBtn: {
    border: 'none',
    padding: '8px 16px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
