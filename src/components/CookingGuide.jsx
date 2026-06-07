import { useState, useEffect, useCallback } from 'react';
import { searchMeals, extractIngredients } from '../services/mealDB';
import { searchCookingVideos, getYouTubeEmbed } from '../services/youtube';
import { translateBatch, LANGUAGES } from '../services/translator';
import IngredientChecklist from './IngredientChecklist';
import StepGuide from './StepGuide';
import VideoGuide from './VideoGuide';
import TimerWidget from './TimerWidget';
import NutritionCard from './NutritionCard';

// ── Default tools list (English source) ─────────────────────────────
const DEFAULT_TOOLS = ['Knife', 'Cutting board', 'Pan', 'Mixing bowl', 'Spatula', 'Measuring cup'];

// ── UI label translations per language ──────────────────────────────
const UI_LABELS = {
  en: {
    requiredMaterials: 'Required Materials',
    toolsNeeded: 'Tools Needed',
    stepByStep: 'Step-by-Step Process',
    currentStep: 'Current Step',
    shoppingProgress: 'Shopping progress',
    resetChecklist: 'Reset checklist',
    recipeComplete: '🎉 Recipe Complete!',
    prevStep: '← Previous',
    nextStep: 'Next Step →',
    videoRef: 'Video Reference',
    fullVideoMode: 'Full video mode →',
    showingIn: 'Showing in',
    guideIn: 'Guide in',
    translating: 'Translating to',
    stepOf: 'Step',
    of: 'of',
    complete: 'complete',
  },
  te: {
    requiredMaterials: 'అవసరమైన వస్తువులు',
    toolsNeeded: 'అవసరమైన పరికరాలు',
    stepByStep: 'దశల వారీ విధానం',
    currentStep: 'ప్రస్తుత దశ',
    shoppingProgress: 'కొనుగోలు పురోగతి',
    resetChecklist: 'జాబితా రీసెట్ చేయండి',
    recipeComplete: '🎉 వంట పూర్తయింది!',
    prevStep: '← వెనుకకు',
    nextStep: 'తదుపరి దశ →',
    videoRef: 'వీడియో సూచన',
    fullVideoMode: 'పూర్తి వీడియో మోడ్ →',
    showingIn: 'తెలుగులో చూపిస్తోంది',
    guideIn: 'గైడ్ భాష',
    translating: 'అనువదిస్తోంది',
    stepOf: 'దశ',
    of: 'లో',
    complete: 'పూర్తి',
  },
  hi: {
    requiredMaterials: 'आवश्यक सामग्री',
    toolsNeeded: 'आवश्यक उपकरण',
    stepByStep: 'चरण-दर-चरण प्रक्रिया',
    currentStep: 'वर्तमान चरण',
    shoppingProgress: 'खरीदारी प्रगति',
    resetChecklist: 'सूची रीसेट करें',
    recipeComplete: '🎉 रेसिपी पूरी हुई!',
    prevStep: '← पिछला',
    nextStep: 'अगला चरण →',
    videoRef: 'वीडियो संदर्भ',
    fullVideoMode: 'पूर्ण वीडियो मोड →',
    showingIn: 'हिंदी में दिखा रहे हैं',
    guideIn: 'गाइड भाषा',
    translating: 'अनुवाद हो रहा है',
    stepOf: 'चरण',
    of: 'का',
    complete: 'पूर्ण',
  },
  es: {
    requiredMaterials: 'Materiales Necesarios',
    toolsNeeded: 'Herramientas Necesarias',
    stepByStep: 'Proceso Paso a Paso',
    currentStep: 'Paso Actual',
    shoppingProgress: 'Progreso de compras',
    resetChecklist: 'Restablecer lista',
    recipeComplete: '🎉 ¡Receta completa!',
    prevStep: '← Anterior',
    nextStep: 'Siguiente →',
    videoRef: 'Referencia de video',
    fullVideoMode: 'Modo video completo →',
    showingIn: 'Mostrando en Español',
    guideIn: 'Guía en',
    translating: 'Traduciendo a',
    stepOf: 'Paso',
    of: 'de',
    complete: 'completo',
  },
  fr: {
    requiredMaterials: 'Matériaux Nécessaires',
    toolsNeeded: 'Outils Nécessaires',
    stepByStep: 'Processus Étape par Étape',
    currentStep: 'Étape Actuelle',
    shoppingProgress: 'Progression des achats',
    resetChecklist: 'Réinitialiser la liste',
    recipeComplete: '🎉 Recette terminée!',
    prevStep: '← Précédent',
    nextStep: 'Étape suivante →',
    videoRef: 'Référence vidéo',
    fullVideoMode: 'Mode vidéo complet →',
    showingIn: 'Affiché en Français',
    guideIn: 'Guide en',
    translating: 'Traduction en cours',
    stepOf: 'Étape',
    of: 'sur',
    complete: 'terminé',
  },
  ja: {
    requiredMaterials: '必要な材料',
    toolsNeeded: '必要な道具',
    stepByStep: 'ステップバイステップ',
    currentStep: '現在のステップ',
    shoppingProgress: '買い物の進捗',
    resetChecklist: 'リセット',
    recipeComplete: '🎉 完成!',
    prevStep: '← 前へ',
    nextStep: '次へ →',
    videoRef: '動画参考',
    fullVideoMode: '全画面動画モード →',
    showingIn: '日本語で表示中',
    guideIn: 'ガイド言語',
    translating: '翻訳中',
    stepOf: 'ステップ',
    of: '/',
    complete: '完了',
  },
};

