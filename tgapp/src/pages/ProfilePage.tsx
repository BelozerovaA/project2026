import { useTelegram } from '../hooks/useTelegram';

export default function ProfilePage() {
  const { user, colors } = useTelegram();

  const sectionBg = colors.secondaryBg;

  const profileData = {
    height: '180 см',
    weight: '78 кг',
    age: '25 лет',
    gender: 'Мужской',
    caloriesPerDay: '2400 ккал',
    subscription: 'Premium',
  };

  const sections = [
    {
      title: 'Личные данные',
      items: [
        { label: 'Рост', value: profileData.height },
        { label: 'Вес', value: profileData.weight },
        { label: 'Возраст', value: profileData.age },
        { label: 'Пол', value: profileData.gender },
      ],
    },
    {
      title: 'Питание',
      items: [
        { label: 'ККАЛ в день', value: profileData.caloriesPerDay },
      ],
    },
    {
      title: 'Подписка',
      items: [
        { label: 'Текущий план', value: profileData.subscription },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Карточка профиля */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          backgroundColor: sectionBg,
          border: `1px solid ${colors.hint}15`,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${colors.button}, ${colors.link})`,
          }}
        />

        <div className="relative flex items-center gap-4">
          {/* Аватар */}
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.link}, ${colors.button})`,
                boxShadow: `0 8px 24px ${colors.button}40`,
              }}
            >
              {user?.first_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full"
              style={{
                backgroundColor: '#22c55e',
                border: `3px solid ${sectionBg}`,
              }}
            />
          </div>

          {/* Имя и юзернейм */}
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">
              {user?.first_name || 'Unknown'} {user?.last_name || ''}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: colors.link }}>
              @{user?.username || 'anonymous'}
            </p>
            <p className="text-xs mt-1" style={{ color: colors.hint }}>
              ID: {user?.id || '—'}
              {user?.language_code && ` · ${user.language_code.toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Информационные блоки */}
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <p
            className="text-xs font-semibold mb-2 px-1 tracking-wider"
            style={{ color: colors.hint }}
          >
            {section.title.toUpperCase()}
          </p>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: sectionBg,
              border: `1px solid ${colors.hint}15`,
            }}
          >
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center justify-between px-4 py-3.5"
                style={{
                  borderBottom:
                    itemIndex < section.items.length - 1
                      ? `1px solid ${colors.hint}15`
                      : 'none',
                }}
              >
                <span className="text-sm" style={{ color: colors.hint }}>
                  {item.label}
                </span>
                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="h-4" />
    </div>
  );
}