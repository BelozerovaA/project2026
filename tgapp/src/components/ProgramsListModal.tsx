import { X, Dumbbell, Play, Trash2, Clock, Flame } from 'lucide-react';
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

interface ProgramsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProgram: (program: Program) => void;
}

export default function ProgramsListModal({ isOpen, onClose, onSelectProgram }: ProgramsListModalProps) {
  const [myPrograms, setMyPrograms] = useState<Program[]>([
    {
      id: 1,
      title: 'Утренняя зарядка',
      difficulty: 'Начинающий',
      duration: '15 мин',
      calories: 120,
      focus: 'Все тело',
      exercises: [
        { id: 101, name: 'Наклоны головы', description: 'Медленные наклоны головы вправо-влево, вперед-назад', image: '🧘', sets: 1, reps: '10 раз' },
        { id: 102, name: 'Вращения плечами', description: 'Вращайте плечами вперед и назад', image: '🏋️', sets: 1, reps: '15 раз' },
        { id: 103, name: 'Махи руками', description: 'Махи руками в стороны и вверх', image: '🤸', sets: 1, reps: '20 раз' },
      ]
    },
    {
      id: 2,
      title: 'Силовая тренировка',
      difficulty: 'Средний',
      duration: '30 мин',
      calories: 250,
      focus: 'Руки и плечи',
      exercises: [
        { id: 201, name: 'Отжимания', description: 'Классические отжимания, держите спину прямой', image: '💪', sets: 3, reps: '12 раз' },
        { id: 202, name: 'Подтягивания', description: 'Подтягивания широким хватом', image: '🏋️', sets: 3, reps: '8 раз' },
        { id: 203, name: 'Жим гантелей', description: 'Жим гантелей сидя', image: '🏋️', sets: 3, reps: '10 раз' },
      ]
    },
    {
      id: 3,
      title: 'Йога для расслабления',
      difficulty: 'Начинающий',
      duration: '20 мин',
      calories: 80,
      focus: 'Гибкость',
      exercises: [
        { id: 301, name: 'Поза кошки', description: 'На вдохе прогнитесь, на выдохе округлите спину', image: '🐱', sets: 1, reps: '10 раз' },
        { id: 302, name: 'Собака мордой вниз', description: 'Тянитесь пятками к полу', image: '🐕', sets: 1, reps: '30 сек' },
        { id: 303, name: 'Поза ребенка', description: 'Расслабление, глубокое дыхание', image: '🧘', sets: 1, reps: '30 сек' },
      ]
    },
  ]);

  const handleDeleteProgram = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMyPrograms(myPrograms.filter(program => program.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Мои программы</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {myPrograms.length > 0 ? (
            <div className="space-y-4">
              {myPrograms.map((program) => (
                <div 
                  key={program.id}
                  onClick={() => {
                    onSelectProgram(program);
                    onClose();
                  }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow relative group"
                >
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Dumbbell className="text-blue-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{program.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 flex items-center gap-1">
                        <Clock size={12} /> {program.duration}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {program.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 bg-orange-100 rounded-full text-orange-600 flex items-center gap-1">
                        <Flame size={12} /> {program.calories} ккал
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{program.focus}</p>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteProgram(program.id, e)}
                    className="absolute top-2 right-2 p-2 bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить программу"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                  
                  <Play size={20} className="text-gray-400 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500">У вас пока нет составленных программ</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
              >
                Составить программу
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}