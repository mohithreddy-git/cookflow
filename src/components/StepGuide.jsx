import { useEffect, useRef } from 'react';

export default function StepGuide({ steps, activeStep, onStepChange, lang, dish, labels }) {
  const stepRefs = useRef([]);

  useEffect(() => {
    stepRefs.current[activeStep]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeStep]);

  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round(((activeStep + 1) / totalSteps) * 100) : 0;

  // Use translated labels, fall back to English
  const L = labels || {
    stepByStep: 'Step-by-Step Process',
    currentStep: 'Current Step',
    recipeComplete: '🎉 Recipe Complete!',
    prevStep: '← Previous',
    nextStep: 'Next Step →',
    guideIn: 'Guide in',
    stepOf: 'Step',
    of: 'of',
    complete: 'complete',
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl font-bold text-charcoal flex items-center gap-2">
          <span>📖</span> {L.stepByStep}
        </h2>
        <span className="text-sm text-charcoal/50 font-body">
          {L.stepOf} {Math.min(activeStep + 1, totalSteps)} {L.of} {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 bg-warmGray rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-terracotta to-sage rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-charcoal/40 mt-1">{progress}% {L.complete}</p>
      </div>

      {/* Steps list */}
      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-charcoal/40">
            <span className="text-4xl block mb-3">📋</span>
            Loading steps…
          </div>
        ) : (
          steps.map((step, i) => {
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <div
                key={i}
                ref={(el) => (stepRefs.current[i] = el)}
                onClick={() => onStepChange(i)}
                id={`step-${i}`}
                className={`
                  rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 group
                  ${isActive
                    ? 'border-terracotta bg-terracotta/5 shadow-chunky step-active'
                    : isDone
                    ? 'border-sage/50 bg-sage/5 opacity-70'
                    : 'border-charcoal/8 bg-white hover:border-charcoal/20 hover:shadow-chunky-sm'
                  }
                `}
              >
                <div className="flex gap-3 items-start">
                  {/* Step number / done indicator */}
                  <div
                    className={`
                      shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold border-2 mt-0.5 transition-all duration-300
                      ${isActive
                        ? 'bg-terracotta text-white border-terracotta scale-110'
                        : isDone
                        ? 'bg-sage text-white border-sage'
                        : 'bg-warmGray text-charcoal/50 border-charcoal/10'
                      }
                    `}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>

                  {/* Step text */}
                  <div className="flex-1 min-w-0">
                    {isActive && (
                      <span className="text-terracotta text-xs font-bold uppercase tracking-widest mb-1 block">
                        {L.currentStep}
                      </span>
                    )}
                    <p className={`font-body text-sm leading-relaxed ${isActive ? 'text-charcoal font-semibold' : isDone ? 'text-charcoal/50' : 'text-charcoal/80'}`}>
                      {step}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-charcoal/5">
        <button
          onClick={() => onStepChange(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          id="prev-step-btn"
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm py-2"
        >
          {L.prevStep}
        </button>

        {activeStep < totalSteps - 1 ? (
          <button
            onClick={() => onStepChange(activeStep + 1)}
            id="next-step-btn"
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            {L.nextStep}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sage font-display font-bold text-sm">
            <span>🎉</span> {L.recipeComplete}
          </div>
        )}
      </div>

      {/* Language badge */}
      <div className="mt-3 flex items-center gap-2 text-xs text-charcoal/40">
        <span>{lang.flag}</span>
        <span>{L.guideIn} {lang.nativeName}</span>
      </div>
    </div>
  );
}
