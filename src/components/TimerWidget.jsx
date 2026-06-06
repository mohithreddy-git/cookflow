import { useState, useEffect, useRef } from 'react';

export default function TimerWidget({ onClose }) {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Quick presets
  const PRESETS = [
    { label: '1 min', seconds: 60 },
    { label: '3 min', seconds: 180 },
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
    { label: '15 min', seconds: 900 },
    { label: '30 min', seconds: 1800 },
  ];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= totalSeconds) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setFinished(true);
            playBeep();
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, totalSeconds]);

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch { /* silent fail */ }
  }

  function applyPreset(secs) {
    setTotalSeconds(secs);
    setElapsed(0);
    setIsRunning(false);
    setFinished(false);
    setMinutes(Math.floor(secs / 60));
    setSeconds(secs % 60);
  }

  function toggleTimer() {
    if (finished) {
      setElapsed(0);
      setFinished(false);
    }
    setIsRunning((r) => !r);
  }

  function resetTimer() {
    setIsRunning(false);
    setElapsed(0);
    setFinished(false);
  }

  const remaining = Math.max(0, totalSeconds - elapsed);
  const displayMin = Math.floor(remaining / 60);
  const displaySec = remaining % 60;
  const progressPct = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="bg-white rounded-2xl shadow-chunky border-2 border-charcoal/8 p-5 w-64 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-charcoal flex items-center gap-2">
          <span>⏱️</span> Timer
        </h3>
        <button
          onClick={onClose}
          className="text-charcoal/30 hover:text-charcoal transition-colors text-lg leading-none"
          id="timer-close-btn"
        >
          ×
        </button>
      </div>

      {/* Circular progress */}
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#F4F1EA" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={finished ? '#81B29A' : '#E07A5F'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progressPct) / 100}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {finished ? (
              <span className="text-3xl animate-bounce">🔔</span>
            ) : (
              <>
                <span className="font-display text-2xl font-bold text-charcoal leading-none">
                  {String(displayMin).padStart(2, '0')}:{String(displaySec).padStart(2, '0')}
                </span>
                <span className="text-charcoal/40 text-xs mt-1">
                  {isRunning ? 'remaining' : 'paused'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-1 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.seconds)}
            className={`text-xs py-1.5 rounded-lg border font-body font-semibold transition-all duration-150
              ${totalSeconds === p.seconds
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-warmGray text-charcoal/60 border-charcoal/10 hover:border-terracotta'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          id="timer-play-btn"
          className={`flex-1 py-2 rounded-xl font-display font-semibold text-sm transition-all duration-200 border-2
            ${isRunning
              ? 'bg-orange/20 text-charcoal border-orange/40 hover:bg-orange/30'
              : finished
              ? 'bg-sage text-white border-sage'
              : 'bg-terracotta text-white border-terracotta hover:bg-terracotta-dark'
            }`}
        >
          {finished ? '↺ Restart' : isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-3 py-2 rounded-xl border-2 border-charcoal/10 text-charcoal/50 hover:border-charcoal/30 transition-all duration-200"
          id="timer-reset-btn"
        >
          ↺
        </button>
      </div>

      {finished && (
        <p className="text-center text-sage font-display font-semibold text-sm mt-3 animate-pulse">
          🎉 Time's up! Check your dish!
        </p>
      )}
    </div>
  );
}
