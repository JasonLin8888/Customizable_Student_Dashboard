import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

type Phase = 'work' | 'short-break' | 'long-break';

const PHASE_DURATIONS: Record<Phase, number> = {
  'work': 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const PHASE_LABELS: Record<Phase, string> = {
  'work': 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

const PHASE_COLORS: Record<Phase, string> = {
  'work': '#6366f1',
  'short-break': '#10b981',
  'long-break': '#3b82f6',
};

export default function PomodoroWidget() {
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATIONS['work']);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            if (phase === 'work') setSessions((s) => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase]);

  const switchPhase = (p: Phase) => {
    setRunning(false);
    setPhase(p);
    setTimeLeft(PHASE_DURATIONS[p]);
  };

  const reset = () => {
    setRunning(false);
    setTimeLeft(PHASE_DURATIONS[phase]);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const total = PHASE_DURATIONS[phase];
  const progress = ((total - timeLeft) / total) * 100;
  const color = PHASE_COLORS[phase];

  return (
    <div className="flex flex-col items-center h-full justify-between py-2">
      {/* Phase tabs */}
      <div className="flex gap-1 w-full justify-center">
        {(Object.keys(PHASE_DURATIONS) as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              phase === p
                ? 'text-white border-transparent'
                : 'text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
            style={phase === p ? { backgroundColor: color } : {}}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Circular progress */}
      <div className="relative flex items-center justify-center my-2">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="70" cy="70" r="60"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 0.5s' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>
            {mins}:{secs}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">{PHASE_LABELS[phase]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button onClick={reset} className="text-gray-400 hover:text-gray-600">
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: color }}
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Coffee size={14} />
          <span>{sessions}</span>
        </div>
      </div>

      <p className="text-[10px] text-gray-400">Sessions completed: {sessions}</p>
    </div>
  );
}
