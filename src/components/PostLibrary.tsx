"use client";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui";
import { getPillarDistribution, PILLARS } from "@/lib/scoring/pillar-classifier";

type Post = {
  text: string;
  likes: number;
  comments: number;
  shares: number;
  type: string;
  url?: string;
  pillar?: string;
  postedAt?: number;
};

type SortOption = "likes" | "comments" | "shares" | "engagement" | "recent";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "likes", label: "Most Likes" },
  { value: "comments", label: "Most Comments" },
  { value: "shares", label: "Most Shares" },
  { value: "engagement", label: "Highest Engagement Rate" },
  { value: "recent", label: "Most Recent" },
];

const PILLAR_COLORS: Record<string, string> = {
  "Thought Leadership": "#8b5cf6",
  "Industry News": "#3b82f6",
  "Personal Stories": "#f59e0b",
  "How-To / Educational": "#10b981",
  "Company Updates": "#06b6d4",
  "Culture & Values": "#ec4899",
  "Engagement Bait": "#f97316",
  "Case Studies": "#14b8a6",
  "Networking / Shoutouts": "#a78bfa",
  "Career & Hiring": "#6366f1",
};

export default function PostLibrary({ posts, followers }: { posts: Post[]; followers: number }) {
  const [sortBy, setSortBy] = useState<SortOption>("likes");
  const [filterPillar, setFilterPillar] = useState<string>("all");
  const [showCount, setShowCount] = useState(10);

  const filtered = filterPillar === "all" ? posts : posts.filter(p => p.pillar === filterPillar);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "likes": return b.likes - a.likes;
      case "comments": return b.comments - a.comments;
      case "shares": return b.shares - a.shares;
      case "engagement": {
        const f = followers || 1;
        const eA = (a.likes + a.comments) / f;
        const eB = (b.likes + b.comments) / f;
        return eB - eA;
      }
      case "recent": return (b.postedAt || 0) - (a.postedAt || 0);
      default: return 0;
    }
  });

  const visible = sorted.slice(0, showCount);
  const hasMore = showCount < sorted.length;

  // Pillar distribution
  const pillarDist = getPillarDistribution(posts);

  return (
    <div className="space-y-6">
      {/* Pillar Distribution */}
      <Card>
        <CardHeader title="Content Pillars" subtitle={`Distribution across ${posts.length} posts`} />
        <div className="space-y-3">
          {pillarDist.map((p, i) => (
            <button
              key={i}
              onClick={() => setFilterPillar(filterPillar === p.pillar ? "all" : p.pillar)}
              className={`w-full text-left group ${filterPillar === p.pillar ? "ring-1 ring-accent/30 rounded-lg p-1 -m-1" : ""}`}
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PILLAR_COLORS[p.pillar] || "#64748b" }} />
                  {p.pillar}
                </span>
                <span className="text-slate-400">{p.percentage}% ({p.count})</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${p.percentage}%`, background: PILLAR_COLORS[p.pillar] || "#64748b" }}
                />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Post Library */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <CardHeader title="Post Library" subtitle={`${sorted.length} posts${filterPillar !== "all" ? ` · Filtered: ${filterPillar}` : ""}`} />
          <div className="flex gap-3 flex-wrap">
            {filterPillar !== "all" && (
              <button
                onClick={() => setFilterPillar("all")}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                ✕ Clear filter
              </button>
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-accent/40"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {visible.map((post, i) => {
            const Wrapper = post.url ? "a" : "div";
            const linkProps = post.url ? { href: post.url, target: "_blank" as const, rel: "noopener noreferrer" } : {};
            const engRate = followers > 0 ? (((post.likes + post.comments) / followers) * 100).toFixed(2) : null;
            return (
              <Wrapper
                key={i}
                {...linkProps}
                className={`flex flex-col sm:flex-row items-start justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] ${post.url ? "hover:border-accent/20 hover:bg-white/[0.04] transition-colors cursor-pointer" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{post.type}</span>
                    {post.pillar && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border"
                        style={{
                          color: PILLAR_COLORS[post.pillar] || "#94a3b8",
                          borderColor: (PILLAR_COLORS[post.pillar] || "#94a3b8") + "33",
                          background: (PILLAR_COLORS[post.pillar] || "#94a3b8") + "15",
                        }}
                      >
                        {post.pillar}
                      </span>
                    )}
                    {post.url && <span className="text-[10px] text-slate-500">↗ View on LinkedIn</span>}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{post.text}&rdquo;</p>
                </div>
                <div className="flex gap-4 text-xs text-slate-400 shrink-0 pt-1">
                  <span>❤️ {post.likes.toLocaleString()}</span>
                  <span>💬 {post.comments}</span>
                  <span>🔄 {post.shares}</span>
                  {engRate && sortBy === "engagement" && <span>📊 {engRate}%</span>}
                </div>
              </Wrapper>
            );
          })}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowCount(s => s + 10)}
            className="mt-4 w-full py-3 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-colors text-sm"
          >
            Show more ({sorted.length - showCount} remaining)
          </button>
        )}
      </Card>
    </div>
  );
}
