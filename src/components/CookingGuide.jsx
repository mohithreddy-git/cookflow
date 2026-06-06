import { useState, useEffect, useCallback } from 'react';
import { searchMeals, extractIngredients } from '../services/mealDB';
import { searchCookingVideos, getYouTubeEmbed } from '../services/youtube';
import { translateBatch, LANGUAGES } from '../services/translator';
import IngredientChecklist from './IngredientChecklist';
import StepGuide from './StepGuide';
import VideoGuide from './VideoGuide';
import TimerWidget from './TimerWidget';
import NutritionCard from './NutritionCard';

export default function CookingGuide({ dish, language, onReset }) {
  const [meal, setMeal] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [mode, setMode] = useState('text'); // 'text' | 'video'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLang, setCurrentLang] = useState(language);
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState({ ingredients: [], steps: [] });
  const [activeStep, setActiveStep] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [mealSource, setMealSource] = useState('api'); // 'api' | 'generated'

  const otherLangs = LANGUAGES.filter((l) => l.code !== currentLang.code);

  // Load meal data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const meals = await searchMeals(dish);
        if (cancelled) return;

        let mealData = meals[0] || null;
        let rawIngredients = [];
        let rawSteps = [];

        if (mealData) {
          rawIngredients = extractIngredients(mealData);
          // Parse steps from instructions
          rawSteps = (mealData.strInstructions || '')
            .split(/\r?\n/)
            .map((s) => s.replace(/^step\s*\d+[.:)]\s*/i, '').trim())
            .filter((s) => s.length > 15);

          if (rawSteps.length === 0) {
            rawSteps = (mealData.strInstructions || '')
              .split(/\.\s+/)
              .map((s) => s.trim())
              .filter((s) => s.length > 15);
          }

          setMeal(mealData);
          setMealSource('api');

          // Try to get YouTube video from meal data first
          const ytId = mealData.strYoutube
            ? mealData.strYoutube.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1]
            : null;

          if (ytId) {
            const embed = await getYouTubeEmbed(ytId);
            if (embed) setVideos([embed]);
          }
        } else {
          // Generate fallback data
          rawIngredients = generateFallbackIngredients(dish);
          rawSteps = generateFallbackSteps(dish);
          setMealSource('generated');
        }

        setIngredients(rawIngredients);
        setSteps(rawSteps);

        // Always search for additional videos
        const vids = await searchCookingVideos(dish);
        if (!cancelled && vids.length > 0) {
          setVideos((prev) => {
            const existing = prev.map((v) => v.videoId);
            const newVids = vids.filter((v) => v.videoId && !existing.includes(v.videoId));
            return [...prev, ...newVids];
          });
        }
      } catch (err) {
        if (!cancelled) setError('Could not load recipe. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dish]);

  // Set first available video as selected
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      setSelectedVideo(videos[0]);
    }
  }, [videos]);

  // Translate content when language changes
  const doTranslation = useCallback(async (lang, rawIngredients, rawSteps) => {
    if (lang.code === 'en') {
      setTranslated({ ingredients: rawIngredients, steps: rawSteps });
      return;
    }
    setTranslating(true);
    try {
      const ingNames = rawIngredients.map((i) => i.name);
      const [translatedNames, translatedSteps] = await Promise.all([
        translateBatch(ingNames, 'en', lang.code),
        translateBatch(rawSteps, 'en', lang.code),
      ]);
      setTranslated({
        ingredients: rawIngredients.map((ing, i) => ({
          ...ing,
          name: translatedNames[i] || ing.name,
        })),
        steps: translatedSteps,
      });
    } catch {
      setTranslated({ ingredients: rawIngredients, steps: rawSteps });
    } finally {
      setTranslating(false);
    }
  }, []);

  useEffect(() => {
    if (ingredients.length > 0 || steps.length > 0) {
      doTranslation(currentLang, ingredients, steps);
    }
  }, [currentLang, ingredients, steps, doTranslation]);

  function swapLanguage(lang) {
    setCurrentLang(lang);
  }

  const displayIngredients = translated.ingredients.length ? translated.ingredients : ingredients;
  const displaySteps = translated.steps.length ? translated.steps : steps;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-6">
        <div className="text-6xl animate-bounce">👨‍🍳</div>
        <div className="font-display text-2xl text-charcoal/70 text-center">
          Preparing your <span className="text-terracotta font-bold">{dish}</span> recipe…
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-terracotta"
              style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <style>{`
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4 px-4">
        <div className="text-5xl">😕</div>
        <p className="text-charcoal/70 text-lg text-center">{error}</p>
        <button onClick={onReset} className="btn-primary">Try Another Dish</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-warmGray flex flex-col">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-2 border-charcoal/5 shadow-chunky-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand + dish */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onReset}
              className="text-2xl hover:scale-110 transition-transform shrink-0"
              title="Start over"
              id="header-logo-btn"
            >
              👨‍🍳
            </button>
            <div className="min-w-0">
              <span className="font-display text-lg font-bold text-charcoal block truncate">
                {dish}
              </span>
              {mealSource === 'generated' && (
                <span className="text-xs text-charcoal/40">AI-generated guide</span>
              )}
            </div>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode toggle */}
            <div className="flex bg-warmGray rounded-xl p-1 border-2 border-charcoal/5 shadow-chunky-sm">
              <button
                onClick={() => setMode('text')}
                id="mode-text-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                  mode === 'text'
                    ? 'bg-white text-terracotta shadow-chunky-sm'
                    : 'text-charcoal/50 hover:text-charcoal'
                }`}
              >
                <span>📋</span> <span className="hidden sm:inline">Text Guide</span>
              </button>
              <button
                onClick={() => setMode('video')}
                id="mode-video-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                  mode === 'video'
                    ? 'bg-white text-terracotta shadow-chunky-sm'
                    : 'text-charcoal/50 hover:text-charcoal'
                }`}
              >
                <span>▶️</span> <span className="hidden sm:inline">Video Guide</span>
              </button>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Timer */}
            <button
              onClick={() => setShowTimer(!showTimer)}
              id="timer-toggle-btn"
              title="Cooking timer"
              className={`p-2 rounded-xl border-2 transition-all duration-200 ${showTimer ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-charcoal/10 text-charcoal hover:border-terracotta'}`}
            >
              ⏱️
            </button>

            {/* Nutrition */}
            <button
              onClick={() => setShowNutrition(!showNutrition)}
              id="nutrition-toggle-btn"
              title="Nutrition info"
              className={`p-2 rounded-xl border-2 transition-all duration-200 ${showNutrition ? 'bg-sage text-white border-sage' : 'bg-white border-charcoal/10 text-charcoal hover:border-sage'}`}
            >
              🥗
            </button>

            {/* Language swap dropdown */}
            <div className="relative group">
              <button
                id="lang-swap-btn"
                className="flex items-center gap-1.5 bg-white border-2 border-charcoal/10 hover:border-terracotta rounded-xl px-3 py-2 text-sm font-semibold text-charcoal transition-all duration-200"
              >
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.name}</span>
                <span className="text-xs text-charcoal/40">▾</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-chunky border-2 border-charcoal/5 overflow-hidden z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[160px]">
                <div className="px-3 py-2 text-xs text-charcoal/40 font-semibold uppercase tracking-wider border-b border-charcoal/5">
                  Swap Language
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => swapLanguage(lang)}
                    id={`swap-lang-${lang.code}`}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-body hover:bg-sage-light/30 transition-colors ${
                      currentLang.code === lang.code ? 'bg-terracotta/5 text-terracotta font-semibold' : 'text-charcoal'
                    }`}
                  >
                    <span>{lang.flag}</span> {lang.name}
                    {currentLang.code === lang.code && <span className="ml-auto text-terracotta">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Translating indicator */}
        {translating && (
          <div className="bg-orange/20 text-charcoal/70 text-xs text-center py-1.5 font-body">
            🔄 Translating to {currentLang.name}…
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Floating widgets */}
        {showTimer && (
          <div className="fixed bottom-6 right-6 z-50 animate-in">
            <TimerWidget onClose={() => setShowTimer(false)} />
          </div>
        )}
        {showNutrition && meal && (
          <div className="fixed bottom-6 left-6 z-50 animate-in">
            <NutritionCard meal={meal} onClose={() => setShowNutrition(false)} />
          </div>
        )}

        {mode === 'video' ? (
          /* ─── VIDEO MODE ─── */
          <VideoGuide
            dish={dish}
            videos={videos}
            selectedVideo={selectedVideo}
            onSelectVideo={setSelectedVideo}
            ingredients={displayIngredients}
            steps={displaySteps}
            checkedItems={checkedItems}
            onCheck={(key) => setCheckedItems((p) => ({ ...p, [key]: !p[key] }))}
            activeStep={activeStep}
            onStepChange={setActiveStep}
          />
        ) : (
          /* ─── TEXT MODE ─── */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Section A: Ingredients */}
            <div className="lg:col-span-2">
              <IngredientChecklist
                ingredients={displayIngredients}
                checkedItems={checkedItems}
                onCheck={(key) => setCheckedItems((p) => ({ ...p, [key]: !p[key] }))}
                lang={currentLang}
              />
            </div>

            {/* Section B: Steps */}
            <div className="lg:col-span-3">
              <StepGuide
                steps={displaySteps}
                activeStep={activeStep}
                onStepChange={setActiveStep}
                lang={currentLang}
                dish={dish}
              />

              {/* Embedded video preview */}
              {selectedVideo && (
                <div className="mt-6 card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2">
                      <span>📹</span> Video Reference
                    </h3>
                    <button
                      onClick={() => setMode('video')}
                      className="text-terracotta text-sm font-semibold hover:underline"
                    >
                      Full video mode →
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden aspect-video bg-charcoal/5">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.videoId}?rel=0&modestbranding=1`}
                      title={selectedVideo.title || `${dish} recipe`}
                      allowFullScreen
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  {selectedVideo.title && (
                    <p className="text-charcoal/50 text-xs mt-2 truncate">{selectedVideo.title}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Fallback generators ──────────────────────────────────────────────
function generateFallbackIngredients(dish) {
  return [
    { name: 'Main ingredient', measure: '400g' },
    { name: 'Onion', measure: '1 large' },
    { name: 'Garlic', measure: '3 cloves' },
    { name: 'Olive oil', measure: '2 tbsp' },
    { name: 'Salt', measure: 'to taste' },
    { name: 'Black pepper', measure: 'to taste' },
    { name: 'Herbs & spices', measure: 'as needed' },
    { name: 'Water or broth', measure: '200ml' },
  ];
}

function generateFallbackSteps(dish) {
  return [
    `Gather all your ingredients and prepare your workspace for making ${dish}.`,
    'Wash and prep all vegetables — chop onions, mince garlic, and dice any other vegetables.',
    'Heat oil in a pan over medium heat until shimmering.',
    'Add aromatics (onion, garlic) and cook until softened and fragrant, about 3-4 minutes.',
    'Add your main ingredient and cook until properly sealed/browned.',
    'Add spices and seasonings, stir well to coat everything evenly.',
    'Add liquid (water or broth) and bring to a simmer.',
    'Cook until everything is tender and the flavours have melded together.',
    `Taste and adjust seasoning. Serve your ${dish} hot and enjoy!`,
  ];
}
