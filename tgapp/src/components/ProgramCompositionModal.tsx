import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProgramCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: 'home' | 'workouts' | 'nutrition' | 'profile') => void;
}

export default function ProgramCompositionModal({
  isOpen,
  onClose,
}: ProgramCompositionModalProps) {
  const [gender, setGender] = useState<string>('');
  const [ageCategory, setAgeCategory] = useState<string>('');
  const [goal, setGoal] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setGender('');
      setAgeCategory('');
      setGoal('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (gender && ageCategory && goal) {
      alert(`Программа сформирована!\nПол: ${gender}\nВозраст: ${ageCategory}\nЦель: ${goal}`);
      onClose();
    } else {
      alert('Заполните все поля');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md flex flex-col"
        style={{ height: '450px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">
            Составление программы
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-hidden">
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-5">

              {/* Пол */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">Пол</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGender('Мужской')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      gender === 'Мужской'
                        ? 'bg-[#3CAB3C] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    Мужской
                  </button>
                  <button
                    onClick={() => setGender('Женский')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      gender === 'Женский'
                        ? 'bg-[#3CAB3C] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    Женский
                  </button>
                </div>
              </div>

              {/* Возраст */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">Возрастная категория</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAgeCategory('20-30 лет')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      ageCategory === '20-30 лет'
                        ? 'bg-[#3CAB3C] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    от 20 до 30
                  </button>
                  <button
                    onClick={() => setAgeCategory('30-40 лет')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      ageCategory === '30-40 лет'
                        ? 'bg-[#3CAB3C] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    от 30 до 40
                  </button>
                </div>
              </div>

              {/* Цель */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 text-sm">Цель</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGoal('Коррекция тела')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      goal === 'Коррекция тела'
                        ? 'bg-[#3CAB3C] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    Коррекция тела
                  </button>
                  <button
                    onClick={() => setGoal('Похудение')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-colors ${
                      goal === 'Похудение'
                        ? 'bg-[#3CAB3C] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    Похудение
                  </button>
                </div>
              </div>

            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-[#3CAB3C] text-white rounded-lg font-semibold hover:opacity-90 transition shadow-md text-sm"
              >
                Сформировать
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}