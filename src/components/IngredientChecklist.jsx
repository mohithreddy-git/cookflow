export default function IngredientChecklist({ ingredients, checkedItems, onCheck, lang }) {
  const total = ingredients.length;
  const checked = Object.values(checkedItems).filter(Boolean).length;
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="card h-fit sticky top-[80px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-charcoal flex items-center gap-2">
          <span>🧺</span>
          <span>Required Materials</span>
        </h2>
        <span className="bg-terracotta/10 text-terracotta text-xs font-semibold px-2 py-1 rounded-full">
          {checked}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-charcoal/40 mb-1">
          <span>Shopping progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 bg-warmGray rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-terracotta to-sage rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Ingredients list */}
      <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
        {ingredients.length === 0 ? (
          <p className="text-charcoal/40 text-sm text-center py-4">Loading ingredients…</p>
        ) : (
          ingredients.map((ing, i) => {
            const key = `ing-${i}`;
            const isChecked = !!checkedItems[key];
            return (
              <label
                key={key}
                htmlFor={key}
                className={`check-item select-none ${isChecked ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  id={key}
                  checked={isChecked}
                  onChange={() => onCheck(key)}
                  className="w-5 h-5 accent-sage rounded cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-charcoal font-body text-sm font-semibold ${isChecked ? 'line-through' : ''}`}>
                    {ing.name}
                  </span>
                  {ing.measure && (
                    <span className="text-charcoal/40 text-xs ml-2">— {ing.measure}</span>
                  )}
                </div>
                {isChecked && <span className="text-sage text-sm shrink-0">✓</span>}
              </label>
            );
          })
        )}
      </div>

      {/* Reset checks */}
      {checked > 0 && (
        <button
          onClick={() => ingredients.forEach((_, i) => onCheck(`ing-${i}`))}
          className="mt-4 w-full text-xs text-charcoal/40 hover:text-terracotta transition-colors"
        >
          Reset checklist
        </button>
      )}

      {/* Tools section */}
      <div className="mt-5 pt-4 border-t-2 border-charcoal/5">
        <h3 className="font-display font-semibold text-charcoal mb-3 flex items-center gap-2 text-sm">
          <span>🔪</span> Tools Needed
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Knife', 'Cutting board', 'Pan / Pot', 'Mixing bowl', 'Spatula', 'Measuring cups'].map((tool) => (
            <span
              key={tool}
              className="bg-warmGray text-charcoal/70 text-xs px-3 py-1.5 rounded-full font-body border border-charcoal/8"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Language badge */}
      <div className="mt-4 flex items-center gap-2 text-xs text-charcoal/40">
        <span>{lang.flag}</span>
        <span>Showing in {lang.name}</span>
      </div>
    </div>
  );
}
