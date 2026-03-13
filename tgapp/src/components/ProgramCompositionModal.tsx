import { X } from 'lucide-react';
import { useState } from 'react';

interface ProgramCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProgramCompositionModal({ isOpen, onClose }: ProgramCompositionModalProps) {
  const [gender, setGender] = useState<string>('');
  const [ageCategory, setAgeCategory] = useState<string>('');
  const [goal, setGoal] = useState<string>('');

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Составление программы</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Пол</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setGender('Мужской')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  gender === 'Мужской'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Мужской
              </button>
              <button
                onClick={() => setGender('Женский')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  gender === 'Женский'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Женский
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Возрастная категория</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setAgeCategory('20-30 лет')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  ageCategory === '20-30 лет'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                от 20 до 30
              </button>
              <button
                onClick={() => setAgeCategory('30-40 лет')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  ageCategory === '30-40 лет'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                от 30 до 40
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Цель</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setGoal('Массонабор')}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors text-left ${
                  goal === 'Массонабор'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Массонабор
              </button>
              <button
                onClick={() => setGoal('Похудение')}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors text-left ${
                  goal === 'Похудение'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Похудение
              </button>
              <button
                onClick={() => setGoal('Тонус тела')}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors text-left ${
                  goal === 'Тонус тела'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                Тонус тела
              </button>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md"
            >
              Сформировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}