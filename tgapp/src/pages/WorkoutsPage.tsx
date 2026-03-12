import { useState } from 'react';
import { Dumbbell, ArrowLeft, Play } from 'lucide-react';

interface Workout {
  id: number;
  title: string;
  difficulty: string;
  duration: string;
}

interface Exercise {
  id: number;
  name: string;
  description: string;
  image?: string;
}

export default function WorkoutsPage() {
  const [selectedGoal, setSelectedGoal] = useState<'похудение' | 'массонабор' | 'поддержка'>('похудение');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const workoutsByGoal = {
    похудение: [
      { id: 1, title: 'Кардио тренировка', difficulty: 'Средний', duration: '30 мин' },
      { id: 2, title: 'Интервальная', difficulty: 'Сложный', duration: '25 мин' },
      { id: 3, title: 'Жиросжигающая', difficulty: 'Средний', duration: '40 мин' },
      { id: 4, title: 'HIIT тренировка', difficulty: 'Сложный', duration: '20 мин' },
    ],
    массонабор: [
      { id: 5, title: 'Силовая база', difficulty: 'Средний', duration: '45 мин' },
      { id: 6, title: 'Грудь+трицепс', difficulty: 'Средний', duration: '40 мин' },
      { id: 7, title: 'Спина+бицепс', difficulty: 'Средний', duration: '40 мин' },
      { id: 8, title: 'Ноги', difficulty: 'Сложный', duration: '50 мин' },
    ],
    поддержка: [
      { id: 9, title: 'Утренняя зарядка', difficulty: 'Легкий', duration: '15 мин' },
      { id: 10, title: 'Йога', difficulty: 'Легкий', duration: '20 мин' },
      { id: 11, title: 'Стретчинг', difficulty: 'Легкий', duration: '25 мин' },
      { id: 12, title: 'Тонус тела', difficulty: 'Средний', duration: '30 мин' },
    ],
  };

  const getExercisesForWorkout = (workoutId: number): Exercise[] => {
    const exercises: Record<number, Exercise[]> = {
      1: [
        { id: 101, name: 'Бег на месте', description: 'Высоко поднимайте колени', image: '🏃' },
        { id: 102, name: 'Джампинг Джек', description: 'Прыжки с хлопками', image: '🤸' },
        { id: 103, name: 'Бёрпи', description: 'Из положения стоя в упор лежа и обратно', image: '💪' },
      ],
      2: [
        { id: 104, name: 'Приседания', description: 'Держите спину прямо', image: '🦵' },
        { id: 105, name: 'Отжимания', description: 'Опускайтесь полностью', image: '💪' },
      ],
      10: [ 
        { id: 301, name: 'Поза кошки', description: 'На вдохе прогнитесь, на выдохе округлите спину', image: '🐱' },
        { id: 302, name: 'Собака мордой вниз', description: 'Тянитесь пятками к полу', image: '🐕' },
        { id: 303, name: 'Поза ребенка', description: 'Расслабление, глубокое дыхание', image: '🧘' },
      ],
      11: [ 
        { id: 401, name: 'Наклоны вперед', description: 'Тянитесь руками к полу', image: '🧘' },
        { id: 402, name: 'Бабочка', description: 'Соедините стопы, тянитесь коленями к полу', image: '🦋' },
        { id: 403, name: 'Выпады с растяжкой', description: 'Тяните заднюю ногу', image: '🏃' },
      ],
    };
    return exercises[workoutId] || [
      { id: 999, name: 'Упражнение 1', description: 'Описание упражнения', image: '🏋️' },
      { id: 998, name: 'Упражнение 2', description: 'Описание упражнения', image: '🏋️' },
    ];
  };

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
  };

  const handleNextExercise = () => {
    const exercises = getExercisesForWorkout(selectedWorkout?.id || 0);
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  if (selectedWorkout) {
    const exercises = getExercisesForWorkout(selectedWorkout.id);
    const currentExercise = exercises[currentExerciseIndex];

    return (
      <div className="pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedWorkout(null)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{selectedWorkout.title}</h1>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{currentExerciseIndex + 1} / {exercises.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentExerciseIndex + 1) / exercises.length * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <span className="text-8xl opacity-30">{currentExercise.image || '🏋️'}</span>
          </div>

          <div className="p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{currentExercise.name}</h2>
            <p className="text-gray-600 mb-6">{currentExercise.description}</p>

            <div className="flex gap-3">
              <button
                onClick={handlePrevExercise}
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
                onClick={handleNextExercise}
                disabled={currentExerciseIndex === exercises.length - 1}
                className={`flex-1 py-3 rounded-lg font-semibold ${
                  currentExerciseIndex === exercises.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {currentExerciseIndex === exercises.length - 1 ? 'Завершить' : 'Далее'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Тренировки</h1>
      
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setSelectedGoal('похудение')}
          className={`flex-1 py-3 rounded-lg font-medium ${
            selectedGoal === 'похудение' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Похудение
        </button>
        <button 
          onClick={() => setSelectedGoal('массонабор')}
          className={`flex-1 py-3 rounded-lg font-medium ${
            selectedGoal === 'массонабор' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Массонабор
        </button>
        <button 
          onClick={() => setSelectedGoal('поддержка')}
          className={`flex-1 py-3 rounded-lg font-medium ${
            selectedGoal === 'поддержка' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Поддержка формы
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Йога</h2>
        <div 
          onClick={() => handleWorkoutClick(workoutsByGoal.поддержка.find(w => w.title === 'Йога') || workoutsByGoal.поддержка[1])}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="p-3 bg-purple-50 rounded-lg">
            <Dumbbell className="text-purple-500" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Хатха йога</h3>
            <p className="text-sm text-gray-600 mt-1">Поза кошки, собака мордой вниз, поза ребенка</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">Начинающий</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">30 мин</span>
            </div>
          </div>
          <Play size={20} className="text-gray-400" />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Стретчинг</h2>
        <div 
          onClick={() => handleWorkoutClick(workoutsByGoal.поддержка.find(w => w.title === 'Стретчинг') || workoutsByGoal.поддержка[2])}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="p-3 bg-green-50 rounded-lg">
            <Dumbbell className="text-green-500" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Растяжка для всего тела</h3>
            <p className="text-sm text-gray-600 mt-1">Наклоны вперед, бабочка, выпады с растяжкой</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">Начинающий</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">25 мин</span>
            </div>
          </div>
          <Play size={20} className="text-gray-400" />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-2 mt-6">Рекомендуемые тренировки</h2>
      <div className="space-y-3">
        {workoutsByGoal[selectedGoal]
          .filter(w => w.title !== 'Йога' && w.title !== 'Стретчинг')
          .map((workout) => (
            <div 
              key={workout.id}
              onClick={() => handleWorkoutClick(workout)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-blue-50 rounded-lg">
                <Dumbbell className="text-blue-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{workout.title}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{workout.difficulty}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{workout.duration}</span>
                </div>
              </div>
              <Play size={20} className="text-gray-400" />
            </div>
          ))}
      </div>
    </div>
  );
}