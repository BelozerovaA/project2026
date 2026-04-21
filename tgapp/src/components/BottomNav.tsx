import { useTelegram } from '../hooks/useTelegram';
import { Home, Dumbbell, Coffee, User } from 'lucide-react';

export type TabId = 'home' | 'workouts' | 'nutrition' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  {
    id: 'home',
    label: 'Главная',
    Icon: Home,
  },
  {
    id: 'workouts',
    label: 'Тренировки',
    Icon: Dumbbell, 
  },
  {
    id: 'nutrition',
    label: 'Питание',
    Icon: Coffee, 
  },
  {
    id: 'profile',
    label: 'Профиль',
    Icon: User,
  },
] as const;

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { colors } = useTelegram();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: colors.bg,
        borderTop: `1px solid ${colors.hint}20`,
      }}
    >
      <div
        className="flex items-center justify-around px-2 pt-2"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.Icon; // Достаем иконку из объекта

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id !== activeTab) onTabChange(tab.id);
              }}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-16 transition-all duration-200 active:scale-90"
              style={{
                color: active ? colors.button : colors.hint,
                backgroundColor: active ? `${colors.button}15` : 'transparent',
              }}
            >
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: colors.button }}
                />
              )}
              
              {/* Рендерим иконку */}
              <Icon size={24} strokeWidth={2} />

              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ opacity: active ? 1 : 0.7 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}