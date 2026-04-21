import { useState, useEffect } from 'react';
import { ArrowLeft, Flame } from 'lucide-react';

const API_BASE_URL = 'https://api.snnfitmate.ru';

interface Recipe {
  id: number;
  category_ID: number;
  title: string;
  calories: number;
  protein: number;
  fat: number;    
  carbs: number;  
  ingredients: string[];
  instructions: string;
  image?: string;
}

const GOAL_MAP = {
  'похудение': 1,
  'массонабор': 2,
  'коррекция': 3,
};

export default function NutritionPage() {
  const [selectedGoal, setSelectedGoal] = useState<'похудение' | 'массонабор' | 'коррекция'>('похудение');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const goalId = GOAL_MAP[selectedGoal];
        const response = await fetch(`${API_BASE_URL}/recipes/${goalId}`);
        if (response.ok) {
          const data = await response.json();
          setRecipes(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке рецептов:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
    setSelectedRecipe(null); 
  }, [selectedGoal]);

  const handleOpenRecipe = (recipe: Recipe) => {
    setScrollPosition(window.scrollY);
    setSelectedRecipe(recipe);
    window.scrollTo(0, 0);
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  const renderCategoryList = (categoryId: number, categoryName: string) => {
    const categoryRecipes = recipes.filter(r => r.category_ID === categoryId);
    
    if (categoryRecipes.length === 0) return null;

    return (
      <div className="mb-6">
        {/* Название подраздела с зелёной полоской — как в тренировках */}
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#3CAB3C] rounded-full"></div>
          {categoryName}
        </h2>
        <div className="space-y-3">
          {categoryRecipes.map((recipe) => (
            <div 
              key={recipe.id}
              onClick={() => handleOpenRecipe(recipe)}
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {recipe.image ? (
                  <img 
                    src={`${API_BASE_URL}/${recipe.image}`} 
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 leading-tight text-sm mb-2">{recipe.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full whitespace-nowrap">
                    {recipe.calories} ккал
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full whitespace-nowrap">
                    Белки: {recipe.protein} г
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full whitespace-nowrap">
                    Жиры: {recipe.fat} г
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full whitespace-nowrap">
                    Углеводы: {recipe.carbs} г
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (selectedRecipe) {
    return (
      <div className="pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleCloseRecipe} className="p-2 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{selectedRecipe.title}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-video bg-gray-100 w-full relative">
            {selectedRecipe.image ? (
              <img 
                src={`${API_BASE_URL}/${selectedRecipe.image}`} 
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🍽️</div>
            )}
          </div>

          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm flex items-center gap-1">
                <Flame size={14} /> {selectedRecipe.calories} ккал
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                Белки: {selectedRecipe.protein} г
              </span>
              <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-sm">
                Жиры: {selectedRecipe.fat} г
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                Углеводы: {selectedRecipe.carbs} г
              </span>
            </div>

            <h2 className="font-semibold text-gray-800 mb-3 text-lg">Ингредиенты:</h2>
            <ul className="list-none mb-6 space-y-2">
              {selectedRecipe.ingredients.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="font-semibold text-gray-800 mb-3 text-lg">Приготовление:</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              {selectedRecipe.instructions || "Инструкция по приготовлению скоро появится."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableGoals = Object.keys(GOAL_MAP) as Array<keyof typeof GOAL_MAP>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Питание</h1>
      
      {/* Переключатель целей — стиль как в тренировках */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto hide-scrollbar">
        {availableGoals.map((goal) => (
          <button
            key={goal}
            onClick={() => setSelectedGoal(goal)}
            className={`flex-1 min-w-[100px] py-3 px-2 rounded-lg font-medium text-sm transition-all capitalize ${
              selectedGoal === goal
                ? 'bg-white text-[#3CAB3C] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {goal.charAt(0).toUpperCase() + goal.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3CAB3C]"></div>
        </div>
      ) : recipes.length > 0 ? (
        <div className="space-y-6">
          {renderCategoryList(1, "Завтрак")}
          {renderCategoryList(2, "Обед")}
          {renderCategoryList(3, "Ужин")}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
          Рецепты для данной цели пока не добавлены
        </div>
      )}
    </div>
  );
}