import { useState } from 'react';

export default function VideoGuide({
  dish, videos, selectedVideo, onSelectVideo,
  ingredients, steps, checkedItems, onCheck, activeStep, onStepChange,
}) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('steps'); // 'steps' | 'ingredients'

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* ── Left: Video Player ── */}
      <div className="flex-1 min-w-0">
        {/* Main player */}
        <div className="card p-0 overflow-hidden">
          {selectedVideo ? (
            <>
              <div className="aspect-video w-full bg-charcoal">
                <iframe
                  key={selectedVideo.videoId}
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?rel=0&modestbranding=1&autoplay=0`}
                  title={selectedVideo.title || `${dish} recipe video`}
                  allowFullScreen
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-charcoal truncate">
                  {selectedVideo.title || `${dish} — Cooking Video`}
                </h3>
                <p className="text-charcoal/50 text-sm mt-1">Watch and follow along at your own pace</p>
              </div>
            </>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center bg-warmGray gap-4">
              <span className="text-5xl">📹</span>
              <p className="text-charcoal/50 font-body">Searching for videos…</p>
            </div>
          )}
        </div>

        {/* Video thumbnails */}
        {videos.length > 1 && (
          <div className="mt-3">
            <p className="text-xs text-charcoal/40 uppercase tracking-widest font-semibold mb-2">
              More Videos
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {videos.map((vid, i) => (
                <button
                  key={vid.videoId || i}
                  onClick={() => onSelectVideo(vid)}
                  id={`video-thumb-${i}`}
                  className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 w-40 text-left
                    ${selectedVideo?.videoId === vid.videoId
                      ? 'border-terracotta shadow-chunky scale-[1.02]'
                      : 'border-charcoal/10 hover:border-terracotta hover:shadow-chunky-sm'
                    }`}
                >
                  {vid.thumbnailUrl ? (
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title || `Video ${i + 1}`}
                      className="w-full aspect-video object-cover"
                      onError={(e) => { e.target.src = `https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg`; }}
                    />
                  ) : (
                    <div className="w-full aspect-video bg-warmGray flex items-center justify-center text-2xl">
                      ▶️
                    </div>
                  )}
                  {vid.title && (
                    <div className="bg-white px-2 py-1.5">
                      <p className="text-charcoal text-xs font-body line-clamp-2 leading-snug">{vid.title}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {videos.length === 0 && (
          <div className="mt-4 card bg-orange/10 border-orange/30 text-center py-6">
            <p className="text-charcoal/60 text-sm">
              🔍 No videos found for "{dish}" — try the text guide for the full recipe.
            </p>
          </div>
        )}
      </div>

      {/* ── Right: Sidebar ── */}
      <div className="lg:w-80 shrink-0">
        {/* Sidebar toggle */}
        <div className="flex gap-1 bg-warmGray rounded-xl p-1 border-2 border-charcoal/5 mb-3">
          <button
            onClick={() => setSidebarTab('steps')}
            id="sidebar-steps-tab"
            className={`flex-1 py-2 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${sidebarTab === 'steps' ? 'bg-white text-terracotta shadow-chunky-sm' : 'text-charcoal/50'}`}
          >
            📖 Steps
          </button>
          <button
            onClick={() => setSidebarTab('ingredients')}
            id="sidebar-ingredients-tab"
            className={`flex-1 py-2 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${sidebarTab === 'ingredients' ? 'bg-white text-terracotta shadow-chunky-sm' : 'text-charcoal/50'}`}
          >
            🧺 Ingredients
          </button>
        </div>

        <div className="card max-h-[calc(100vh-220px)] overflow-y-auto">
          {sidebarTab === 'steps' ? (
            <div className="space-y-2">
              <p className="text-xs text-charcoal/40 uppercase tracking-widest font-semibold mb-3">
                Follow along
              </p>
              {steps.map((step, i) => {
                const isActive = i === activeStep;
                const isDone = i < activeStep;
                return (
                  <button
                    key={i}
                    onClick={() => onStepChange(i)}
                    id={`video-step-${i}`}
                    className={`w-full text-left rounded-xl border-2 p-3 transition-all duration-200
                      ${isActive
                        ? 'border-terracotta bg-terracotta/5'
                        : isDone
                        ? 'border-sage/30 bg-sage/5 opacity-60'
                        : 'border-charcoal/8 hover:border-charcoal/20'
                      }`}
                  >
                    <div className="flex gap-2 items-start">
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                        ${isActive ? 'bg-terracotta text-white border-terracotta' : isDone ? 'bg-sage text-white border-sage' : 'bg-warmGray text-charcoal/50 border-charcoal/10'}`}>
                        {isDone ? '✓' : i + 1}
                      </span>
                      <p className={`text-xs font-body leading-relaxed line-clamp-3 ${isActive ? 'text-charcoal font-semibold' : 'text-charcoal/60'}`}>
                        {step}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-charcoal/40 uppercase tracking-widest font-semibold mb-3">
                Ingredients checklist
              </p>
              {ingredients.map((ing, i) => {
                const key = `ing-${i}`;
                const isChecked = !!checkedItems[key];
                return (
                  <label
                    key={key}
                    htmlFor={`video-${key}`}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-sage-light/20 transition-colors select-none ${isChecked ? 'opacity-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      id={`video-${key}`}
                      checked={isChecked}
                      onChange={() => onCheck(key)}
                      className="w-4 h-4 accent-sage rounded"
                    />
                    <span className={`text-xs font-body ${isChecked ? 'line-through text-charcoal/40' : 'text-charcoal'}`}>
                      <strong>{ing.name}</strong>
                      {ing.measure && <span className="text-charcoal/40"> — {ing.measure}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Step nav in video mode */}
        {sidebarTab === 'steps' && steps.length > 0 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onStepChange(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="flex-1 btn-secondary text-sm py-2 disabled:opacity-30"
            >
              ← Prev
            </button>
            <button
              onClick={() => onStepChange(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep >= steps.length - 1}
              className="flex-1 btn-primary text-sm py-2 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
