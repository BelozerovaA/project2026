import { useState } from 'react';
import { ArrowLeft, Clock, Flame } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  calories: number;
  protein: string;
  prepTime: string;
  ingredients: string[];
  instructions: string;
  image?: string;
}

export default function NutritionPage() {
  const [selectedGoal, setSelectedGoal] = useState<'похудение' | 'массонабор' | 'поддержка'>('похудение');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const recipesByGoal = {
    похудение: [
      { 
        id: 1, 
        title: 'Овощной салат с курицей', 
        calories: 320, 
        protein: '35г',
        prepTime: '20 мин',
        ingredients: ['Куриное филе 200г', 'Помидоры 100г', 'Огурцы 100г', 'Листья салата', 'Оливковое масло'],
        instructions: '1. Отварите куриное филе\n2. Нарежьте овощи\n3. Смешайте ингредиенты\n4. Заправьте маслом',
        image: '🥗'
      },
      { 
        id: 2, 
        title: 'Треска с овощами', 
        calories: 280, 
        protein: '30г',
        prepTime: '25 мин',
        ingredients: ['Треска 200г', 'Брокколи 150г', 'Цветная капуста', 'Лимон', 'Специи'],
        instructions: '1. Запеките рыбу с овощами\n2. Добавьте специи\n3. Подавайте с лимоном',
        image: '🐟'
      },
    ],
    массонабор: [
      { 
        id: 3, 
        title: 'Гречка с курицей', 
        calories: 550, 
        protein: '45г',
        prepTime: '30 мин',
        ingredients: ['Куриное филе 250г', 'Гречка 100г', 'Лук', 'Морковь', 'Масло'],
        instructions: '1. Отварите гречку\n2. Обжарьте курицу с овощами\n3. Смешайте',
        image: '🍚'
      },
      { 
        id: 4, 
        title: 'Омлет с сыром', 
        calories: 420, 
        protein: '25г',
        prepTime: '15 мин',
        ingredients: ['Яйца 3шт', 'Сыр 50г', 'Молоко 50мл', 'Зелень'],
        instructions: '1. Взбейте яйца с молоком\n2. Добавьте тертый сыр\n3. Запеките',
        image: '🍳'
      },
    ],
    поддержка: [
      { 
        id: 5, 
        title: 'Овсяноблин с бананом', 
        calories: 350, 
        protein: '15г',
        prepTime: '10 мин',
        ingredients: ['Овсянка 50г', 'Яйцо 1шт', 'Банан', 'Молоко 30мл'],
        instructions: '1. Смешайте все ингредиенты\n2. Выпекайте на сковороде\n3. Подавайте с медом',
        image: '🥞'
      },
      { 
        id: 6, 
        title: 'Смузи боул', 
        calories: 280, 
        protein: '12г',
        prepTime: '5 мин',
        ingredients: ['Банан', 'Ягоды', 'Йогурт', 'Гранола'],
        instructions: '1. Смешайте в блендере\n2. Вылейте в миску\n3. Посыпьте гранолой',
        image: '🥣'
      },
    ],
  };

  if (selectedRecipe) {
    return (
      <div className="pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedRecipe(null)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{selectedRecipe.title}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <span className="text-8xl opacity-30">{selectedRecipe.image || '🍽️'}</span>
          </div>

          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm flex items-center gap-1">
                <Flame size={14} /> {selectedRecipe.calories} ккал
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                Белки: {selectedRecipe.protein}
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm flex items-center gap-1">
                <Clock size={14} /> {selectedRecipe.prepTime}
              </span>
            </div>

            <h2 className="font-semibold text-gray-800 mb-2">Ингредиенты:</h2>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              {selectedRecipe.ingredients.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <h2 className="font-semibold text-gray-800 mb-2">Приготовление:</h2>
            <p className="text-gray-600 whitespace-pre-line">{selectedRecipe.instructions}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Питание</h1>
      
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

      <div className="space-y-3">
        {recipesByGoal[selectedGoal].map((recipe) => (
          <div 
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
              {recipe.image}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{recipe.title}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">{recipe.calories} ккал</span>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{recipe.protein}</span>
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full">{recipe.prepTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}