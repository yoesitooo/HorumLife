import React, { useState } from 'react';
import { firebaseService } from '../../kernel/services/FirebaseService';
import '../styles/design-tokens.css';

export const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const user = await firebaseService.signInWithGoogle();
    if (!user) {
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.logoArea}>
          <div style={styles.logoCircle}>
            <span style={styles.logoEmoji}>⚔️</span>
          </div>
          <h1 style={styles.title}>HorumLife</h1>
          <p style={styles.subtitle}>Tu Life OS Personal</p>
        </div>

        {/* Features */}
        <div style={styles.features}>
          <div style={styles.featureRow}>
            <span>🛡️</span>
            <span style={styles.featureText}>Datos encriptados y privados</span>
          </div>
          <div style={styles.featureRow}>
            <span>☁️</span>
            <span style={styles.featureText}>Sincronización en la nube</span>
          </div>
          <div style={styles.featureRow}>
            <span>📱</span>
            <span style={styles.featureText}>Accede desde cualquier dispositivo</span>
          </div>
        </div>

        {/* Login Button */}
        <button
          style={{
            ...styles.googleButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{loading ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.disclaimer}>
          Solo tú puedes ver tus datos. Usamos Firebase Auth de Google.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1025 50%, #0f1a2e 100%)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '40px 28px',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
  },
  logoArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  logoCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(147,51,234,0.3))',
    border: '2px solid rgba(239,68,68,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  logoEmoji: {
    fontSize: '32px',
  },
  title: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: 0,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    padding: '16px 0',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
  },
  featureText: {
    color: 'rgba(255,255,255,0.7)',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '14px 24px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    margin: 0,
    textAlign: 'center' as const,
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '11px',
    textAlign: 'center' as const,
    margin: 0,
    lineHeight: 1.4,
  },
};
