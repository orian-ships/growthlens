"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader } from "@/components/ui";

// Simple line chart component for trends
function TrendLine({ data, label, color }: { data: { week: number; value: number }[]; label: string; color: string }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const width = 100;
  const height = 40;
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - (d.value / maxVal) * (height - 4);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">{label}</span>
        <span style={{ color }} className="font-semibold">{data[data.length - 1]?.value ?? "—"}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / Math.max(data.length - 1, 1)) * width;
          const y = height - (d.value / maxVal) * (height - 4);
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>W{data[0]?.week}</span>
        <span>W{data[data.length - 1]?.week}</span>
      </div>
    </div>
  );
}

function WeeklyDiff({ current, previous, label }: { current: number; previous: number; label: string }) {
  const delta = current - previous;
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  const color = delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-slate-400";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold">{current}</span>
        <span className={`text-sm font-medium ${color}`}>{arrow} {Math.abs(delta)}</span>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  const { user, isLoading } = useAuth();
  const [range] = useState<"4w" | "8w" | "12w">("8w");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full" style={{ animation: "spin-slow 1s linear infinite" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to view trends</h2>
          <p className="text-slate-400 mb-6">Track profiles over time and see your progress.</p>
          <a href="/audit" className="text-accent hover:underline">Run an audit first →</a>
        </div>
      </div>
    );
  }

  // TODO: Fetch real data from Convex auditSnapshots
  // For now, show placeholder with structure
  const mockTrend = [
    { week: 1, value: 62 },
    { week: 2, value: 65 },
    { week: 3, value: 63 },
    { week: 4, value: 68 },
    { week: 5, value: 71 },
    { week: 6, value: 70 },
    { week: 7, value: 74 },
    { week: 8, value: 78 },
  ];

  const mockEngagement = mockTrend.map(d => ({ ...d, value: +(d.value * 0.06).toFixed(1) }));
  const mockFrequency = mockTrend.map(d => ({ ...d, value: Math.round(d.value * 0.05 * 10) / 10 }));

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>Trends Dashboard</h1>
          <p className="text-slate-400 mt-2">Track your LinkedIn growth over time</p>
        </div>

        {/* Weekly Diff */}
        <Card>
          <CardHeader title="This Week vs Last Week" />
          <div className="space-y-2">
            <WeeklyDiff current={78} previous={74} label="Overall Score" />
            <WeeklyDiff current={4.7} previous={4.2} label="Engagement Rate %" />
            <WeeklyDiff current={3.9} previous={3.5} label="Posts/Week" />
          </div>
        </Card>

        {/* Trend Charts */}
        <div className="grid md:grid-cols-1 gap-6">
          <Card>
            <CardHeader title="Overall Score" subtitle={`Last ${range === "4w" ? "4" : range === "8w" ? "8" : "12"} weeks`} />
            <TrendLine data={mockTrend} label="Score" color="#10b981" />
          </Card>

          <Card>
            <CardHeader title="Engagement Rate" />
            <TrendLine data={mockEngagement} label="Eng. Rate %" color="#3b82f6" />
          </Card>

          <Card>
            <CardHeader title="Posting Frequency" />
            <TrendLine data={mockFrequency} label="Posts/Week" color="#f59e0b" />
          </Card>
        </div>

        {/* Tracked Profiles */}
        <Card>
          <CardHeader title="Tracked Profiles" subtitle="Max 5 profiles" />
          <p className="text-slate-500 text-sm">
            No profiles tracked yet. Run an audit and click &quot;Track this profile&quot; to start monitoring.
          </p>
        </Card>
      </div>
    </div>
  );
}
