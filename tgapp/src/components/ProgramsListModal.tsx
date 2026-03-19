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
    }
  ]);

  const handleDeleteProgram = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMyPrograms(myPrograms.filter(program => program.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 px-6 pb-2 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Мои программы</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {myPrograms.length > 0 ? (
            <div className="space-y-3">
              {myPrograms.map((program) => (
                <div 
                  key={program.id}
                  onClick={() => {
                    onSelectProgram(program);
                    onClose();
                  }}
                  className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-[#3CAB3C] transition-all relative group"
                >
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Dumbbell className="text-[#3CAB3C]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{program.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 flex items-center gap-1">
                        <Clock size={10} /> {program.duration}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-orange-50 rounded-full text-orange-600 flex items-center gap-1">
                        <Flame size={10} /> {program.calories} ккал
                      </span>
                    </div>
                    
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteProgram(program.id, e)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                    <Play size={18} className="text-gray-300 group-hover:text-[#3CAB3C] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">Список программ пуст</p>
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={onClose}
                  className="w-1/2 bg-[#3CAB3C] text-white py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
                >
                  Создать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}