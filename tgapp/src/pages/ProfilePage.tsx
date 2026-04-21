import { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { X, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { tg, user, colors } = useTelegram();
  const sectionBg = colors.secondaryBg;

  const [profileData, setProfileData] = useState({
    height: '...',
    weight: '...',
    age: '...',
    gender: '...',
    caloriesPerDay: '...',
    subscription: '...',
  });

  // Данные для модального окна
  const [macrosData, setMacrosData] = useState<{
    tdee: number;
    protein: number;
    fat: number;
    carbs: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isMacrosModalOpen, setIsMacrosModalOpen] = useState(false);

  useEffect(() => {
    const initDataString = (tg as any)?.initData;

    if (!initDataString) {
      console.warn('Приложение открыто вне Telegram: initData отсутствует.');
      setProfileData({
        height: '—',
        weight: '—',
        age: '—',
        gender: '—',
        caloriesPerDay: '—',
        subscription: 'Нет',
      });
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('https://api.snnfitmate.ru/telegram/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ init_data: initDataString })
        });

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.profile) {
          const p = data.profile;
          setProfileData({
            height: p.height || '—',
            weight: p.weight || '—',
            age: p.age || '—',
            gender: p.gender || '—',
            caloriesPerDay: p.caloriesPerDay || '—',
            subscription: p.subscription || 'Нет',
          });

          // Сохраняем подробные данные КБЖУ
          if (p.macros) {
            setMacrosData(p.macros);
          }
        } else {
          setProfileData({
            height: '—', weight: '—', age: '—', gender: '—',
            caloriesPerDay: '—', subscription: 'Нет',
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        setProfileData({
          height: '—', weight: '—', age: '—', gender: '—',
          caloriesPerDay: '—', subscription: '—',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [tg]);

  const sections = [
    {
      title: 'Личные данные',
      items: [
        { label: 'Рост', value: profileData.height, isClickable: false },
        { label: 'Вес', value: profileData.weight, isClickable: false },
        { label: 'Возраст', value: profileData.age, isClickable: false },
        { label: 'Пол', value: profileData.gender, isClickable: false },
      ],
    },
    {
      title: 'Питание',
      items: [
        {
          label: 'ККАЛ в день',
          value: profileData.caloriesPerDay,
          isClickable: macrosData !== null
        },
      ],
    },
    {
      title: 'Подписка',
      items: [
        { label: 'Срок действия', value: profileData.subscription, isClickable: false },
      ],
    },
  ];

  const handleItemClick = (label: string, isClickable: boolean) => {
    if (isClickable && label === 'ККАЛ в день') {
      setIsMacrosModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Карточка профиля */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
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
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.link}, ${colors.button})`,
                boxShadow: `0 8px 24px ${colors.button}40`,
              }}
            >
              {(user as any)?.first_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full"
              style={{
                backgroundColor: '#22c55e',
                border: `3px solid ${sectionBg}`,
              }}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">
              {(user as any)?.first_name || 'Unknown'} {(user as any)?.last_name || ''}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: colors.link }}>
              @{(user as any)?.username || 'anonymous'}
            </p>
            <p className="text-xs mt-1" style={{ color: colors.hint }}>
              ID: {(user as any)?.id || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Информационные блоки */}
      <div className={`transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
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
                  onClick={() => handleItemClick(item.label, item.isClickable)}
                  className={`flex items-center justify-between px-4 py-3.5 transition-colors ${
                    item.isClickable ? 'cursor-pointer active:bg-black/5' : ''
                  }`}
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
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold" style={{ color: colors.text }}>
                      {item.value}
                    </span>
                    {item.isClickable && (
                      <ChevronRight size={18} style={{ color: colors.hint }} className="opacity-70" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="h-4" />

      {/* Модальное окно КБЖУ */}
      {isMacrosModalOpen && macrosData && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsMacrosModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">Ваш расчет КБЖУ</h2>
              <button 
                onClick={() => setIsMacrosModalOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-green-50 p-5 rounded-lg border border-[#3CAB3C]">
                <p className="text-sm text-green-800 mb-1">Суточная норма калорий</p>
                <p className="text-3xl font-bold text-[#3CAB3C]">{macrosData.tdee} ккал</p>
                <p className="text-xs text-green-700 mt-2">Ваша персональная цель</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 p-3 rounded-lg text-center border border-red-300">
                  <p className="text-xs text-red-700 mb-1">Белки</p>
                  <p className="text-xl font-bold text-red-700">{Math.round(macrosData.protein)} г</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-300">
                  <p className="text-xs text-yellow-700 mb-1">Жиры</p>
                  <p className="text-xl font-bold text-yellow-700">{Math.round(macrosData.fat)} г</p>
                </div>
                <div className="bg-[#f0fdf4] p-3 rounded-lg text-center border border-[#3CAB3C]">
                  <p className="text-xs text-[#3CAB3C] mb-1">Углеводы</p>
                  <p className="text-xl font-bold text-[#3CAB3C]">{Math.round(macrosData.carbs)} г</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsMacrosModalOpen(false)}
                  className="w-full py-3 bg-[#3CAB3C] text-white rounded-lg font-semibold hover:bg-[#2b8a2b] transition-colors shadow-sm"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}