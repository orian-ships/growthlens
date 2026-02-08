"use client";

export function DonutChart({ data }: { data: { type: string; percentage: number; color: string }[] }) {
  let cumulative = 0;
  const size = 160;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {data.map((item, i) => {
          const offset = circumference * (1 - cumulative / 100);
          const length = circumference * (item.percentage / 100);
          cumulative += item.percentage;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span className="text-slate-300">{item.type}</span>
            <span className="text-slate-500">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data, max }: { data: number[]; max?: number }) {
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
  const maxVal = max || Math.max(...data);
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-accent/80 rounded-t-sm min-h-[2px] transition-all"
            style={{ height: `${(val / maxVal) * 100}%` }}
          />
          <span className="text-[10px] text-slate-500">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function HeatmapGrid({ data }: { data: number[][] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxVal = Math.max(...data.flat());
  return (
    <div className="space-y-1">
      <div className="flex gap-1 ml-10">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="w-4 text-center text-[8px] text-slate-500">
            {i % 4 === 0 ? `${i}` : ""}
          </div>
        ))}
      </div>
      {data.map((row, dayIdx) => (
        <div key={dayIdx} className="flex items-center gap-1">
          <span className="w-8 text-xs text-slate-500 text-right">{days[dayIdx]}</span>
          <div className="flex gap-0.5">
            {row.map((val, hourIdx) => (
              <div
                key={hourIdx}
                className="w-4 h-4 rounded-sm"
                style={{
                  background: val === 0
                    ? "rgba(148,163,184,0.05)"
                    : `rgba(16,185,129,${Math.min(val / Math.max(maxVal, 1), 1) * 0.8 + 0.2})`,
                }}
                title={`${days[dayIdx]} ${hourIdx}:00 — ${val} posts`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScoreRing({ score, grade, size = 140 }: { score: number; grade: string; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-black text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>{grade}</div>
        <div className="text-sm text-slate-400">{score}/100</div>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = "#10b981", label }: { value: number; max?: number; color?: string; label?: string }) {
  return (
    <div className="space-y-1">
      {label && <div className="flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="text-slate-400">{value}/{max}</span></div>}
      <div className="h-2 bg-slate-600/20 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

export function RadarChart({ data }: { data: { category: string; score: number; max: number }[] }) {
  const size = 240;
  const center = size / 2;
  const maxRadius = 90;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const points = data.map((d, i) => getPoint(i, d.score));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[20, 40, 60, 80, 100].map((level) => {
        const pts = data.map((_, i) => getPoint(i, level));
        return <polygon key={level} points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="rgba(148,163,184,0.1)" />;
      })}
      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(148,163,184,0.1)" />;
      })}
      <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2" />
      {data.map((d, i) => {
        const p = getPoint(i, 110);
        return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="11">{d.category}</text>;
      })}
    </svg>
  );
}
