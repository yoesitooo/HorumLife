import React, { useState } from 'react';
import { BottomNavigation } from './views/components/BottomNavigation';
import { HabitsView } from './views/pages/HabitsView';
import './views/styles/design-tokens.css';

function App() {
  const [currentView, setCurrentView] = useState<'habits' | 'finances' | 'university'>('habits');

  // Simple router
  const renderView = () => {
    switch (currentView) {
      case 'habits':
        return <HabitsView />;
      case 'finances':
        return <div style={styles.placeholder}><h2>Finanzas</h2><p>Fase 3: Próximamente</p></div>;
      case 'university':
        return <div style={styles.placeholder}><h2>Universidad</h2><p>Fase 4: Próximamente</p></div>;
      default:
        return <HabitsView />;
    }
  };

  return (
    <div style={styles.appContainer}>
      <main style={styles.mainContent}>
        {renderView()}
      </main>
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-main)',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    position: 'relative',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-secondary)'
  }
};

export default App;
