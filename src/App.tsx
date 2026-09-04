import React, { useState } from 'react';
import { BottomNavigation } from './views/components/BottomNavigation';
import { HabitsView } from './views/pages/HabitsView';
import { FinancesView } from './views/pages/FinancesView';
import { EducationView } from './views/pages/EducationView';
import './views/styles/design-tokens.css';

function App() {
  const [currentView, setCurrentView] = useState<'habits' | 'finances' | 'university'>('habits');

  // Simple router
  const renderView = () => {
    switch (currentView) {
      case 'habits':
        return <HabitsView />;
      case 'finances':
        return <FinancesView />;
      case 'university':
        return <EducationView />;
      default:
        return <HabitsView />;
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {renderView()}
      </main>
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
