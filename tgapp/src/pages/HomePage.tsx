import { Calendar, Calculator, Target, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-50 rounded-full">
              <Target className="text-blue-500" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Составление программы</h3>
              <p className="text-xs text-gray-500 mt-1">Индивидуальный план</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-50 rounded-full">
              <Sparkles className="text-blue-500" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Программы</h3>
              <p className="text-xs text-gray-500 mt-1">Готовые комплексы</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-50 rounded-full">
              <Calculator className="text-blue-500" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Калькулятор КБЖУ</h3>
              <p className="text-xs text-gray-500 mt-1">Норма калорий</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-50 rounded-full">
              <Calendar className="text-blue-500" size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Календарь</h3>
              <p className="text-xs text-gray-500 mt-1">Планирование</p>
            </div>
          </div>
        </div>
      </div>

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
  );
}