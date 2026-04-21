import { ArrowLeft, Check, XCircle, Info, Dumbbell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Exercise, Program } from '../pages/HomePage';

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
  onSaveProgram: (program: Program) => void;
  onStartWorkout?: (program: Program) => void;
  isEditable: boolean;
}

type ExerciseChoice = 'accepted' | 'rejected';

const DIFFICULTY_LEVELS = ['Начинающий', 'Средний', 'Продвинутый'];
const API_URL = 'https://api.snnfitmate.ru';

function getAdjustedSetsReps(exercise: Exercise, difficulty: string) {
  let sets = 2;
  if (difficulty === 'Начинающий') sets = 1;
  if (difficulty === 'Продвинутый') sets = 3;
  const repsStr = String(exercise.reps ?? 15);
  return { sets, reps: repsStr };
}

export default function ProgramDetailModal({
  isOpen,
  onClose,
  program,
  onSaveProgram,
  onStartWorkout,
  isEditable,
}: ProgramDetailModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Средний');
  const [exerciseChoices, setExerciseChoices] = useState<Record<number, ExerciseChoice>>({});
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [imageError, setImageError] = useState(false);

  const availableExercises = program?.exercises || [];

  // Блокировка скролла фона
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !program) return;
    setSelectedDifficulty(program.difficulty || 'Средний');
    setPreviewExercise(null);
    setImageError(false);
    const initialChoices: Record<number, ExerciseChoice> = {};
    availableExercises.forEach((ex) => { initialChoices[ex.id] = 'accepted'; });
    setExerciseChoices(initialChoices);
  }, [isOpen, program]);

  const handleAcceptExercise = (exerciseId: number) => {
    setExerciseChoices((prev) => ({ ...prev, [exerciseId]: 'accepted' }));
  };

  const handleRejectExercise = (exerciseId: number) => {
    setExerciseChoices((prev) => ({ ...prev, [exerciseId]: 'rejected' }));
  };

  const buildUpdatedProgram = (): Program => {
    const acceptedExercises = availableExercises.filter(
      (ex) => exerciseChoices[ex.id] === 'accepted'
    );
    const adaptedExercises = acceptedExercises.map((ex) => {
      const adjusted = getAdjustedSetsReps(ex, selectedDifficulty);
      return { ...ex, sets: adjusted.sets, reps: adjusted.reps };
    });
    return { ...program, difficulty: selectedDifficulty, exercises: adaptedExercises, is_finalized: true };
  };

  const handleSaveSettings = () => {
    const updatedProgram = buildUpdatedProgram();
    if (isEditable && updatedProgram.exercises.length < 5) {
      alert('В программе должно остаться не менее 5 упражнений.');
      return;
    }
    onSaveProgram(updatedProgram);
  };

  const handleStartWorkout = () => {
    if (!isEditable) {
        onStartWorkout?.(buildUpdatedProgram());
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
    return `${API_URL}/${cleanPath}`;
  };
  
  // Закрытие по клику на фон работает только в режиме просмотра
  const handleOverlayClick = () => {
    if (!isEditable) {
      onClose();
    }
  };

  if (!isOpen || !program) return null;

  // PREVIEW упражнения
  if (previewExercise) {
    const adjusted = getAdjustedSetsReps(previewExercise, selectedDifficulty);
    const imageUrl = getImageUrl(
      (previewExercise as any).image || (previewExercise as any).visual_representation
    );

    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-4 pt-4 pb-20"
        onClick={() => setPreviewExercise(null)}
      >
        <div
          className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-96px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative aspect-video bg-green-50 flex items-center justify-center border-b border-gray-100">
            <button
              onClick={() => setPreviewExercise(null)}
              className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm z-10"
            >
              <ArrowLeft size={20} className="text-gray-800" />
            </button>
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={previewExercise.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <Dumbbell size={64} className="text-gray-300 opacity-50" />
            )}
          </div>
          <div className="p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{previewExercise.name}</h2>
            <div className="flex flex-col gap-2 bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
              <div className="flex items-center gap-2">
                <Info size={20} className="text-[#3CAB3C]" />
                <span className="font-bold text-gray-800">
                  Выполнение:{' '}
                  <span className="text-[#3CAB3C]">
                    {adjusted.sets} подх. × {adjusted.reps} повт.
                  </span>
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {previewExercise.description ||
                'Описание временно отсутствует. Выполняйте упражнение технично и без резких рывков.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 pt-4 pb-20"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full max-h-[calc(100vh-96px)] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка — фиксированная, не скроллится */}
        <div className="shrink-0 pt-6 px-6 pb-2 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Кнопка "назад" есть только в режиме просмотра */}
            {!isEditable && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-800">
              {isEditable ? 'Настройки программы' : 'Просмотр программы'}
            </h2>
          </div>
          {/* Крестик есть только в режиме просмотра */}
          {!isEditable && (
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
            </button>
          )}
        </div>

        {/* Контент — скроллится */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">{program.title}</h3>
            <p className="text-sm text-[#3CAB3C] font-medium uppercase tracking-wider">{program.focus}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Сложность</h3>
            <div className="flex gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => isEditable && setSelectedDifficulty(level)}
                  disabled={!isEditable}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedDifficulty === level
                      ? 'bg-[#3CAB3C] text-white shadow-md'
                      : 'bg-gray-100 text-gray-500'
                  } ${!isEditable && selectedDifficulty !== level ? 'opacity-50' : ''}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Упражнения</h3>
            <div className="space-y-2">
              {availableExercises.map((exercise) => {
                const choice = exerciseChoices[exercise.id];
                const adjusted = getAdjustedSetsReps(exercise, selectedDifficulty);

                return (
                  <div
                    key={exercise.id}
                    onClick={() => setPreviewExercise(exercise)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      choice === 'rejected'
                        ? 'border-red-300 bg-red-50'
                        : 'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800 leading-tight truncate">{exercise.name}</div>
                      <div className="text-[11px] font-bold text-[#3CAB3C] mt-1.5">
                        {adjusted.sets} подходов × {adjusted.reps}{' '}
                        {isNaN(Number(adjusted.reps)) ? '' : 'повторений'}
                      </div>
                    </div>

                    {isEditable && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAcceptExercise(exercise.id); }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            choice !== 'rejected'
                              ? 'bg-green-500 text-white'
                              : 'bg-white border border-green-300 text-green-500'
                          }`}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRejectExercise(exercise.id); }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            choice === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-white border border-red-300 text-red-500'
                          }`}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Кнопки — фиксированный футер, всегда виден */}
        <div className="shrink-0 p-4 border-t border-gray-100 flex flex-col gap-2">
          {isEditable && (
            <button
              onClick={handleSaveSettings}
              className="w-full bg-[#3CAB3C] text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all"
            >
              Сохранить и завершить
            </button>
          )}
          {!isEditable && (
             <button
                onClick={handleStartWorkout}
                className="w-full bg-[#3CAB3C] text-white py-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
              >
                Начать тренировку
            </button>
          )}
        </div>
      </div>
    </div>
  );
}