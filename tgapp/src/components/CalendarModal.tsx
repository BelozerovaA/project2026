import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('');
  const [selectedIndividualWorkout, setSelectedIndividualWorkout] = useState<string>('');
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  
  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7);
    
    return daysOfWeek.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      return {
        day: daysOfWeek[index],
        dayNumber: date.getDate(),
        month: months[date.getMonth()],
        fullDate: date,
        isPast: compareDate < todayDate,
        isToday: compareDate.getTime() === todayDate.getTime()
      };
    });
  };

  const weekDates = getWeekDates();

  const toggleDay = (dayStr: string) => {
    if (selectedDays.includes(dayStr)) {
      setSelectedDays(selectedDays.filter(d => d !== dayStr));
    } else {
      setSelectedDays([...selectedDays, dayStr]);
    }
  };

  const workoutTypes = [
    { id: 'yoga', name: 'Йога' },
    { id: 'stretching', name: 'Стретчинг' },
    { id: 'cardio', name: 'Кардио' },
    { id: 'strength', name: 'Силовая' },
    { id: 'hiit', name: 'HIIT' },
  ];

  const individualWorkouts = [
    { id: 'morning', name: 'Утренняя зарядка' },
    { id: 'fullbody', name: 'Full body' },
    { id: 'upper', name: 'Upper body' },
    { id: 'lower', name: 'Lower body' },
    { id: 'core', name: 'Core тренировка' },
  ];

  const handleWorkoutTypeSelect = (typeId: string) => {
    const workout = workoutTypes.find(w => w.id === typeId);
    if (!workout) return;
    
    if (selectedWorkoutType === typeId) {
      setSelectedWorkoutType('');
      setSelectedWorkouts(selectedWorkouts.filter(w => w !== workout.name));
    } else {
      if (selectedWorkoutType) {
        const oldWorkout = workoutTypes.find(w => w.id === selectedWorkoutType);
        if (oldWorkout) {
          setSelectedWorkouts(selectedWorkouts.filter(w => w !== oldWorkout.name));
        }
      }
      setSelectedWorkoutType(typeId);
      setSelectedWorkouts([...selectedWorkouts.filter(w => w !== workout.name), workout.name]);
    }
  };

  const handleIndividualWorkoutSelect = (workoutId: string) => {
    const workout = individualWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    if (selectedIndividualWorkout === workoutId) {
      setSelectedIndividualWorkout('');
      setSelectedWorkouts(selectedWorkouts.filter(w => w !== workout.name));
    } else {
      if (selectedIndividualWorkout) {
        const oldWorkout = individualWorkouts.find(w => w.id === selectedIndividualWorkout);
        if (oldWorkout) {
          setSelectedWorkouts(selectedWorkouts.filter(w => w !== oldWorkout.name));
        }
      }
      setSelectedIndividualWorkout(workoutId);
      setSelectedWorkouts([...selectedWorkouts.filter(w => w !== workout.name), workout.name]);
    }
  };

  const handleRemoveWorkout = (workout: string) => {
    setSelectedWorkouts(selectedWorkouts.filter(w => w !== workout));
    
    const workoutType = workoutTypes.find(w => w.name === workout);
    if (workoutType && selectedWorkoutType === workoutType.id) {
      setSelectedWorkoutType('');
    }
    
    const individualWorkout = individualWorkouts.find(w => w.name === workout);
    if (individualWorkout && selectedIndividualWorkout === individualWorkout.id) {
      setSelectedIndividualWorkout('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Календарь тренировок</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentWeek(prev => prev - 1)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title="Предыдущая неделя"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium text-gray-700">
              {weekDates[0].dayNumber} {weekDates[0].month} - {weekDates[6].dayNumber} {weekDates[6].month}
            </span>
            <button 
              onClick={() => setCurrentWeek(prev => prev + 1)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title="Следующая неделя"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDates.map((day, idx) => {
              const dayStr = `${day.day} ${day.dayNumber}`;
              
              return (
                <button
                  key={idx}
                  onClick={() => !day.isPast && toggleDay(dayStr)}
                  disabled={day.isPast}
                  className={`p-2 rounded-lg flex flex-col items-center font-medium ${
                    day.isPast 
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500' 
                      : selectedDays.includes(dayStr)
                        ? 'bg-blue-500 text-white shadow-md'
                        : day.isToday
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <span className="text-xs">{day.day}</span>
                  <span className="font-semibold">{day.dayNumber}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Вид тренировки</h3>
            <div className="flex flex-wrap gap-2">
              {workoutTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleWorkoutTypeSelect(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedWorkoutType === type.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Индивидуальная тренировка</h3>
            <select
              value={selectedIndividualWorkout}
              onChange={(e) => handleIndividualWorkoutSelect(e.target.value)}
              className="w-full p-3 border-2 border-blue-300 rounded-lg bg-white focus:border-blue-500 focus:outline-none text-gray-700 font-medium"
            >
              <option value="" className="text-gray-500">Выберите тренировку</option>
              {individualWorkouts.map(workout => (
                <option key={workout.id} value={workout.id} className="text-gray-700">
                  {workout.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Выбранные тренировки:</h3>
            {selectedWorkouts.length > 0 ? (
              <div className="space-y-2">
                {selectedWorkouts.map((workout, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-gray-700 font-medium">{workout}</span>
                    <button
                      onClick={() => handleRemoveWorkout(workout)}
                      className="text-red-500 text-sm px-3 py-1 hover:bg-red-100 rounded-lg transition-colors font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm bg-gray-50 p-3 rounded-lg">Тренировки не выбраны</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Рекомендации</h3>
            <p className="text-sm text-blue-700">
              Чередуйте силовые и кардио тренировки. 
              Добавляйте йогу или стретчинг в дни отдыха.
              Для начинающих: 2-3 тренировки в неделю.
              Оптимально: 3 силовых + 2 кардио + 1 растяжка.
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedDays.length > 0 && selectedWorkouts.length > 0) {
                alert(`Расписание сохранено!\nДни: ${selectedDays.join(', ')}\nТренировки: ${selectedWorkouts.join(', ')}`);
                onClose();
              } else {
                alert('Выберите дни и тренировки');
              }
            }}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}