function getLabels(langCode) {
  return UI_LABELS[langCode] || UI_LABELS.en;
}

export default function CookingGuide({ dish, language, onReset }) {
  const [meal, setMeal] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [mode, setMode] = useState('text'); // 'text' | 'video'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLang, setCurrentLang] = useState(language);
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState({ ingredients: [], steps: [], tools: DEFAULT_TOOLS });
  const [activeStep, setActiveStep] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [mealSource, setMealSource] = useState('api'); // 'api' | 'generated'

  const labels = getLabels(currentLang.code);
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
          // No meal found — rely entirely on YouTube videos
          rawIngredients = [];
          rawSteps = [];
          setMealSource('youtube_only');
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

        // If no text recipe exists but we have videos, default to video mode
        if (!mealData && vids.length > 0) {
          setMode('video');
        } else if (!mealData && vids.length === 0) {
           if (!cancelled) setError(`We couldn't find a recipe or video for "${dish}".`);
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
  const doTranslation = useCallback(async (lang, rawIngredients, rawSteps, rawTools) => {
    if (lang.code === 'en') {
      setTranslated({ ingredients: rawIngredients, steps: rawSteps, tools: rawTools });
      return;
    }
    setTranslating(true);
    try {
      const ingNames = rawIngredients.map((i) => i.name);
      const [translatedNames, translatedSteps, translatedTools] = await Promise.all([
        translateBatch(ingNames, 'en', lang.code),
        translateBatch(rawSteps, 'en', lang.code),
        translateBatch(rawTools, 'en', lang.code),
      ]);
      setTranslated({
        ingredients: rawIngredients.map((ing, i) => ({
          ...ing,
          name: translatedNames[i] || ing.name,
        })),
        steps: translatedSteps.map((s, i) => s || rawSteps[i]),
        tools: translatedTools.map((t, i) => t || rawTools[i]),
      });
    } catch {
      setTranslated({ ingredients: rawIngredients, steps: rawSteps, tools: rawTools });
    } finally {
      setTranslating(false);
    }
  }, []);

  useEffect(() => {
    if (ingredients.length > 0 || steps.length > 0) {
      doTranslation(currentLang, ingredients, steps, tools);
    }
  }, [currentLang, ingredients, steps, tools, doTranslation]);

  function swapLanguage(lang) {
    setCurrentLang(lang);
  }

  const displayIngredients = translated.ingredients.length ? translated.ingredients : ingredients;
  const displaySteps = translated.steps.length ? translated.steps : steps;
  const displayTools = translated.tools.length ? translated.tools : tools;

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
              {mealSource === 'youtube_only' && (
                <span className="text-xs text-charcoal/40 font-semibold bg-charcoal/5 px-2 py-0.5 rounded-full">
                  Video Guide Only
                </span>
              )}
            </div>
          </div>

          {/* Center controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode toggle - only show if we have text data */}
            {mealSource !== 'youtube_only' && (
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
            )}
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
            🔄 {labels.translating} {currentLang.name}…
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
            {mealSource === 'youtube_only' ? (
              <div className="lg:col-span-5 card text-center py-12">
                <span className="text-5xl block mb-4">📺</span>
                <h2 className="font-display text-2xl font-bold text-charcoal mb-2">Text Guide Not Available</h2>
                <p className="text-charcoal/60 max-w-md mx-auto mb-6">
                  We don't have a written recipe for <strong>{dish}</strong> right now. However, we found some excellent video guides to help you make it!
                </p>
                <button
                  onClick={() => setMode('video')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <span>▶️</span> Switch to Video Guide
                </button>
              </div>
            ) : (
              <>
                {/* Section A: Ingredients */}
                <div className="lg:col-span-2">
                  <IngredientChecklist
                    ingredients={displayIngredients}
                    tools={displayTools}
                    checkedItems={checkedItems}
                    onCheck={(key) => setCheckedItems((p) => ({ ...p, [key]: !p[key] }))}
                    lang={currentLang}
                    labels={labels}
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
                    labels={labels}
                  />

                  {/* Embedded video preview */}
                  {selectedVideo && (
                    <div className="mt-6 card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2">
                          <span>📹</span> {labels.videoRef}
                        </h3>
                        <button
                          onClick={() => setMode('video')}
                          className="text-terracotta text-sm font-semibold hover:underline"
                        >
                          {labels.fullVideoMode}
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
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}deoRef}
                    </h3>
                    <button
                      onClick={() => setMode('video')}
                      className="text-terracotta text-sm font-semibold hover:underline"
                    >
                      {labels.fullVideoMode}
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


