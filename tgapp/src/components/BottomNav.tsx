import { useTelegram } from '../hooks/useTelegram';

export type TabId = 'home' | 'workouts' | 'nutrition' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; svg: string }[] = [
  {
    id: 'home',
    label: 'Главная',
    svg: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  },
  {
    id: 'workouts',
    label: 'Тренировки',
    svg: 'M6 5v14 M10 5v14 M18 5v14 M14 5v14 M2 12h4 M14 12h4 M10 12h4 M18 12h4',
  },
  {
    id: 'nutrition',
    label: 'Питание',
    svg: 'M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z M6 1v3 M10 1v3 M14 1v3',
  },
  {
    id: 'profile',
    label: 'Профиль',
    svg: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  },
];

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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tab.svg} />
              </svg>
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