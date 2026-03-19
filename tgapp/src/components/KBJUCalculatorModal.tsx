import { useState, useEffect } from 'react';

interface KBJUCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KBJUCalculatorModal({ isOpen, onClose }: KBJUCalculatorModalProps) {
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<'lose' | 'recomp' | 'gain' | null>(null);

  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setWeight(''); setHeight(''); setAge('');
      setGender(null); setGoal(null);
      setShowResult(false); setResult(null);
    }
  }, [isOpen]);

  const calculate = () => {
    const w = +weight;
    const h = +height;
    const a = +age;
    if (!w || !h || !a || !gender || !goal) {
      alert('Заполните все поля');
      return;
    }
    let bmr = gender === 'male'
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;
    let tdee = bmr * activity;
    if (goal === 'lose') tdee *= 0.82;
    if (goal === 'gain') tdee *= 1.15;
    const protein = Math.round((tdee * 0.3) / 4);
    const fat = Math.round((tdee * 0.25) / 9);
    const carbs = Math.round((tdee * 0.45) / 4);
    setResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), protein, fat, carbs });
    setShowResult(true);
  };

  if (!isOpen) return null;

  const hideArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка с разделительной полосой, текст слева */}
        <div className="p-4 pb-2 border-b border-gray-100 flex justify-start items-center">
          <h2 className="text-lg font-bold text-gray-800">Калькулятор КБЖУ</h2>
        </div>

        <div className="p-4 pt-3 space-y-3 overflow-y-auto text-gray-800">
          {!showResult ? (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-0.5">Пол</h3>
                <div className="flex gap-2">
                  <button onClick={() => setGender('male')}
                    className={`flex-1 py-2 rounded-lg border ${gender === 'male' ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' : 'bg-gray-100 border-gray-300'}`}>
                    Мужской
                  </button>
                  <button onClick={() => setGender('female')}
                    className={`flex-1 py-2 rounded-lg border ${gender === 'female' ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' : 'bg-gray-100 border-gray-300'}`}>
                    Женский
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-0.5">Вес</h3>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                  className={`w-full p-2 border border-gray-300 rounded-lg text-sm ${hideArrowsClass}`} placeholder="Введите вес (кг)" />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-0.5">Рост</h3>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                  className={`w-full p-2 border border-gray-300 rounded-lg text-sm ${hideArrowsClass}`} placeholder="Введите рост (см)" />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-0.5">Возраст</h3>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                  className={`w-full p-2 border border-gray-300 rounded-lg text-sm ${hideArrowsClass}`} placeholder="Введите возраст" />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-0.5">Активность</h3>
                <select value={activity} onChange={(e) => setActivity(+e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none">
                  <option value={1.2}>Минимальная</option>
                  <option value={1.375}>Низкая</option>
                  <option value={1.55}>Средняя</option>
                  <option value={1.725}>Высокая</option>
                  <option value={1.9}>Очень высокая</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1">Цель</h3>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2 w-full">
                    <button onClick={() => setGoal('lose')}
                      className={`flex-1 py-2 rounded-lg border ${goal === 'lose' ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' : 'bg-gray-100 border-gray-300'}`}>
                      Похудение
                    </button>
                    <button onClick={() => setGoal('recomp')}
                      className={`flex-1 py-2 rounded-lg border ${goal === 'recomp' ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' : 'bg-gray-100 border-gray-300'}`}>
                      Коррекция
                    </button>
                  </div>
                  <div className="w-full flex justify-center">
                     <button onClick={() => setGoal('gain')}
                      className={`w-1/2 py-2 rounded-lg border ${goal === 'gain' ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' : 'bg-gray-100 border-gray-300'}`}>
                      Массонабор
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={calculate} className="w-full bg-[#3CAB3C] text-white py-3 rounded-lg font-bold shadow-md mt-1">
                Рассчитать
              </button>
            </>
          ) : (
            result && (
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <p className="text-sm text-blue-700 font-medium">Ваша норма калорий</p>
                  <p className="text-2xl font-bold text-blue-700">{result.tdee} ккал</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-center font-medium">
                  <div className="bg-red-50 p-2 rounded border border-red-200 text-red-700">Б: {result.protein}г</div>
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-yellow-700">Ж: {result.fat}г</div>
                  <div className="bg-green-50 p-2 rounded border border-green-200 text-green-700">У: {result.carbs}г</div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowResult(false)} className="flex-1 bg-gray-100 py-2 rounded-lg font-medium">Назад</button>
                  <button onClick={onClose} className="flex-1 bg-[#3CAB3C] text-white py-2 rounded-lg font-bold">Готово</button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}