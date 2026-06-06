import { useState, useEffect, useRef } from 'react';

const POPULAR_DISHES = [
  'Butter Chicken', 'Pasta Carbonara', 'Sushi Rolls', 'Tacos', 'Pad Thai',
  'Biryani', 'Pizza Margherita', 'Ramen', 'Fried Rice', 'Shakshuka',
];

const FOOD_EMOJIS = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍛', '🥞', '🧆', '🫕', '🍝'];

export default function DishIntake({ onSubmit }) {
  const [inputVal, setInputVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const [floatingEmoji, setFloatingEmoji] = useState([]);
  const inputRef = useRef(null);

  // Floating food emojis animation
  useEffect(() => {
    const emojis = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      size: 20 + Math.random() * 24,
    }));
    setFloatingEmoji(emojis);
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setInputVal(val);
    if (val.length > 1) {
      const filtered = POPULAR_DISHES.filter((d) =>
        d.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (inputVal.trim()) onSubmit(inputVal.trim());
  }

  function pickSuggestion(dish) {
    setInputVal(dish);
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function pickPopular(dish) {
    onSubmit(dish);
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-orange/30 to-sage-light/40 px-4">
      {/* Floating emojis */}
      {floatingEmoji.map((item) => (
        <span
          key={item.id}
          className="pointer-events-none absolute select-none"
          style={{
            left: `${item.x}%`,
            fontSize: `${item.size}px`,
            opacity: 0.15,
            animation: `floatUp ${item.duration}s ${item.delay}s infinite linear`,
            bottom: '-60px',
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* Logo / Brand */}
      <div className="mb-10 flex flex-col items-center gap-2 z-10">
        <div className="flex items-center gap-3">
          <span className="text-5xl">👨‍🍳</span>
          <h1 className="font-display text-5xl font-bold text-charcoal tracking-tight">
            Cook<span className="text-terracotta">Flow</span>
          </h1>
        </div>
        <p className="text-charcoal/60 font-body text-lg text-center max-w-xs leading-snug">
          Your personal cooking companion — in any language
        </p>
      </div>

      {/* Main Card */}
      <div className="z-10 w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-chunky border-2 border-charcoal/5 p-8">
        <h2 className="font-display text-2xl font-semibold text-charcoal mb-2 text-center">
          What dish do you want to prepare today?
        </h2>
        <p className="text-charcoal/50 text-sm text-center mb-6">
          Type a dish name or pick from popular suggestions below
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <div className={`relative transition-all duration-200 ${focused ? 'scale-[1.01]' : ''}`}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">🍽️</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="e.g. Biryani, Pasta, Tacos..."
              className="input-field pl-12 pr-4"
              autoComplete="off"
              id="dish-input"
            />
          </div>

          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-chunky border-2 border-charcoal/5 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="w-full text-left px-4 py-3 hover:bg-sage-light/30 text-charcoal font-body transition-colors flex items-center gap-3"
                >
                  <span>🔍</span> {s}
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!inputVal.trim()}
            id="start-cooking-btn"
            className="btn-primary w-full mt-4 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>🚀</span> Start Cooking
          </button>
        </form>
      </div>

      {/* Popular dishes */}
      <div className="z-10 mt-8 w-full max-w-lg">
        <p className="text-charcoal/50 text-xs uppercase tracking-widest text-center mb-3 font-semibold">
          Popular right now
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_DISHES.map((dish) => (
            <button
              key={dish}
              onClick={() => pickPopular(dish)}
              className="bg-white/80 hover:bg-terracotta hover:text-white border-2 border-charcoal/8 text-charcoal text-sm font-body px-4 py-2 rounded-full shadow-chunky-sm transition-all duration-200 hover:shadow-chunky hover:-translate-y-0.5"
            >
              {dish}
            </button>
          ))}
        </div>
      </div>

      {/* Features row */}
      <div className="z-10 mt-12 flex flex-wrap justify-center gap-6 text-center">
        {[
          { icon: '🌍', text: 'Multi-language' },
          { icon: '📹', text: 'YouTube Videos' },
          { icon: '✅', text: 'Step-by-step Guide' },
          { icon: '🔄', text: 'Instant Translation' },
        ].map((f) => (
          <div key={f.text} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{f.icon}</span>
            <span className="text-charcoal/50 text-xs font-semibold">{f.text}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
