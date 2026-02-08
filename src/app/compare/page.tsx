"use client";
import { useState } from "react";
import { mockProfileA, mockProfileB, mockGapAnalysis, type ProfileAudit } from "@/lib/mock-data";
import { ScoreRing, ProgressBar, DonutChart, RadarChart } from "@/components/charts";

function ProfileSummary({ audit }: { audit: ProfileAudit }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">{audit.profile.name.charAt(0)}</div>
        <div>
          <h3 className="text-lg font-bold text-white">{audit.profile.name}</h3>
          <p className="text-xs text-slate-400 line-clamp-1">{audit.profile.headline}</p>
        </div>
      </div>
      <div className="flex justify-center"><ScoreRing score={audit.overallScore} grade={audit.overallGrade} size={120} /></div>
      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="p-3 rounded-lg bg-navy/50"><div className="text-white font-bold">{audit.profile.followers.toLocaleString()}</div><div className="text-slate-500 text-xs">Followers</div></div>
        <div className="p-3 rounded-lg bg-navy/50"><div className="text-white font-bold">{audit.contentStrategy.postsPerWeek}/wk</div><div className="text-slate-500 text-xs">Posts</div></div>
        <div className="p-3 rounded-lg bg-navy/50"><div className="text-white font-bold">{audit.engagement.engagementRate}%</div><div className="text-slate-500 text-xs">Eng. Rate</div></div>
        <div className="p-3 rounded-lg bg-navy/50"><div className="text-white font-bold">{audit.engagement.avgLikes.toLocaleString()}</div><div className="text-slate-500 text-xs">Avg Likes</div></div>
      </div>
      <div className="space-y-3">
        {audit.breakdown.map((b, i) => (
          <ProgressBar key={i} value={b.score} max={b.max} label={b.category} color={b.score >= 80 ? "#10b981" : b.score >= 60 ? "#3b82f6" : b.score >= 40 ? "#f59e0b" : "#ef4444"} />
        ))}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Content Types</h4>
        <DonutChart data={audit.contentStrategy.contentTypes} />
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ a: ProfileAudit; b: ProfileAudit } | null>(null);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult({ a: mockProfileB, b: mockProfileA });
      setLoading(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full mx-auto mb-6" style={{ animation: "spin-slow 1s linear infinite" }} />
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>Comparing profiles...</h2>
          <p className="text-slate-400">Analyzing both profiles and generating gap report</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Compare Profiles</h1>
          <p className="text-slate-400 mb-8 text-lg">See exactly where you stand vs. a top performer</p>
          <form onSubmit={handleCompare} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block text-left mb-1">Your Profile</label>
              <input type="url" required placeholder="https://linkedin.com/in/you" value={urlA} onChange={(e) => setUrlA(e.target.value)}
                className="w-full bg-navy-light border border-slate-600/30 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 transition-colors" />
            </div>
            <div className="text-slate-500 text-2xl font-bold">vs</div>
            <div>
              <label className="text-sm text-slate-400 block text-left mb-1">Their Profile</label>
              <input type="url" required placeholder="https://linkedin.com/in/competitor" value={urlB} onChange={(e) => setUrlB(e.target.value)}
                className="w-full bg-navy-light border border-slate-600/30 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 transition-colors" />
            </div>
            <button type="submit" className="w-full bg-accent hover:bg-accent-dim text-navy font-bold px-8 py-4 rounded-xl text-lg transition-colors">
              Compare Profiles
            </button>
          </form>
        </div>
      </div>
    );
  }

  const gap = mockGapAnalysis;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>Profile Comparison</h1>
        <p className="text-slate-400 text-center mb-10">Side-by-side analysis with gap report</p>

        {/* Score comparison header */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-white">{result.a.profile.name}</div>
              <div className="text-slate-500 text-sm">Your Profile</div>
              <div className="mt-4 flex justify-center"><ScoreRing score={result.a.overallScore} grade={result.a.overallGrade} size={100} /></div>
            </div>
            <div className="text-center px-8">
              <div className="text-4xl font-black text-slate-600" style={{ fontFamily: 'Satoshi, sans-serif' }}>VS</div>
              <div className="mt-2 text-accent text-sm font-medium">+{result.b.overallScore - result.a.overallScore} point gap</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-white">{result.b.profile.name}</div>
              <div className="text-slate-500 text-sm">Top Performer</div>
              <div className="mt-4 flex justify-center"><ScoreRing score={result.b.overallScore} grade={result.b.overallGrade} size={100} /></div>
            </div>
          </div>
        </div>

        {/* Side by side */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="glass rounded-2xl p-8"><ProfileSummary audit={result.a} /></div>
          <div className="glass rounded-2xl p-8"><ProfileSummary audit={result.b} /></div>
        </div>

        {/* Gap Analysis */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>Gap Analysis</h2>
          <p className="text-slate-400 text-sm mb-6">Biggest gaps: {gap.summary.biggestGaps.join(" · ")}</p>
          <div className="space-y-4">
            {gap.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-navy/50 border border-slate-600/10">
                <div className="shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${rec.priority === "Critical" ? "bg-red/20 text-red" : rec.priority === "High" ? "bg-amber/20 text-amber" : rec.priority === "Medium" ? "bg-blue/20 text-blue" : "bg-slate-600/20 text-slate-400"}`}>
                    {rec.priority}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 text-sm">{rec.action}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-slate-500">Impact</div>
                  <div className="text-accent font-bold">{rec.impact}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Playbook */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>🎯 Your Action Playbook</h2>
          <p className="text-slate-400 text-sm mb-6">Prioritized by impact. Start from the top.</p>
          <div className="space-y-3">
            {gap.recommendations.filter(r => r.priority === "Critical" || r.priority === "High").map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
                <span className="text-accent font-bold text-lg mt-0.5">{i + 1}.</span>
                <p className="text-slate-200 text-sm">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button onClick={() => { setResult(null); setUrlA(""); setUrlB(""); }} className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Compare different profiles
          </button>
        </div>
      </div>
    </div>
  );
}
