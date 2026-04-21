import { Calendar, Calculator, Target, Sparkles, X, ArrowLeft, Dumbbell, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProgramCompositionModal from '../components/ProgramCompositionModal';
import KBJUCalculatorModal from '../components/KBJUCalculatorModal';
import CalendarModal from '../components/CalendarModal';
import ProgramsListModal from '../components/ProgramsListModal';
import ProgramDetailModal from '../components/ProgramDetailModal';

const API_BASE_URL = 'https://api.snnfitmate.ru';

export interface Exercise {
  id: number;
  name: string;
  description: string;
  image?: string;
  visual_representation?: string;
  sets?: number;
  reps?: string;
}

export interface Program {
  id: number;
  title: string;
  difficulty: string;
  focus: string;
  exercises: Exercise[];
  is_finalized: boolean;
  meta?: any; // Для временных данных
}

interface DailyExercise {
  name: string;
  description: string;
  visual_representation?: string | null;
}

interface WorkoutSessionProps {
  program: Program;
  onFinish: () => void;
}

function WorkoutSession({ program, onFinish }: WorkoutSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const exercises = program.exercises;
  const exercise = exercises[currentIndex];

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/${path.replace(/\\/g, '/').replace(/^\//, '')}`;
  };

  const imageUrl = getImageUrl(exercise.image || exercise.visual_representation);

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setImageError(false);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setImageError(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[70] flex flex-col overflow-hidden">
       <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <button
          onClick={onFinish}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-800 truncate">{program.title}</h1>
          <p className="text-xs text-[#3CAB3C] font-medium uppercase tracking-wider">{program.focus}</p>
        </div>
      </div>
      <div className="px-4 py-3 shrink-0">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
          <span>Упражнение {currentIndex + 1} из {exercises.length}</span>
          <span>{Math.round(((currentIndex + 1) / exercises.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-[#3CAB3C] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="mx-4 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="aspect-video bg-green-50 flex items-center justify-center border-b border-gray-100 relative">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={exercise.name}
                className="w-full h-full object-contain p-2 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setEnlargedImage(imageUrl)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center text-green-300">
                <Dumbbell size={64} className="mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Упражнение {currentIndex + 1}
                </span>
              </div>
            )}
          </div>
          <div className="p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{exercise.name}</h2>
            <div className="flex items-center gap-2 bg-green-50 p-4 rounded-xl border border-green-100 mb-5">
              <Info size={20} className="text-[#3CAB3C] shrink-0" />
              <span className="font-bold text-gray-800 text-sm">
                {(exercise.sets ?? 2)} подходов ×{' '}
                <span className="text-[#3CAB3C]">{exercise.reps ?? 15} повторений</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {exercise.description ||
                'Выполняйте упражнение технично и без резких рывков.'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 px-4 py-4 border-t border-gray-100 bg-white shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex-1 py-4 rounded-xl font-bold transition-colors ${
            currentIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Назад
        </button>
        <button
          onClick={handleNext}
          className={`flex-1 py-4 rounded-xl font-bold transition-colors shadow-sm ${
            currentIndex === exercises.length - 1
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-[#3CAB3C] text-white hover:bg-[#2e8b2e]'
          }`}
        >
          {currentIndex === exercises.length - 1 ? 'Завершить' : 'Далее'}
        </button>
      </div>
      {enlargedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
            onClick={() => setEnlargedImage(null)}
          >
            <X size={24} />
          </button>
          <img
            src={enlargedImage}
            alt="Увеличенное изображение"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Основной компонент
// ──────────────────────────────────────────────
export default function HomePage() {
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showKBJUModal, setShowKBJUModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showProgramsListModal, setShowProgramsListModal] = useState(false);
  const [showProgramDetailModal, setShowProgramDetailModal] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [myPrograms, setMyPrograms] = useState<Program[]>([]);
  
  const [workoutSession, setWorkoutSession] = useState<Program | null>(null);
  const [dailyExercise, setDailyExercise] = useState<DailyExercise | null>(null);
  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      // @ts-ignore
      const initData = window.Telegram?.WebApp?.initData || '';
      const response = await fetch(`${API_BASE_URL}/programs/my`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData }),
      });
      if (!response.ok) throw new Error('Ошибка при загрузке программ');
      const data = await response.json();
      setMyPrograms(Array.isArray(data.programs) ? data.programs : []);
    } catch (error) {
      console.error('Ошибка загрузки программ:', error);
      setMyPrograms([]);
    }
  };

  const handleProgramComposition = () => setShowProgramModal(true);

  const handleWorkoutPrograms = async () => {
    await fetchPrograms();
    setShowProgramsListModal(true);
  };

  const handleKBZHUCalculator = () => setShowKBJUModal(true);
  const handleCalendar = () => setShowCalendarModal(true);

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    setShowProgramsListModal(false);
    setShowProgramDetailModal(true);
  };

  const handleStartWorkoutFromList = (program: Program) => {
    setShowProgramsListModal(false);
    setWorkoutSession(program);
  };

  const handleStartWorkoutFromDetail = (program: Program) => {
    setShowProgramDetailModal(false);
    setWorkoutSession(program);
  };

  const handleCreateProgram = (newProgram: Program) => {
    setShowProgramModal(false); 
    setSelectedProgram(newProgram); 
    setShowProgramDetailModal(true); 
  };
  
  const handleDeleteProgram = async (id: number, confirm: boolean = true) => {
    if (confirm && !window.confirm('Вы уверены, что хотите удалить эту программу?')) return;
    
    try {
      // @ts-ignore
      const initData = window.Telegram?.WebApp?.initData || '';
      const response = await fetch(`${API_BASE_URL}/programs/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, program_id: id }),
      });
      if (!response.ok) throw new Error('Ошибка удаления программы');
      
      setMyPrograms(prev => prev.filter(p => p.id !== id));

    } catch (error) {
      console.error('Ошибка удаления программы:', error);
      if (confirm) {
        alert('Не удалось удалить программу.');
      }
    }
  };

  const handleSaveNewProgram = async (finalProgramData: Program) => {
  try {
    // @ts-ignore
    const initData = window.Telegram?.WebApp?.initData || '';    
    const isNewProgram = !finalProgramData.id;    
    if (isNewProgram) {
      const response = await fetch(`${API_BASE_URL}/programs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: initData,
          title: finalProgramData.title,
          difficulty: finalProgramData.difficulty,
          focus: finalProgramData.focus,
          exercises: finalProgramData.exercises,
          meta: finalProgramData.meta,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
        throw new Error(err.detail || 'Ошибка сохранения программы');
      }
      await response.json();
      await fetchPrograms();
      setShowProgramDetailModal(false);
      setSelectedProgram(null);
      // @ts-ignore
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setShowProgramsListModal(true);
      
    } else {
      const response = await fetch(`${API_BASE_URL}/programs/${finalProgramData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: initData,
          difficulty: finalProgramData.difficulty,
          exercises: finalProgramData.exercises,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Ошибка сервера' }));
        throw new Error(err.detail || 'Ошибка обновления программы');
      }
      await response.json();
      await fetchPrograms();
      setShowProgramDetailModal(false);
      setSelectedProgram(null);
      // @ts-ignore
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setShowProgramsListModal(true);
      
      alert('Программа успешно обновлена!');
    }

  } catch (error) {
    console.error('Ошибка сохранения программы:', error);
    alert(error instanceof Error ? error.message : 'Не удалось сохранить программу');
  }
};
  
  const handleCloseDetailModal = () => {
    setShowProgramDetailModal(false);
    setSelectedProgram(null);
  };

  useEffect(() => {
    const fetchDailyExercise = async () => {
      try {
        // @ts-ignore
        const initData = window.Telegram?.WebApp?.initData || '';
        const response = await fetch(`${API_BASE_URL}/daily-exercise`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ init_data: initData }),
        });
        if (response.ok) {
          const data = await response.json();
          setDailyExercise(data);
        }
      } catch (error) {
        console.error('Ошибка при получении упражнения дня:', error);
      } finally {
        setIsLoadingExercise(false);
      }
    };

    fetchDailyExercise();
  }, []);

  return (
    <>
      {workoutSession && (
        <WorkoutSession
          program={workoutSession}
          onFinish={() => setWorkoutSession(null)}
        />
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleProgramComposition}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-[#1f5f1f]/10 rounded-full">
                <Target className="text-[#1f5f1f]" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Составление программы</h3>
                <p className="text-xs text-gray-500 mt-1">Индивидуальный план</p>
              </div>
            </div>
          </button>
          <button
            onClick={handleWorkoutPrograms}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-[#1f5f1f]/10 rounded-full">
                <Sparkles className="text-[#1f5f1f]" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Мои программы</h3>
                <p className="text-xs text-gray-500 mt-1">Готовые комплексы</p>
              </div>
            </div>
          </button>
          <button
            onClick={handleKBZHUCalculator}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-[#1f5f1f]/10 rounded-full">
                <Calculator className="text-[#1f5f1f]" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Калькулятор КБЖУ</h3>
                <p className="text-xs text-gray-500 mt-1">Норма калорий</p>
              </div>
            </div>
          </button>
          <button
            onClick={handleCalendar}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-[#1f5f1f]/10 rounded-full">
                <Calendar className="text-[#1f5f1f]" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Календарь</h3>
                <p className="text-xs text-gray-500 mt-1">Планирование</p>
              </div>
            </div>
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-[#3CAB3C] to-[#2e8b2e] text-white rounded-xl p-5 shadow-lg mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} />
            <h2 className="font-semibold">Упражнение дня</h2>
          </div>
          {isLoadingExercise ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-48 bg-white/30 rounded-lg w-full mb-2"></div>
              <div className="h-5 bg-white/30 rounded w-1/2 mb-1"></div>
              <div className="h-4 bg-white/30 rounded w-full"></div>
              <div className="h-4 bg-white/30 rounded w-3/4"></div>
            </div>
          ) : dailyExercise ? (
            <div>
              {dailyExercise.visual_representation && (
                <div
                  className="bg-black/10 rounded-lg mb-4 p-2 cursor-pointer hover:bg-black/20 transition-colors"
                  onClick={() =>
                    setEnlargedImage(`${API_BASE_URL}/${dailyExercise.visual_representation}`)
                  }
                >
                  <img
                    src={`${API_BASE_URL}/${dailyExercise.visual_representation}`}
                    alt={dailyExercise.name}
                    className="w-full h-48 object-contain rounded-md shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <h3 className="font-bold text-lg mb-1">{dailyExercise.name}</h3>
              <p className="text-sm opacity-90 leading-relaxed">{dailyExercise.description}</p>
            </div>
          ) : (
            <p className="text-base opacity-90">
              Выполните легкую разминку, пока мы подбираем упражнение!
            </p>
          )}
        </div>
      </div>

      {/* Модалы */}
      <ProgramCompositionModal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        onCreateProgram={handleCreateProgram}
      />

      <KBJUCalculatorModal
        isOpen={showKBJUModal}
        onClose={() => setShowKBJUModal(false)}
      />

      <CalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />

      <ProgramsListModal
        isOpen={showProgramsListModal}
        onClose={() => setShowProgramsListModal(false)}
        programs={myPrograms}
        onDeleteProgram={handleDeleteProgram}
        onSelectProgram={handleSelectProgram}
        onStartWorkout={handleStartWorkoutFromList}
        onOpenCreate={() => {
          setShowProgramsListModal(false);
          setShowProgramModal(true);
        }}
      />

      {selectedProgram && (
        <ProgramDetailModal
          isOpen={showProgramDetailModal}
          onClose={handleCloseDetailModal}
          program={selectedProgram}
          onSaveProgram={handleSaveNewProgram}
          onStartWorkout={handleStartWorkoutFromDetail}
          isEditable={!selectedProgram.is_finalized}
        />
      )}

      {enlargedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            onClick={() => setEnlargedImage(null)}
          >
            <X size={24} />
          </button>
          <img
            src={enlargedImage}
            alt="Увеличенное изображение"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}