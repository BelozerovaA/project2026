import { X, Dumbbell, Play, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import type { Program } from '../pages/HomePage';

interface ProgramsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProgram: (program: Program) => void;
  onStartWorkout: (program: Program) => void; // ← новый проп: кнопка ▷
  programs: Program[];
  onDeleteProgram: (id: number) => void;
  onOpenCreate: () => void;
}

export default function ProgramsListModal({
  isOpen,
  onClose,
  onSelectProgram,
  onStartWorkout,
  programs,
  onDeleteProgram,
  onOpenCreate,
}: ProgramsListModalProps) {
  // Блокировка скролла фона
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 px-6 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Мои программы</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {programs.length > 0 ? (
            <div className="space-y-3">
              {programs.map((program) => (
                <div
                  key={program.id}
                  onClick={() => onSelectProgram(program)}
                  className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-[#3CAB3C] transition-all relative group shadow-sm hover:shadow-md"
                >
                  <div className="p-3 bg-green-50 rounded-lg shrink-0">
                    <Dumbbell className="text-[#3CAB3C]" size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate mb-1.5">{program.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 font-medium">
                        {program.difficulty}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-green-50 rounded-full text-[#3CAB3C] font-medium uppercase">
                        {program.focus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteProgram(program.id); }}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                    {/* ▷ — запускает тренировку, не открывает редактор */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onStartWorkout(program); }}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors"
                    >
                      <Play size={16} className="text-gray-400 group-hover:text-[#3CAB3C] ml-0.5 transition-colors" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium mb-6">Список программ пуст</p>
              <button
                onClick={onOpenCreate}
                className="px-6 py-2.5 bg-[#3CAB3C] text-white rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
              >
                Создать программу
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}