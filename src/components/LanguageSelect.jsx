import { useState } from 'react';
import { LANGUAGES } from '../services/translator';

// Language descriptors with background colors and food emoji
const LANG_META = {
  en: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', food: '🥧', tagline: 'Classic recipes in English' },
  es: { bg: 'from-red-50 to-orange-50', border: 'border-red-200', food: '🌮', tagline: 'Sabores de España y Latinoamérica' },
  fr: { bg: 'from-blue-50 to-indigo-50', border: 'border-indigo-200', food: '🥐', tagline: 'La haute cuisine française' },
  hi: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-300', food: '🍛', tagline: 'भारतीय पाक कला के स्वाद' },
  te: { bg: 'from-yellow-50 to-lime-50', border: 'border-yellow-300', food: '🫙', tagline: 'తెలుగు వంటకాల రుచి' },
  ja: { bg: 'from-pink-50 to-rose-50', border: 'border-pink-200', food: '🍱', tagline: '日本料理の精髄' },
};

export default function LanguageSelect({ dish, onSelect, onBack }) {
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);

  function handleSelect(lang) {
    setSelected(lang.code);
    setAnimating(true);
    setTimeout(() => onSelect(lang), 500);
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cream via-sage-light/20 to-orange/20 px-4 py-12 transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-charcoal/60 hover:text-terracotta transition-colors font-body text-sm font-semibold group"
        id="language-back-btn"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
      </button>

      {/* Header */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-2 bg-white/80 border-2 border-charcoal/5 rounded-full px-5 py-2 shadow-chunky-sm mb-5">
          <span className="text-lg">🍽️</span>
          <span className="text-charcoal/60 text-sm font-semibold">{dish}</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-charcoal">
          What language do you prefer?
        </h2>
        <p className="text-charcoal/50 mt-2 text-base">
          Your guide will be in your chosen language — you can always swap later
        </p>
      </div>

      {/* Language grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
        {LANGUAGES.map((lang) => {
          const meta = LANG_META[lang.code] || {};
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              id={`lang-${lang.code}`}
              className={`
                relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-200 cursor-pointer
                bg-gradient-to-br ${meta.bg || 'from-gray-50 to-gray-100'}
                ${isSelected
                  ? 'border-terracotta shadow-chunky scale-105'
                  : `${meta.border || 'border-charcoal/10'} hover:border-terracotta hover:shadow-chunky hover:-translate-y-1`
                }
              `}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 text-terracotta font-bold text-lg">✓</span>
              )}
              <div className="text-4xl mb-2">{lang.flag}</div>
              <div className="font-display text-lg font-semibold text-charcoal">{lang.name}</div>
              <div className="text-charcoal/50 text-xs font-body mt-0.5">{lang.nativeName}</div>
              <div className="mt-2 text-xl">{meta.food}</div>
              <div className="text-charcoal/40 text-xs mt-1 font-body leading-snug">{meta.tagline}</div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-charcoal/40 text-xs">
        🌍 More languages coming soon
      </p>
    </div>
  );
}
