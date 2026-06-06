// Nutrition estimates based on common ingredients — fully offline/free
const NUTRIENT_MAP = {
  chicken: { cal: 165, protein: 31, fat: 3.6, carbs: 0 },
  beef: { cal: 250, protein: 26, fat: 15, carbs: 0 },
  pork: { cal: 242, protein: 27, fat: 14, carbs: 0 },
  fish: { cal: 136, protein: 28, fat: 2, carbs: 0 },
  egg: { cal: 78, protein: 6, fat: 5, carbs: 0.6 },
  eggs: { cal: 78, protein: 6, fat: 5, carbs: 0.6 },
  rice: { cal: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  pasta: { cal: 131, protein: 5, fat: 1.1, carbs: 25 },
  potato: { cal: 77, protein: 2, fat: 0.1, carbs: 17 },
  bread: { cal: 79, protein: 2.7, fat: 1, carbs: 15 },
  milk: { cal: 61, protein: 3.2, fat: 3.3, carbs: 4.8 },
  cheese: { cal: 113, protein: 7, fat: 9, carbs: 0.4 },
  butter: { cal: 717, protein: 0.9, fat: 81, carbs: 0.1 },
  'olive oil': { cal: 884, protein: 0, fat: 100, carbs: 0 },
  tomato: { cal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  onion: { cal: 40, protein: 1.1, fat: 0.1, carbs: 9 },
  garlic: { cal: 149, protein: 6.4, fat: 0.5, carbs: 33 },
};

function estimateNutrition(meal) {
  let totals = { cal: 0, protein: 0, fat: 0, carbs: 0 };
  let matched = 0;

  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]?.toLowerCase().trim();
    if (!ing) continue;
    const key = Object.keys(NUTRIENT_MAP).find((k) => ing.includes(k));
    if (key) {
      const n = NUTRIENT_MAP[key];
      totals.cal += n.cal;
      totals.protein += n.protein;
      totals.fat += n.fat;
      totals.carbs += n.carbs;
      matched++;
    }
  }

  // Rough scaling — divide by servings (assume 4)
  const servings = 4;
  return {
    calories: Math.round(totals.cal / servings),
    protein: Math.round(totals.protein / servings),
    fat: Math.round(totals.fat / servings),
    carbs: Math.round(totals.carbs / servings),
    matched,
  };
}

const MACROS = [
  { key: 'protein', label: 'Protein', unit: 'g', color: '#E07A5F', bg: 'bg-terracotta/10', icon: '💪' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: '#F2CC8F', bg: 'bg-orange/20', icon: '🌾' },
  { key: 'fat', label: 'Fat', unit: 'g', color: '#81B29A', bg: 'bg-sage/20', icon: '🫒' },
];

export default function NutritionCard({ meal, onClose }) {
  const nutrition = estimateNutrition(meal);
  const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;

  return (
    <div className="bg-white rounded-2xl shadow-chunky border-2 border-charcoal/8 p-5 w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-charcoal flex items-center gap-2">
          <span>🥗</span> Nutrition
        </h3>
        <button
          onClick={onClose}
          className="text-charcoal/30 hover:text-charcoal transition-colors text-lg leading-none"
          id="nutrition-close-btn"
        >
          ×
        </button>
      </div>

      <p className="text-xs text-charcoal/40 mb-3">
        Per serving (estimated) · {meal.strMeal}
      </p>

      {/* Calories big display */}
      <div className="text-center bg-warmGray rounded-xl py-4 mb-4">
        <div className="font-display text-4xl font-bold text-terracotta">
          {nutrition.calories}
        </div>
        <div className="text-charcoal/50 text-xs font-body mt-1 uppercase tracking-wider">
          Calories
        </div>
      </div>

      {/* Macro bars */}
      <div className="space-y-3">
        {MACROS.map(({ key, label, unit, color, bg, icon }) => {
          const val = nutrition[key];
          const pct = totalMacros > 0 ? Math.round((val / totalMacros) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-body text-charcoal/70">
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
                <span className="font-display font-bold text-charcoal">
                  {val}{unit}
                  <span className="text-charcoal/30 font-body font-normal ml-1">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 bg-warmGray rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-charcoal/30 text-xs mt-4 text-center leading-snug">
        * Estimates only. Actual values may vary based on portions and preparation.
      </p>

      {meal.strCategory && (
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="bg-sage/10 text-sage text-xs px-2 py-1 rounded-full font-semibold">
            {meal.strCategory}
          </span>
          {meal.strArea && (
            <span className="bg-terracotta/10 text-terracotta text-xs px-2 py-1 rounded-full font-semibold">
              {meal.strArea} Cuisine
            </span>
          )}
        </div>
      )}
    </div>
  );
}
