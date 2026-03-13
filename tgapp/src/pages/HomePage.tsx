import { Calendar, Calculator, Target, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ProgramCompositionModal from '../components/ProgramCompositionModal';
import KBJUCalculatorModal from '../components/KBJUCalculatorModal';
import CalendarModal from '../components/CalendarModal';
import ProgramsListModal from '../components/ProgramsListModal';
import ProgramDetailModal from '../components/ProgramDetailModal';

interface HomePageProps {
  onNavigate?: (page: 'home' | 'workouts' | 'nutrition' | 'profile') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showKBJUModal, setShowKBJUModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showProgramsListModal, setShowProgramsListModal] = useState(false);
  const [showProgramDetailModal, setShowProgramDetailModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const handleProgramComposition = () => {
    setShowProgramModal(true);
  };

  const handleWorkoutPrograms = () => {
    setShowProgramsListModal(true);
  };

  const handleKBZHUCalculator = () => {
    setShowKBJUModal(true);
  };

  const handleCalendar = () => {
    setShowCalendarModal(true);
  };

  const handleSelectProgram = (program: any) => {
    setSelectedProgram(program);
    setShowProgramDetailModal(true);
  };

  return (
    <>
      <div className="space-y-6 mt-8">
        {/* Сетка 2x2 для кнопок */}
        <div className="grid grid-cols-2 gap-4">
          {/* Составление программы */}
          <button 
            onClick={handleProgramComposition}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-50 rounded-full">
                <Target className="text-blue-500" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Составление программы</h3>
                <p className="text-xs text-gray-500 mt-1">Индивидуальный план</p>
              </div>
            </div>
          </button>

          {/* Программы */}
          <button 
            onClick={handleWorkoutPrograms}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-50 rounded-full">
                <Sparkles className="text-blue-500" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Программы</h3>
                <p className="text-xs text-gray-500 mt-1">Готовые комплексы</p>
              </div>
            </div>
          </button>

          {/* Калькулятор КБЖУ */}
          <button 
            onClick={handleKBZHUCalculator}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-50 rounded-full">
                <Calculator className="text-blue-500" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Калькулятор КБЖУ</h3>
                <p className="text-xs text-gray-500 mt-1">Норма калорий</p>
              </div>
            </div>
          </button>

          {/* Календарь */}
          <button 
            onClick={handleCalendar}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-50 rounded-full">
                <Calendar className="text-blue-500" size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Календарь</h3>
                <p className="text-xs text-gray-500 mt-1">Планирование</p>
              </div>
            </div>
          </button>
        </div>

        {/* Упражнение дня */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-5 shadow-lg mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} />
            <h2 className="font-semibold">Упражнение дня</h2>
          </div>
          <p className="text-base opacity-90">
            Планка 60 секунд - отличное упражнение для кора!
          </p>
        </div>
      </div>

      {/* Модальные окна */}
      <ProgramCompositionModal 
        isOpen={showProgramModal} 
        onClose={() => setShowProgramModal(false)} 
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
        onSelectProgram={handleSelectProgram}
      />

      <ProgramDetailModal
        isOpen={showProgramDetailModal}
        onClose={() => setShowProgramDetailModal(false)}
        program={selectedProgram}
      />
    </>
  );
}