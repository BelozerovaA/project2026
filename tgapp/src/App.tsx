import React, { useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import BottomNav, { type TabId } from './components/BottomNav';
import HomePage from './pages/HomePage';
import WorkoutsPage from './pages/WorkoutsPage';
import NutritionPage from './pages/NutritionPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { tg, colors } = useTelegram();
  const [activeTab, setActiveTab] = useState<TabId>('home');

  tg?.ready();

  const pages: Record<TabId, React.ReactNode> = {
    home: <HomePage />,
    workouts: <WorkoutsPage />,
    nutrition: <NutritionPage />,
    profile: <ProfilePage />,
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <main className="px-4 pt-4 pb-24">{pages[activeTab]}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;