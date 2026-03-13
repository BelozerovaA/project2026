import { X, Dumbbell, ArrowLeft, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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
  program: Program | null;
}

export default function ProgramDetailModal({ isOpen, onClose, program }: ProgramDetailModalProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [editedProgram, setEditedProgram] = useState<Program | null>(program);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(program?.difficulty || 'Средний');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(program?.exercises || []);

  if (!isOpen || !program) return null;

  const allExercises = {
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
    setSelectedExercises(allExercises[difficulty as keyof typeof allExercises] || []);
  };

  const toggleExercise = (exercise: Exercise) => {
    if (selectedExercises.some(e => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const handleSaveSettings = () => {
    if (editedProgram) {
      const updatedProgram = {
        ...editedProgram,
        difficulty: selectedDifficulty,
        exercises: selectedExercises,
        duration: selectedExercises.length * 5 + ' мин', 
      };
      setEditedProgram(updatedProgram);
      setShowSettings(false);
    }
  };

  const currentExercise = selectedExercises[currentExerciseIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {showSettings ? (
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {showSettings ? 'Настройка программы' : editedProgram?.title}
            </h2>
          </div>
          {!showSettings && (
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Настройки программы"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {showSettings ? (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Уровень сложности</h3>
              <div className="flex gap-2">
                {['Начинающий', 'Средний', 'Продвинутый'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleDifficultyChange(level)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedDifficulty === level
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Упражнения</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allExercises[selectedDifficulty as keyof typeof allExercises]?.map((exercise) => (
                  <label
                    key={exercise.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedExercises.some(e => e.id === exercise.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedExercises.some(e => e.id === exercise.id)}
                      onChange={() => toggleExercise(exercise)}
                      className="w-4 h-4 text-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{exercise.image}</span>
                        <span className="font-medium text-gray-800">{exercise.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{exercise.sets} подхода × {exercise.reps}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {selectedExercises.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{currentExerciseIndex + 1} / {selectedExercises.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(currentExerciseIndex + 1) / selectedExercises.length * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {currentExercise && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <span className="text-8xl opacity-30">{currentExercise.image || '🏋️'}</span>
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{currentExercise.name}</h2>
                  
                  {currentExercise.sets && currentExercise.reps && (
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        {currentExercise.sets} подхода
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">
                        {currentExercise.reps}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-6">{currentExercise.description}</p>

                  {selectedExercises.length > 1 && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentExerciseIndex === 0}
                        className={`flex-1 py-3 rounded-lg font-semibold ${
                          currentExerciseIndex === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Назад
                      </button>
                      <button
                        onClick={() => {
                          if (currentExerciseIndex < selectedExercises.length - 1) {
                            setCurrentExerciseIndex(prev => prev + 1);
                          }
                        }}
                        disabled={currentExerciseIndex === selectedExercises.length - 1}
                        className={`flex-1 py-3 rounded-lg font-semibold ${
                          currentExerciseIndex === selectedExercises.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Далее
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedExercises.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-3">Все упражнения</h3>
                <div className="space-y-2">
                  {selectedExercises.map((ex, idx) => (
                    <div 
                      key={ex.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        idx === currentExerciseIndex ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          idx < currentExerciseIndex 
                            ? 'bg-green-500 text-white' 
                            : idx === currentExerciseIndex
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm">{ex.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}