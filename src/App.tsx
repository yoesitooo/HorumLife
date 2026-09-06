import { useState } from 'react';
import { BottomNavigation } from './views/components/BottomNavigation';
import { HabitsView } from './views/pages/HabitsView';
import { FinancesView } from './views/pages/FinancesView';
import { EducationView } from './views/pages/EducationView';
import { GymView } from './views/pages/GymView';
import './views/styles/design-tokens.css';

function App() {
  const [currentView, setCurrentView] = useState<'habits' | 'finances' | 'university' | 'gym'>('habits');

  // Simple router
  const renderView = () => {
    switch (currentView) {
      case 'habits':
        return <HabitsView />;
      case 'finances':
        return <FinancesView />;
      case 'university':
        return <EducationView />;
      case 'gym':
        return <GymView />;
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


export default App;
