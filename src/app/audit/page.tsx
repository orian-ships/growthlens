"use client";
import { useState } from "react";
import { mockProfileA, type ProfileAudit } from "@/lib/mock-data";
import { DonutChart, BarChart, HeatmapGrid, ScoreRing, ProgressBar, RadarChart } from "@/components/charts";

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<ProfileAudit | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setAudit(mockProfileA);
      setLoading(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full mx-auto mb-6" style={{ animation: "spin-slow 1s linear infinite" }} />
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>Analyzing profile...</h2>
          <p className="text-slate-400">Scraping posts, analyzing patterns, generating insights</p>
          <div className="mt-8 space-y-3 max-w-xs mx-auto text-left">
            {["Fetching profile data", "Scraping recent posts", "Analyzing content patterns", "Generating audit report"].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-400 animate-fade-in" style={{ animationDelay: `${i * 0.6}s` }}>
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-accent" /></span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Audit a LinkedIn Profile</h1>
          <p className="text-slate-400 mb-8 text-lg">Paste any LinkedIn profile URL to get a full strategy breakdown</p>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="url"
              required
              placeholder="https://linkedin.com/in/username"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-navy-light border border-slate-600/30 rounded-xl px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 transition-colors text-lg"
            />
            <button type="submit" className="bg-accent hover:bg-accent-dim text-navy font-bold px-8 py-4 rounded-xl text-lg transition-colors whitespace-nowrap">
              Analyze
            </button>
          </form>
          <p className="text-slate-500 text-sm mt-4">Try it with any LinkedIn URL — we&apos;ll show a demo audit</p>
        </div>
      </div>
    );
  }

  const { profile, contentStrategy, engagement } = audit;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">{profile.name.charAt(0)}</div>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>{profile.name}</h1>
                <p className="text-slate-400 text-sm">{profile.headline}</p>
              </div>
            </div>
            <div className="flex gap-6 mt-3 text-sm">
              <span className="text-slate-400"><span className="text-white font-semibold">{profile.followers.toLocaleString()}</span> followers</span>
              <span className="text-slate-400"><span className="text-white font-semibold">{profile.connections.toLocaleString()}</span> connections</span>
            </div>
          </div>
          <ScoreRing score={audit.overallScore} grade={audit.overallGrade} />
        </div>

        {/* Overview radar */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Overall Breakdown</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <RadarChart data={audit.breakdown} />
            <div className="flex-1 space-y-4 w-full">
              {audit.breakdown.map((b, i) => (
                <ProgressBar key={i} value={b.score} max={b.max} label={b.category} color={b.score >= 80 ? "#10b981" : b.score >= 60 ? "#3b82f6" : b.score >= 40 ? "#f59e0b" : "#ef4444"} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Audit */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Profile Audit</h2>
            <div className="space-y-5">
              <ProgressBar value={profile.completenessScore} label="Profile Completeness" />
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Headline</span><span className="text-accent">{profile.headlineAnalysis.effectiveness}/100</span></div>
                <p className="text-xs text-slate-500">Formula: {profile.headlineAnalysis.formula}</p>
                <p className="text-xs text-slate-400 mt-1">💡 {profile.headlineAnalysis.suggestion}</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">About Section</span><span className="text-accent">{profile.aboutAnalysis.score}/100</span></div>
                <p className="text-xs text-slate-500">Structure: {profile.aboutAnalysis.structure}</p>
                <div className="flex gap-3 mt-1">
                  <span className={`text-xs ${profile.aboutAnalysis.hasHook ? "text-accent" : "text-red"}`}>{profile.aboutAnalysis.hasHook ? "✓" : "✗"} Hook</span>
                  <span className={`text-xs ${profile.aboutAnalysis.hasCTA ? "text-accent" : "text-red"}`}>{profile.aboutAnalysis.hasCTA ? "✓" : "✗"} CTA</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Banner</span><span className="text-accent">{profile.bannerAssessment.score}/100</span></div>
                <p className="text-xs text-slate-500">{profile.bannerAssessment.quality}</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Featured Section</span><span className={profile.featuredSection.hasItems ? "text-accent text-xs" : "text-red text-xs"}>{profile.featuredSection.hasItems ? `${profile.featuredSection.count} items` : "Empty"}</span></div>
                {profile.featuredSection.types.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">{profile.featuredSection.types.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{t}</span>)}</div>
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Experience Framing</span><span className="text-accent">{profile.experienceFraming.score}/100</span></div>
                <div className="flex gap-3 mt-1">
                  <span className={`text-xs ${profile.experienceFraming.actionOriented ? "text-accent" : "text-red"}`}>{profile.experienceFraming.actionOriented ? "✓" : "✗"} Action-oriented</span>
                  <span className={`text-xs ${profile.experienceFraming.metricsUsed ? "text-accent" : "text-red"}`}>{profile.experienceFraming.metricsUsed ? "✓" : "✗"} Uses metrics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Engagement Analysis</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Avg Likes", value: engagement.avgLikes.toLocaleString() },
                { label: "Avg Comments", value: engagement.avgComments.toLocaleString() },
                { label: "Avg Shares", value: engagement.avgShares.toLocaleString() },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-navy/50">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm"><span className="text-slate-300">Engagement Rate</span><span className="text-accent font-semibold">{engagement.engagementRate}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-300">Reply Rate</span><span className="text-white">{engagement.replyRate}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-300">Avg Reply Time</span><span className="text-white">{engagement.avgReplyTime}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-300">Growth Estimate</span><span className="text-accent font-semibold">{engagement.growthEstimate}</span></div>
            </div>
          </div>

          {/* Content Types */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Content Type Breakdown</h2>
            <DonutChart data={contentStrategy.contentTypes} />
          </div>

          {/* Posting Frequency */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Posting Frequency</h2>
            <div className="text-3xl font-bold text-white mb-1">{contentStrategy.postsPerWeek}<span className="text-slate-500 text-lg font-normal"> posts/week</span></div>
            <div className="mt-4">
              <BarChart data={contentStrategy.weeklyFrequency} max={8} />
              <p className="text-xs text-slate-500 mt-2">Posts per week — last 12 weeks</p>
            </div>
          </div>

          {/* Content Pillars */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Content Pillars</h2>
            <div className="space-y-3">
              {contentStrategy.contentPillars.map((pillar, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{pillar.topic}</span><span className="text-slate-400">{pillar.percentage}%</span></div>
                  <div className="h-2 bg-slate-600/20 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pillar.percentage}%`, opacity: 1 - i * 0.15 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hook Patterns */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Hook Patterns</h2>
            <div className="space-y-3">
              {contentStrategy.hookPatterns.map((hook, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-300">{hook.pattern}</div>
                  <div className="flex-1 h-6 bg-slate-600/20 rounded overflow-hidden">
                    <div className="h-full bg-accent/60 rounded flex items-center pl-2 text-xs text-white font-medium" style={{ width: `${hook.percentage}%` }}>
                      {hook.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div className="glass rounded-2xl p-8 mt-8">
          <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Top Performing Posts</h2>
          <div className="space-y-4">
            {contentStrategy.topPosts.map((post, i) => (
              <div key={i} className="p-4 rounded-xl bg-navy/50 border border-slate-600/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent mb-2 inline-block">{post.type}</span>
                    <p className="text-slate-300 text-sm">&ldquo;{post.text}&rdquo;</p>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400 shrink-0">
                    <span>❤️ {post.likes.toLocaleString()}</span>
                    <span>💬 {post.comments}</span>
                    <span>🔄 {post.shares}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Hashtag Strategy</h2>
            <div className="text-sm text-slate-400 mb-3">Average {contentStrategy.hashtagStrategy.avg} hashtags per post</div>
            <div className="flex flex-wrap gap-2">
              {contentStrategy.hashtagStrategy.topHashtags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm">{tag}</span>
              ))}
            </div>
          </div>

          {/* Posting Schedule */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>Posting Schedule</h2>
            <HeatmapGrid data={contentStrategy.postingSchedule} />
          </div>
        </div>

        {/* Back */}
        <div className="mt-12 text-center">
          <button onClick={() => { setAudit(null); setUrl(""); }} className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Audit another profile
          </button>
        </div>
      </div>
    </div>
  );
}
