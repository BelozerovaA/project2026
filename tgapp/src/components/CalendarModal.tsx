import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready(): void;
        initData: string;
        colorScheme?: 'light';
        setHeaderColor(color: string): void;
        setBackgroundColor(color: string): void;
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
      };
    };
  }
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IndividualWorkout {
  id: number;
  name: string;
}

interface SavedWorkout {
  schedule_id: number;
  workout_name: string;
  planned_date: string;
  category_id: number | null;
  program_id: number | null;
}

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [individualWorkouts, setIndividualWorkouts] = useState<IndividualWorkout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
  const [savedSchedule, setSavedSchedule] = useState<SavedWorkout[]>([]);
  const [toDelete, setToDelete] = useState<number[]>([]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    if (!isOpen) {
      setSelectedDays([]);
      setSelectedWorkoutIds([]);
      setCurrentWeek(0);
      setShowSuccess(false);
      setIsSaving(false);
      setSavedSchedule([]);
      setToDelete([]);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadIndividualWorkouts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedDays.length > 0) {
      loadSavedSchedule();
    }
  }, [isOpen, selectedDays]);

  const loadIndividualWorkouts = async () => {
    try {
      const initData = window.Telegram?.WebApp?.initData || '';
      const response = await fetch('https://api.snnfitmate.ru/user-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData })
      });

      if (response.ok) {
        const data = await response.json();
        setIndividualWorkouts(data.workouts || []);
      } else {
        setIndividualWorkouts([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки тренировок:', error);
      setIndividualWorkouts([]);
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  const weekDates = useMemo(() => {
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
  }, [currentWeek]);

  const loadSavedSchedule = async () => {
    if (selectedDays.length === 0) return;

    try {
      const initData = window.Telegram?.WebApp?.initData || '';
      const dates = selectedDays.map(dayStr => {
        const [dayName, dayNumber] = dayStr.split(' ');
        const weekDate = weekDates.find(d => d.day === dayName && d.dayNumber === parseInt(dayNumber));
        if (!weekDate) return '';
        const monthIndex = months.indexOf(weekDate.month);
        const year = new Date().getFullYear();
        const month = String(monthIndex + 1).padStart(2, '0');
        const day = String(dayNumber).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }).filter(Boolean);

      const response = await fetch('https://api.snnfitmate.ru/get-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: initData, dates })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedSchedule(data.schedule || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
    }
  };

  const toggleDay = (dayStr: string) => {
    setSelectedDays(prev => prev.includes(dayStr) ? prev.filter(d => d !== dayStr) : [...prev, dayStr]);
  };

  const groupWorkouts = [
    { id: 'yoga', name: 'Йога', categoryId: 1 },
    { id: 'arms', name: 'Руки', categoryId: 2 },
    { id: 'stretching', name: 'Стретчинг', categoryId: 3 },
    { id: 'back', name: 'Спина', categoryId: 4 },
    { id: 'legs', name: 'Ноги', categoryId: 5 },
    { id: 'fullbody', name: 'Все тело', categoryId: 6 },
  ];

  const toggleWorkout = (id: string) => {
    setSelectedWorkoutIds(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const removeWorkout = (id: string) => {
    setSelectedWorkoutIds(prev => prev.filter(w => w !== id));
  };

  const markForDeletion = (scheduleId: number) => {
    setToDelete(prev => [...prev, scheduleId]);
  };

  const cancelDeletion = (scheduleId: number) => {
    setToDelete(prev => prev.filter(id => id !== scheduleId));
  };

  const getSelectedWorkoutObjects = () => {
    const groupSelected = groupWorkouts.filter(w => selectedWorkoutIds.includes(w.id));
    const individualSelected = individualWorkouts.filter(w => selectedWorkoutIds.includes(`ind_${w.id}`));
    return [...groupSelected, ...individualSelected.map(w => ({ id: `ind_${w.id}`, name: w.name, isIndividual: true }))];
  };

  const selectedWorkoutObjects = getSelectedWorkoutObjects();

  const handleSave = async () => {
    if (selectedDays.length === 0 && toDelete.length === 0) {
      alert("Выберите дни или тренировки для отмены");
      return;
    }

    setIsSaving(true);

    try {
      const dates = selectedDays.map(dayStr => {
        const [dayName, dayNumber] = dayStr.split(' ');
        const weekDate = weekDates.find(d => d.day === dayName && d.dayNumber === parseInt(dayNumber));
        if (!weekDate) return '';

        const monthIndex = months.indexOf(weekDate.month);
        const year = new Date().getFullYear();
        const month = String(monthIndex + 1).padStart(2, '0');
        const day = String(dayNumber).padStart(2, '0');

        return `${year}-${month}-${day}`;
      }).filter(Boolean);

      const initData = window.Telegram?.WebApp?.initData || '';

      const response = await fetch('https://api.snnfitmate.ru/save-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_data: initData,
          days: dates,
          workoutIds: selectedWorkoutIds,
          deleteIds: toDelete.length > 0 ? toDelete : undefined
        })
      });

      if (response.ok) {
        setIsSaving(false);
        setShowSuccess(true);
        setToDelete([]);
        setTimeout(() => onClose(), 1500);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error(error);
      alert('Не удалось сохранить расписание');
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 pt-4 pb-20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[calc(100vh-96px)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка — фиксированная, не скроллится */}
        <div className="shrink-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Календарь</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Контент — скроллится */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-4">
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
              <span className="text-green-700 font-medium text-sm">План успешно сохранён!</span>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setCurrentWeek(prev => prev - 1)}
              className="p-1.5 bg-[#3CAB3C] text-white rounded-full disabled:opacity-50"
              disabled={showSuccess || isSaving}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-bold text-gray-700 text-sm">
              {weekDates[0].dayNumber} {weekDates[0].month} – {weekDates[6].dayNumber} {weekDates[6].month}
            </span>
            <button
              onClick={() => setCurrentWeek(prev => prev + 1)}
              className="p-1.5 bg-[#3CAB3C] text-white rounded-full disabled:opacity-50"
              disabled={showSuccess || isSaving}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((day, idx) => {
              const dayStr = `${day.day} ${day.dayNumber}`;
              const isSelected = selectedDays.includes(dayStr);
              return (
                <button
                  key={idx}
                  onClick={() => !day.isPast && !showSuccess && !isSaving && toggleDay(dayStr)}
                  disabled={day.isPast || showSuccess || isSaving}
                  className={`py-2 rounded-lg flex flex-col items-center text-[10px] border transition-all ${
                    day.isPast ? 'bg-gray-50 text-gray-300 border-transparent' :
                    isSelected ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]' :
                    day.isToday ? 'bg-green-50 text-[#3CAB3C] border-green-200' : 'bg-white text-gray-600 border-gray-100'
                  } ${showSuccess || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="font-medium">{day.day}</span>
                  <span className="font-bold text-xs">{day.dayNumber}</span>
                </button>
              );
            })}
          </div>

          {/* Сохранённые тренировки */}
          {savedSchedule.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 text-xs mb-1">Запланировано:</h3>
              <div className="space-y-1">
                {savedSchedule.map((item) => {
                  const isMarkedForDeletion = toDelete.includes(item.schedule_id);

                  return (
                    <div
                      key={item.schedule_id}
                      className={`flex items-center justify-between p-2 border rounded-lg ${
                        isMarkedForDeletion
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-100'
                      }`}
                    >
                      <span className={`text-[11px] font-medium ${
                        isMarkedForDeletion ? 'text-red-700 line-through' : 'text-gray-700'
                      }`}>
                        {item.workout_name} • {item.planned_date}
                      </span>

                      {isMarkedForDeletion ? (
                        <button
                          onClick={() => cancelDeletion(item.schedule_id)}
                          className="text-green-600 text-[10px] font-medium px-2 py-1 bg-green-100 rounded"
                        >
                          Отмена
                        </button>
                      ) : (
                        <button
                          onClick={() => markForDeletion(item.schedule_id)}
                          className="text-red-400 p-0.5 hover:text-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-800 text-xs mb-1">Вид тренировки</h3>
            <div className="flex flex-wrap gap-1">
              {groupWorkouts.map(type => (
                <button
                  key={type.id}
                  onClick={() => !showSuccess && !isSaving && toggleWorkout(type.id)}
                  disabled={showSuccess || isSaving}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                    selectedWorkoutIds.includes(type.id)
                      ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]'
                      : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                  } ${showSuccess || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 text-xs mb-1">Индивидуальная программа</h3>
            {isLoadingWorkouts ? (
              <div className="text-center py-3 text-gray-400 text-xs">Загрузка...</div>
            ) : individualWorkouts.length === 0 ? (
              <div className="bg-[#F2FAF2] border border-[#D0E7D0] rounded-lg p-3 text-center">
                <p className="text-[11px] text-[#3CAB3C]">
                  ⚠️ У вас нет личных программ.<br/>Пройдите тест для составления.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {individualWorkouts.map(item => (
                  <button
                    key={item.id}
                    onClick={() => !showSuccess && !isSaving && toggleWorkout(`ind_${item.id}`)}
                    disabled={showSuccess || isSaving}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      selectedWorkoutIds.includes(`ind_${item.id}`)
                        ? 'bg-[#3CAB3C] text-white border-[#3CAB3C]'
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                    } ${showSuccess || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedWorkoutObjects.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 text-xs mb-1">Выбрано:</h3>
              <div className="space-y-1">
                {selectedWorkoutObjects.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-lg">
                    <span className="text-[11px] text-gray-700 font-medium">{workout.name}</span>
                    <button
                      onClick={() => removeWorkout(workout.id)}
                      disabled={showSuccess || isSaving}
                      className="text-red-400 p-0.5 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#F2FAF2] p-3 rounded-lg border border-[#D0E7D0]">
            <p className="text-[11px] text-[#3E6B3E] leading-tight font-medium">
              3 силовых + 2 кардио — идеальный баланс для здоровья.
            </p>
          </div>
        </div>

        {/* Футер с кнопкой — всегда виден, не скроллится */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <button
            onClick={handleSave}
            disabled={isSaving || showSuccess || (selectedWorkoutIds.length === 0 && toDelete.length === 0)}
            className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
              showSuccess
                ? 'bg-green-600 text-white'
                : isSaving
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-[#3CAB3C] text-white active:scale-95'
            } ${selectedWorkoutIds.length === 0 && toDelete.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {showSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-green-600 text-xs">✓</span> Сохранено!
              </span>
            ) : isSaving ? (
              'Сохранение...'
            ) : toDelete.length > 0 ? (
              `Сохранить (${toDelete.length} на удаление)`
            ) : (
              'Сохранить план'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}