import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface KBJUCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KBJUCalculatorModal({ isOpen, onClose }: KBJUCalculatorModalProps) {
  // --- Состояния данных формы ---
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [activity, setActivity] = useState<number>(1.55);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  
  // --- Состояния UI ---
  const [showResult, setShowResult] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false); 
  const [isCalculating, setIsCalculating] = useState(false);   
  
  const [result, setResult] = useState<{
    bmr: number;
    tdee: number;
    protein: number;
    fat: number;
    carbs: number;
  } | null>(null);

  const activityLevels = [
    { value: 1.2, label: 'Минимальная (сидячий образ жизни)' },
    { value: 1.375, label: 'Низкая (тренировки 1-3 раза в неделю)' },
    { value: 1.55, label: 'Средняя (тренировки 3-5 раз в неделю)' },
    { value: 1.725, label: 'Высокая (тренировки 6-7 раз в неделю)' },
    { value: 1.9, label: 'Очень высокая (физическая работа)' },
  ];

  useEffect(() => {
    if (isOpen) {
      setShowResult(false);
      
      const fetchUserData = async () => {
        const tg = (window as any).Telegram?.WebApp;
        const initData = tg?.initData;
        if (!initData) return;

        setIsFetchingData(true);
        try {
          const res = await fetch('https://api.snnfitmate.ru/telegram/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ init_data: initData }),
          });

          if (res.ok) {
            const data = await res.json();
            const profile = data?.profile;
            
            if (profile) {
              if (profile.gender === 'Мужской') setGender('male');
              if (profile.gender === 'Женский') setGender('female');

              if (profile.weight) {
                const w = parseFloat(profile.weight);
                if (!isNaN(w)) setWeight(w.toString());
              }
              if (profile.height) {
                const h = parseFloat(profile.height);
                if (!isNaN(h)) setHeight(h.toString());
              }
              if (profile.age) {
                const a = parseInt(profile.age);
                if (!isNaN(a)) setAge(a.toString());
              }
              if (profile.activity) {
                const act = parseFloat(profile.activity);
                if (!isNaN(act)) setActivity(act);
              }
              if (profile.goal) {
                setGoal(profile.goal);
              }
            }
          }
        } catch (err) {
          console.error('Ошибка при загрузке данных профиля:', err);
        } finally {
          setIsFetchingData(false);
        }
      };

      fetchUserData();
    }
  }, [isOpen]);

  // --- ОБРАБОТЧИКИ ВВОДА (Ограничения символов) ---

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Меняем запятую на точку для удобства
    const val = e.target.value.replace(',', '.');
    // Разрешаем только: до 3 цифр до точки и до 2 цифр после точки. Никаких минусов и букв.
    if (/^\d{0,3}(\.\d{0,2})?$/.test(val)) {
      setWeight(val);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Разрешаем только цифры, максимум 3 штуки
    if (/^\d{0,3}$/.test(val)) {
      setHeight(val);
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Разрешаем только цифры, максимум 3 штуки
    if (/^\d{0,3}$/.test(val)) {
      setAge(val);
    }
  };

  // --- Расчет КБЖУ ---
  const calculateKBJU = async () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    if (!weightNum || !heightNum || !ageNum) {
      alert('Заполните все поля');
      return;
    }

    // Дополнительная логическая проверка перед отправкой (по желанию)
    if (weightNum < 35 || weightNum > 300) { alert('Пожалуйста, введите корректный вес (35-300 кг)'); return; }
    if (heightNum < 140 || heightNum > 250) { alert('Пожалуйста, введите корректный рост (140-250 см)'); return; }
    if (ageNum < 16 || ageNum > 60) { alert('Пожалуйста, введите корректный возраст (от 16 до 60 лет)'); return; }

    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData;

    if (!initData) {
      alert('Откройте приложение через Telegram');
      return;
    }

    setIsCalculating(true);

    try {
      const res = await fetch('https://api.snnfitmate.ru/calculate-kbju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: initData,
          gender,
          weight: weightNum,
          height: heightNum,
          age: ageNum,
          activity,
          goal,
        }),
      });

      if (!res.ok) throw new Error('Ошибка сервера');

      const data = await res.json();
      setResult(data);
      setShowResult(true);

    } catch (err) {
      console.error(err);
      alert('Ошибка расчета');
    } finally {
      setIsCalculating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 pt-4 pb-20"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full max-h-[calc(100vh-96px)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка — фиксированная, не скроллится */}
        <div className="shrink-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Калькулятор КБЖУ</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Контент — скроллится */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          {isFetchingData ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#3CAB3C] mb-4" size={40} />
              <p className="text-gray-500 font-medium">Загрузка ваших данных...</p>
            </div>
          ) : !showResult ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Пол</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-base border transition-colors ${
                      gender === 'male'
                        ? 'bg-[#3CAB3C] text-white border-[#3CAB3C] shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
                    }`}
                  >
                    Мужской
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-base border transition-colors ${
                      gender === 'female'
                        ? 'bg-[#3CAB3C] text-white border-[#3CAB3C] shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
                    }`}
                  >
                    Женский
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Вес (кг)</h3>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={handleWeightChange}
                  placeholder="Например: 75.5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#3CAB3C] focus:outline-none text-gray-800 placeholder-gray-500 bg-white"
                />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Рост (см)</h3>
                <input
                  type="text"
                  inputMode="numeric"
                  value={height}
                  onChange={handleHeightChange}
                  placeholder="Например: 175"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#3CAB3C] focus:outline-none text-gray-800 placeholder-gray-500 bg-white"
                />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Возраст (лет)</h3>
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={handleAgeChange}
                  placeholder="Например: 25"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#3CAB3C] focus:outline-none text-gray-800 placeholder-gray-500 bg-white"
                />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Коэффициент физической активности</h3>
                <select
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-[#3CAB3C] focus:outline-none text-gray-800"
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value} className="text-gray-800">
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Цель для расчета КБЖУ</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGoal('lose')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        goal === 'lose'
                          ? 'bg-[#3CAB3C] text-white border-[#3CAB3C] shadow-md'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Похудение
                    </button>
                    <button
                      onClick={() => setGoal('gain')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        goal === 'gain'
                          ? 'bg-[#3CAB3C] text-white border-[#3CAB3C] shadow-md'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Массонабор
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setGoal('maintain')}
                      className={`w-2/3 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        goal === 'maintain'
                          ? 'bg-[#3CAB3C] text-white border-[#3CAB3C] shadow-md'
                          : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Коррекция
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            result && (
              <div className="space-y-4">
                <div className="bg-green-50 p-5 rounded-lg border border-[#3CAB3C]">
                  <p className="text-sm text-green-800 mb-1">Суточная норма калорий</p>
                  <p className="text-3xl font-bold text-[#3CAB3C]">{result.tdee} ккал</p>
                  <p className="text-xs text-green-700 mt-2">
                    Для {goal === 'lose' ? 'похудения' : goal === 'gain' ? 'набора массы' : 'коррекции'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-red-50 p-3 rounded-lg text-center border border-red-300">
                    <p className="text-xs text-red-700 mb-1">Белки</p>
                    <p className="text-xl font-bold text-red-700">{result.protein} г</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-300">
                    <p className="text-xs text-yellow-700 mb-1">Жиры</p>
                    <p className="text-xl font-bold text-yellow-700">{result.fat} г</p>
                  </div>
                  <div className="bg-[#f0fdf4] p-3 rounded-lg text-center border border-[#3CAB3C]">
                    <p className="text-xs text-[#3CAB3C] mb-1">Углеводы</p>
                    <p className="text-xl font-bold text-[#3CAB3C]">{result.carbs} г</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Футер с кнопкой — всегда виден, не скроллится */}
        {!isFetchingData && (
          <div className="shrink-0 border-t border-gray-100 p-4">
            {!showResult ? (
              <div className="flex justify-center">
                <button
                  onClick={calculateKBJU}
                  disabled={isCalculating}
                  className="px-8 py-3 bg-[#3CAB3C] text-white rounded-lg font-semibold hover:bg-[#2b8a2b] transition-colors shadow-md text-base flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px] justify-center"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Расчет...
                    </>
                  ) : (
                    'Рассчитать'
                  )}
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResult(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors border border-gray-300"
                >
                  Новый расчет
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#3CAB3C] text-white rounded-lg font-semibold hover:bg-[#2b8a2b] transition-colors"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}