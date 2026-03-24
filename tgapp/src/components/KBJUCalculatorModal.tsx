import { X } from 'lucide-react';
import { useState } from 'react';

interface KBJUCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KBJUCalculatorModal({ isOpen, onClose }: KBJUCalculatorModalProps) {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [activity, setActivity] = useState<number>(1.55);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [showResult, setShowResult] = useState(false);
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

  const calculateKBJU = async () => {
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);
  const ageNum = parseInt(age);

  if (!weightNum || !heightNum || !ageNum) {
    alert('Заполните все поля');
    return;
  }

  const tg = (window as any).Telegram?.WebApp;
  const initData = tg?.initData;

  if (!initData) {
    alert('Откройте приложение через Telegram');
    return;
  }

  try {
    const res = await fetch('http://127.0.0.1:8000/calculate-kbju', {
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
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Калькулятор КБЖУ</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {!showResult ? (
            <div className="space-y-4">
              {/* Пол */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Пол</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-base ${
                      gender === 'male'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Мужской
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-base ${
                      gender === 'female'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Женский
                  </button>
                </div>
              </div>

              {/* Вес */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Вес</h3>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Введите вес в кг"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="30"
                  max="250"
                  step="0.1"
                />
              </div>

              {/* Рост */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Рост</h3>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Введите рост в см"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="100"
                  max="250"
                />
              </div>

              {/* Возраст */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Возраст</h3>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Введите возраст в годах"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  max="120"
                />
              </div>

              {/* Коэффициент физической активности */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Коэффициент физической активности</h3>
                <select
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:outline-none text-gray-800"
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value} className="text-gray-800">
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Цель для расчета КБЖУ */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">Цель для расчета КБЖУ</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGoal('lose')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium ${
                      goal === 'lose'
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Похудение
                  </button>
                  <button
                    onClick={() => setGoal('gain')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium ${
                      goal === 'gain'
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Массонабор
                  </button>
                  <button
                    onClick={() => setGoal('maintain')}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium ${
                      goal === 'maintain'
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Поддержание
                  </button>
                </div>
              </div>

              {/* Кнопка Рассчитать по центру */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={calculateKBJU}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md text-base"
                >
                  Рассчитать
                </button>
              </div>
            </div>
          ) : (
            result && (
              <div className="space-y-4">
                {/* Суточная норма калорий */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-300">
                  <p className="text-sm text-blue-700 mb-1">Суточная норма калорий</p>
                  <p className="text-3xl font-bold text-blue-700">{result.tdee} ккал</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Для {goal === 'lose' ? 'похудения' : goal === 'gain' ? 'набора массы' : 'поддержания веса'}
                  </p>
                </div>

                {/* КБЖУ в граммах */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-red-50 p-3 rounded-lg text-center border border-red-300">
                    <p className="text-xs text-red-700 mb-1">Белки</p>
                    <p className="text-xl font-bold text-red-700">{result.protein} г</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-300">
                    <p className="text-xs text-yellow-700 mb-1">Жиры</p>
                    <p className="text-xl font-bold text-yellow-700">{result.fat} г</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center border border-green-300">
                    <p className="text-xs text-green-700 mb-1">Углеводы</p>
                    <p className="text-xl font-bold text-green-700">{result.carbs} г</p>
                  </div>
                </div>

                {/* Основной обмен */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Основной обмен (BMR):</span>
                    <span className="font-medium text-gray-800">{result.bmr} ккал</span>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowResult(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors border border-gray-300"
                  >
                    Новый расчет
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}