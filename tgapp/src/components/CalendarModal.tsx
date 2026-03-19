import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    if (!isOpen) {
      setSelectedDays([]);
      setSelectedWorkoutType('');
      setSelectedIndividualWorkout('');
      setSelectedWorkouts([]);
      setCurrentWeek(0);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) + currentWeek * 7;
    startOfWeek.setDate(diff);
    
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
        isPast: compareDate < todayDate,
        isToday: compareDate.getTime() === todayDate.getTime()
      };
    });
  };

  const weekDates = getWeekDates();

  const toggleDay = (dayStr: string) => {
    setSelectedDays(prev => prev.includes(dayStr) ? prev.filter(d => d !== dayStr) : [...prev, dayStr]);
  };

  const workoutTypes = [
    { id: 'yoga', name: 'Йога' },
    { id: 'stretching', name: 'Стретчинг' },
    { id: 'fullbody', name: 'Все тело' },
    { id: 'arms', name: 'Руки' },
    { id: 'legs', name: 'Ноги' },
    { id: 'back', name: 'Спина' },
  ];

  const individualWorkouts = [
    { id: 'morning', name: 'Утренняя зарядка' },
    { id: 'hiit', name: 'HIIT интенсив' },
    { id: 'cardio', name: 'Кардио сессия' },
    { id: 'abs', name: 'Пресс' },
  ];

  const handleWorkoutTypeSelect = (typeId: string) => {
    const workout = workoutTypes.find(w => w.id === typeId);
    if (!workout) return;
    
    if (selectedWorkoutType === typeId) {
      setSelectedWorkoutType('');
      setSelectedWorkouts(prev => prev.filter(w => w !== workout.name));
    } else {
      let updated = selectedWorkouts.filter(w => !workoutTypes.some(wt => wt.name === w));
      setSelectedWorkoutType(typeId);
      setSelectedWorkouts([...updated, workout.name]);
    }
  };

  const handleIndividualSelect = (val: string) => {
    const workout = individualWorkouts.find(w => w.id === val);
    if (!workout) return;

    if (selectedIndividualWorkout === val) {
      setSelectedIndividualWorkout('');
      setSelectedWorkouts(prev => prev.filter(w => w !== workout.name));
    } else {
      let updated = selectedWorkouts.filter(w => !individualWorkouts.some(iw => iw.name === w));
      setSelectedIndividualWorkout(val);
      setSelectedWorkouts([...updated, workout.name]);
    }
  };

  const removeWorkout = (name: string) => {
    setSelectedWorkouts(prev => prev.filter(w => w !== name));
    if (workoutTypes.find(t => t.name === name)?.id === selectedWorkoutType) setSelectedWorkoutType('');
    if (individualWorkouts.find(i => i.name === name)?.id === selectedIndividualWorkout) setSelectedIndividualWorkout('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md flex flex-col overflow-hidden shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-gray-100 p-3 text-center">
          <h2 className="text-lg font-bold text-gray-800">Календарь</h2>
        </div>

        <div className="p-3 space-y-3 overflow-y-auto">
          {/* Навигация */}
          <div className="flex items-center justify-between px-1">
            <button onClick={() => setCurrentWeek(prev => prev - 1)} className="p-1.5 bg-[#3CAB3C] text-white rounded-full"><ChevronLeft size={18} /></button>
            <span className="font-bold text-gray-700 text-sm">
              {weekDates[0].dayNumber} {weekDates[0].month} – {weekDates[6].dayNumber} {weekDates[6].month}
            </span>
            <button onClick={() => setCurrentWeek(prev => prev + 1)} className="p-1.5 bg-[#3CAB3C] text-white rounded-full"><ChevronRight size={18} /></button>
          </div>

          {/* Календарь */}
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((day, idx) => {
              const dayStr = `${day.day} ${day.dayNumber}`;
              const isSelected = selectedDays.includes(dayStr);
              return (
                <button
                  key={idx}
                  onClick={() => !day.isPast && toggleDay(dayStr)}
                  disabled={day.isPast}
                  className={`py-2 rounded-lg flex flex-col items-center text-[10px] border transition-all ${
                    day.isPast ? 'bg-gray-50 text-gray-300 border-transparent' : 
                    isSelected ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' :
                    day.isToday ? 'bg-green-50 text-[#3CAB3C] border-green-200' : 'bg-white text-gray-600 border-gray-100'
                  }`}
                >
                  <span className="font-medium">{day.day}</span>
                  <span className="font-bold text-xs">{day.dayNumber}</span>
                </button>
              );
            })}
          </div>

          {/* Вид тренировки - Минимальный отступ mb-1 */}
          <div>
            <h3 className="font-semibold text-gray-800 text-xs mb-1">Вид тренировки</h3>
            <div className="flex flex-wrap gap-1">
              {workoutTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleWorkoutTypeSelect(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border ${
                    selectedWorkoutType === type.id ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Индивидуальный план - Минимальный отступ mb-1 */}
          <div>
            <h3 className="font-semibold text-gray-800 text-xs mb-1">Индивидуальный план</h3>
            <select
              value={selectedIndividualWorkout}
              onChange={(e) => handleIndividualSelect(e.target.value)}
              className="w-full p-2 border border-gray-100 rounded-lg bg-gray-50 text-xs text-gray-700 outline-none"
            >
              <option value="">Выберите программу</option>
              {individualWorkouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {/* ВЫБРАННЫЕ (Возвращенный блок) - Минимальный отступ mb-1 */}
          {selectedWorkouts.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 text-xs mb-1">Выбрано:</h3>
              <div className="space-y-1">
                {selectedWorkouts.map((workout, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-lg">
                    <span className="text-[11px] text-gray-700 font-medium">{workout}</span>
                    <button onClick={() => removeWorkout(workout)} className="text-red-400 p-0.5"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Рекомендации */}
          <div className="bg-[#F2FAF2] p-3 rounded-lg border border-[#D0E7D0]">
            <p className="text-[11px] text-[#3E6B3E] leading-tight font-medium">
              3 силовых + 2 кардио — идеальный баланс для здоровья.
            </p>
          </div>

          <button
            onClick={() => {
              if (selectedDays.length > 0 && selectedWorkouts.length > 0) onClose();
              else alert("Выберите дни и тренировки");
            }}
            className="w-full bg-[#3CAB3C] text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            Сохранить план
          </button>
        </div>
      </div>
    </div>
  );
}