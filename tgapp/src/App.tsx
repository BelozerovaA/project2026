import React, { useState, useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import BottomNav, { type TabId } from './components/BottomNav';
import HomePage from './pages/HomePage';
import WorkoutsPage from './pages/WorkoutsPage';
import NutritionPage from './pages/NutritionPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { tg } = useTelegram();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  useEffect(() => {
    if (tg) {
      tg.ready();
      try {
        tg.setHeaderColor('#ffffff');
        tg.setBackgroundColor('#ffffff');
      } catch (error) {
        console.error('Ошибка установки цвета темы', error);
      }
    }
  }, [tg]);

  const pages: Record<TabId, React.ReactNode> = {
    home: <HomePage />,
    workouts: <WorkoutsPage />,
    nutrition: <NutritionPage />,
    profile: <ProfilePage />,
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
    >
      <main className="px-4 pt-4 pb-24">{pages[activeTab]}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;