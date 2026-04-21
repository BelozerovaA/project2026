import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Program } from '../pages/HomePage';

const API_BASE_URL = 'https://api.snnfitmate.ru';

interface ProgramCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProgram: (program: Program) => void; // теперь возвращаем программу
}

export default function ProgramCompositionModal({
  isOpen,
  onClose,
  onCreateProgram,
}: ProgramCompositionModalProps) {
  const [gender, setGender] = useState<'Мужской' | 'Женский' | ''>('');
  const [ageCategory, setAgeCategory] = useState<'20-30 лет' | '30-40 лет' | ''>('');
  const [goal, setGoal] = useState<'Коррекция тела' | 'Похудение' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadDefaults = async () => {
      try {
        setIsLoadingDefaults(true);
        // @ts-ignore
        const initData = window.Telegram?.WebApp?.initData || '';

        const res = await fetch(`${API_BASE_URL}/programs/form-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ init_data: initData }),
        });

        if (!res.ok) throw new Error('Не удалось загрузить данные анкеты');

        const data = await res.json();
        const g = data.gender === 'Мужской' ? 'Мужской' : 'Женский';
        const ag = data.age_group === '30-40' ? '30-40 лет' : '20-30 лет';
        const gl = data.goal === 'Похудение' ? 'Похудение' : 'Коррекция тела';

        setGender(g);
        setAgeCategory(ag);
        setGoal(gl);
      } catch (e) {
        // дефолты
        setGender('Женский');
        setAgeCategory('20-30 лет');
        setGoal('Коррекция тела');
      } finally {
        setIsLoadingDefaults(false);
      }
    };

    loadDefaults();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!gender || !ageCategory || !goal) {
      alert('Заполните все поля');
      return;
    }

    try {
      setIsSubmitting(true);

      // @ts-ignore
      const initData = window.Telegram?.WebApp?.initData || '';

      const response = await fetch(`${API_BASE_URL}/programs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          init_data: initData,
          gender: gender === 'Мужской' ? 'male' : 'female',
          age_group: ageCategory === '20-30 лет' ? '20-30' : '30-40',
          goal,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Ошибка создания программы');
      }

      const program: Program = await response.json();
      onCreateProgram(program);
    } catch (error) {
      console.error('Ошибка создания программы:', error);
      alert(error instanceof Error ? error.message : 'Не удалось создать программу');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">Составление программы</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoadingDefaults ? (
            <div className="text-sm text-gray-500">Загрузка анкеты...</div>
          ) : (
            <div className="space-y-5">
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

              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#3CAB3C] text-white rounded-lg font-semibold hover:opacity-90 transition shadow-md text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Формирование...' : 'Сформировать'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}