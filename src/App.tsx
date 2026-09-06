import { useState, useEffect } from 'react';
import { BottomNavigation } from './views/components/BottomNavigation';
import { HabitsView } from './views/pages/HabitsView';
import { FinancesView } from './views/pages/FinancesView';
import { EducationView } from './views/pages/EducationView';
import { GymView } from './views/pages/GymView';
import { MentorView } from './views/pages/MentorView';
import { LoginScreen } from './views/pages/LoginScreen';
import { firebaseService } from './kernel/services/FirebaseService';
import type { User } from 'firebase/auth';
import './views/styles/design-tokens.css';

function App() {
  const [currentView, setCurrentView] = useState<'habits' | 'finances' | 'university' | 'gym' | 'mentor'>('habits');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
      }}>
        Cargando...
      </div>
    );
  }

  // If not logged in, show login screen — block access to the app
  if (!user) {
    return <LoginScreen />;
  }

  // Authenticated — render the app
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
      case 'mentor':
        return <MentorView />;
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
