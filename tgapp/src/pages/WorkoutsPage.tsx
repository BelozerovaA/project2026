import { useState, useEffect } from 'react';
import { Dumbbell, ArrowLeft, Play, Info, Sparkles, Loader2, Timer, X } from 'lucide-react';

interface Workout {
  id: number;
  title: string;
  difficulty: string;
  duration: string;
}

interface WorkoutSection {
  sectionTitle: string;
  workouts: Workout[];
}

interface Exercise {
  id: number;
  name: string;
  description: string;
  visual_representation?: string;
  execution?: string;
  repetitions?: number;
  composition_number?: number;
  composition_duration?: string;
}

const API_URL = 'https://api.snnfitmate.ru'; 

export default function WorkoutsPage() {
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const [workoutsByGoal, setWorkoutsByGoal] = useState<Record<string, WorkoutSection[]>>({});
  const [currentWorkoutExercises, setCurrentWorkoutExercises] = useState<Exercise[]>([]);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [userGender, setUserGender] = useState<'female' | 'male'>('female');
  const [userAgeGroup, setUserAgeGroup] = useState<'20-30' | '30-40'>('20-30');

  // Стейт для увеличенной картинки
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Сохранение позиции скролла при переходе в тренировку
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const initData = async () => {
      try {
        // @ts-ignore
        const tgInitData = window.Telegram?.WebApp?.initData || "";
        
        const profileRes = await fetch(`${API_URL}/telegram/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ init_data: tgInitData }),
        });
        
        if (profileRes.ok) {
          const data = await profileRes.json();
          setUserGender(data.profile?.gender === 'Мужской' ? 'male' : 'female');
          const ageMatch = (data.profile?.age || "").match(/\d+/);
          if (ageMatch) {
            setUserAgeGroup(parseInt(ageMatch[0], 10) > 30 ? '30-40' : '20-30');
          }
        }
        setIsLoadingProfile(false);

        const workoutsRes = await fetch(`${API_URL}/workouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ init_data: tgInitData })
        });
        
        if (workoutsRes.ok) {
          const data = await workoutsRes.json();
          setWorkoutsByGoal(data.workouts || {});
          
          if (data.workouts && Object.keys(data.workouts).length > 0) {
            setSelectedGoal(Object.keys(data.workouts)[0]);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setIsLoadingWorkouts(false);
      }
    };

    initData();
  }, []);

  const handleWorkoutClick = async (workout: Workout) => {
    // Сохраняем текущую позицию скролла перед переходом
    setScrollPosition(window.scrollY);
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
    setIsLoadingExercises(true);
    setImageError(false);
    window.scrollTo(0, 0);

    try {
      const response = await fetch(`${API_URL}/workout-exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          training_id: workout.id,
          gender: userGender,
          age_group: userAgeGroup
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const sortedExercises = (data.exercises || []).sort((a: Exercise, b: Exercise) => 
          (a.composition_number || 0) - (b.composition_number || 0)
        );
        setCurrentWorkoutExercises(sortedExercises);
      } else {
        setCurrentWorkoutExercises([]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке упражнений из БД:", error);
      setCurrentWorkoutExercises([]);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const handleBackToList = () => {
    setSelectedWorkout(null);
    // Восстанавливаем позицию скролла после возврата
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < currentWorkoutExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setImageError(false);
    } else {
      handleBackToList();
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setImageError(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath || imagePath.trim() === '') return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
    return `${API_URL}/${cleanPath}`;
  };

  if (isLoadingProfile || isLoadingWorkouts) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded-xl w-full mb-6"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded-xl w-full"></div>
      </div>
    );
  }

  if (selectedWorkout) {
    if (isLoadingExercises) {
      return (
        <div className="py-32 flex flex-col items-center justify-center gap-4 text-gray-500">
          <Loader2 className="animate-spin text-[#3CAB3C]" size={48} />
          <p className="font-medium">Собираем программу...</p>
        </div>
      );
    }

    const currentExercise = currentWorkoutExercises[currentExerciseIndex];
    const imageUrl = getImageUrl(currentExercise?.visual_representation);

    return (
      <div className="pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBackToList} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 leading-tight">{selectedWorkout.title}</h1>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1 font-medium">
            <span>Упражнение {currentExerciseIndex + 1} из {currentWorkoutExercises.length}</span>
            <span>{Math.round(((currentExerciseIndex + 1) / currentWorkoutExercises.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#3CAB3C] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentExerciseIndex + 1) / currentWorkoutExercises.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="aspect-video bg-green-50 flex flex-col items-center justify-center relative overflow-hidden border-b border-gray-100">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={currentExercise.name}
                className="w-full h-full object-contain p-2 cursor-pointer hover:scale-105 transition-transform duration-300" 
                onClick={() => setEnlargedImage(imageUrl)}
                onError={() => setImageError(true)} 
              />
            ) : (
              <div className="flex flex-col items-center text-green-300">
                <Dumbbell size={64} className="mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Упражнение {currentExerciseIndex + 1}
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentExercise.name}</h2>

            <div className="flex flex-col gap-2 bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
              <div className="flex items-center gap-2">
                <Info size={20} className="text-[#3CAB3C]" />
                <span className="font-bold text-gray-800">
                  {currentExercise.execution || 'Выполнение:'}
                  {currentExercise.repetitions ? (
                    <> • <span className="text-[#3CAB3C]">{currentExercise.repetitions} раз(а)</span></>
                  ) : null}
                </span>
              </div>

              {currentExercise.composition_duration && currentExercise.composition_duration !== '0' && (
                <div className="flex items-center gap-2 mt-1">
                  <Timer size={18} className="text-[#3CAB3C]" />
                  <span className="text-gray-700 text-sm font-medium">
                    Время: {currentExercise.composition_duration}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed text-sm whitespace-pre-wrap">
              {currentExercise.description || "Повторяйте движения технично."}
            </p>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={handlePrevExercise}
                disabled={currentExerciseIndex === 0}
                className={`flex-1 py-4 rounded-xl font-bold cursor-pointer transition-colors ${currentExerciseIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Назад
              </button>
              <button
                onClick={handleNextExercise}
                className={`flex-1 py-4 rounded-xl font-bold cursor-pointer transition-colors shadow-sm ${currentExerciseIndex === currentWorkoutExercises.length - 1
                  ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
                  : 'bg-[#3CAB3C] text-white hover:bg-[#2e8b2e] shadow-green-200'
                  }`}
              >
                {currentExerciseIndex === currentWorkoutExercises.length - 1 ? 'Завершить' : 'Далее'}
              </button>
            </div>
          </div>
        </div>

        {/* Оверлей для просмотра увеличенной картинки */}
        {enlargedImage && (
          <div 
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
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
      </div>
    );
  }

  const currentSections = workoutsByGoal[selectedGoal] || [];
  const availableGoals = Object.keys(workoutsByGoal);

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Тренировки</h1>
        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
          <Sparkles size={18} />
          <span>
            Адаптация: {userGender === 'male' ? 'Мужчины' : 'Женщины'} ({userAgeGroup} лет)
          </span>
        </div>
      </div>

      {availableGoals.length > 0 && (
        <div className="flex p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto hide-scrollbar">
          {availableGoals.map((goal) => (
            <button
              key={goal}
              onClick={() => setSelectedGoal(goal)}
              className={`flex-1 min-w-[120px] py-3 px-2 rounded-lg font-medium text-sm transition-all capitalize ${selectedGoal === goal
                ? 'bg-white text-[#3CAB3C] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {goal}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {currentSections.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 bg-gray-50 p-6 rounded-2xl">
            Тренировки для этой цели скоро появятся!
          </div>
        ) : (
          currentSections.map((section) => (
            <div key={section.sectionTitle}>
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#3CAB3C] rounded-full"></div>
                {section.sectionTitle}
              </h2>
              <div className="space-y-3">
                {section.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => handleWorkoutClick(workout)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-[#3CAB3C] hover:shadow-md transition-all active:scale-[0.98] group"
                  >
                    <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#3CAB3C] transition-colors">
                      <Dumbbell className="text-[#3CAB3C] group-hover:text-white transition-colors" size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 leading-tight text-sm mb-2 line-clamp-2">
                        {workout.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap mt-1">
                        <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap">
                          {workout.difficulty || "Средний"}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full whitespace-nowrap">
                          {workout.duration || "25 мин"}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors shrink-0">
                      <Play size={18} className="text-gray-400 group-hover:text-[#3CAB3C] ml-0.5 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}