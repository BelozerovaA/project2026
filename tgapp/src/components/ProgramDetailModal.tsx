import { X, Settings, ArrowLeft, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Exercise {
  id: number;
  name: string;
  description: string;
  image?: string;
  sets?: number;
  reps?: string;
}

interface Program {
  id: number;
  title: string;
  difficulty: string;
  duration: string;
  calories: number;
  focus: string;
  exercises: Exercise[];
}

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
}

export default function ProgramDetailModal({ isOpen, onClose, program }: ProgramDetailModalProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Средний');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (program) {
      setSelectedDifficulty(program.difficulty);
      setSelectedExercises(program.exercises);
      setCurrentExerciseIndex(0);
    }
  }, [program]);

  if (!isOpen || !program) return null;

  const allExercises: Record<string, Exercise[]> = {
    'Начинающий': [
      { id: 1, name: 'Наклоны головы', description: 'Медленные наклоны головы вправо-влево, вперед-назад', image: '🧘', sets: 1, reps: '10 раз' },
      { id: 2, name: 'Вращения плечами', description: 'Вращайте плечами вперед и назад', image: '🏋️', sets: 1, reps: '15 раз' },
      { id: 3, name: 'Махи руками', description: 'Махи руками в стороны и вверх', image: '🤸', sets: 1, reps: '20 раз' },
      { id: 4, name: 'Поза кошки', description: 'На вдохе прогнитесь, на выдохе округлите спину', image: '🐱', sets: 1, reps: '10 раз' },
    ],
    'Средний': [
      { id: 5, name: 'Отжимания', description: 'Классические отжимания, держите спину прямой', image: '💪', sets: 3, reps: '12 раз' },
      { id: 6, name: 'Приседания', description: 'Держите спину прямо, не отрывайте пятки', image: '🦵', sets: 3, reps: '15 раз' },
      { id: 7, name: 'Выпады', description: 'Чередуйте ноги, держите корпус прямо', image: '🏃', sets: 3, reps: '12 раз' },
      { id: 8, name: 'Планка', description: 'Держите спину прямой, не прогибайтесь', image: '🧘', sets: 3, reps: '30 сек' },
    ],
    'Продвинутый': [
      { id: 9, name: 'Бёрпи', description: 'Взрывное движение, работайте в полную силу', image: '💪', sets: 4, reps: '15 раз' },
      { id: 10, name: 'Скалолаз', description: 'Быстрые движения ногами в упоре лежа', image: '🏃', sets: 4, reps: '20 раз' },
      { id: 11, name: 'Джампинг Джек', description: 'Прыжки с хлопками', image: '🤸', sets: 4, reps: '30 раз' },
      { id: 12, name: 'Выпады с прыжком', description: 'Выпады со сменой ног в прыжке', image: '🏋️', sets: 4, reps: '12 раз' },
    ],
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    const exercises = allExercises[difficulty as keyof typeof allExercises];
    setSelectedExercises(exercises || []);
    setCurrentExerciseIndex(0);
  };

  const toggleExercise = (exercise: Exercise) => {
    if (selectedExercises.some(e => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };
  
  const currentExercise = selectedExercises[currentExerciseIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 px-6 pb-2 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {showSettings ? (
              <button onClick={() => setShowSettings(false)} className="text-gray-400">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <button onClick={onClose} className="text-gray-400">
                <X size={20} />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-800">
              {showSettings ? 'Настройка' : program.title}
            </h2>
          </div>
          {!showSettings && (
            <button onClick={() => setShowSettings(true)} className="p-2 bg-gray-50 rounded-full text-gray-500">
              <Settings size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {showSettings ? (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Сложность</h3>
                <div className="flex gap-2">
                  {['Начинающий', 'Средний', 'Продвинутый'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleDifficultyChange(level)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedDifficulty === level
                          ? 'bg-[#3CAB3C] text-white shadow-md'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Упражнения</h3>
                <div className="space-y-2">
                  {allExercises[selectedDifficulty as keyof typeof allExercises]?.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => toggleExercise(exercise)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedExercises.some(e => e.id === exercise.id)
                          ? 'border-[#3CAB3C] bg-green-50'
                          : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl">{exercise.image}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800">{exercise.name}</div>
                        <div className="text-[10px] text-gray-400">{exercise.reps}</div>
                      </div>
                      {selectedExercises.some(e => e.id === exercise.id) && (
                        <Check size={16} className="text-[#3CAB3C]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-1/2 bg-[#3CAB3C] text-white py-3 rounded-xl font-bold shadow-sm"
                >
                  Сохранить
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-black text-gray-800">
                    {currentExerciseIndex + 1}<span className="text-gray-300 text-lg">/{selectedExercises.length}</span>
                  </span>
                  <span className="text-xs font-bold text-[#3CAB3C]">Упражнение</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#3CAB3C] h-full transition-all duration-500"
                    style={{ width: `${selectedExercises.length > 0 ? ((currentExerciseIndex + 1) / selectedExercises.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {currentExercise ? (
                <div className="space-y-6">
                  <div className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center text-7xl shadow-inner">
                    {currentExercise.image}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{currentExercise.name}</h3>
                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-1 bg-green-50 text-[#3CAB3C] text-[10px] font-bold rounded-md uppercase">
                        {currentExercise.sets} Подхода
                      </span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-500 text-[10px] font-bold rounded-md uppercase">
                        {currentExercise.reps}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {currentExercise.description}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentExerciseIndex === 0}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-gray-400 bg-gray-50 disabled:opacity-30"
                    >
                      <ChevronLeft size={20} /> Назад
                    </button>
                    <button
                      onClick={() => {
                        if (currentExerciseIndex < selectedExercises.length - 1) {
                          setCurrentExerciseIndex(prev => prev + 1);
                        } else {
                          onClose();
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-[#3CAB3C] shadow-lg shadow-green-100 active:scale-95 transition-all"
                    >
                      {currentExerciseIndex === selectedExercises.length - 1 ? 'Завершить' : 'Далее'} <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">Нет выбранных упражнений</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}