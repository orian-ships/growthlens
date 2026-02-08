"use client";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-36 px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Now in beta — free audits for early users
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-8">
              See why their LinkedIn<br />
              <span className="gradient-text">grows faster than yours</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Enter any LinkedIn profile. Get a complete strategy breakdown — content pillars, posting patterns, engagement tactics, and an action playbook to close the gap.
            </p>
          </div>
          <div className="animate-fade-in-delay flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/audit" className="bg-accent hover:bg-accent-dim text-navy font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] animate-pulse-glow inline-block">
              Audit a Profile — Free
            </a>
            <a href="/compare" className="card text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-navy-lighter transition-all inline-block">
              Compare Two Profiles
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-28 px-8 section-divider">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-mono text-sm font-semibold tracking-wider">THE PROBLEM</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-5">You&apos;re posting into the void</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">LinkedIn is the #1 growth channel for founders. But without data, you&apos;re guessing.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: "😤", title: "No idea what's working", desc: "You post 3x/week but can't tell which content drives followers vs. falls flat." },
              { icon: "📉", title: "Competitors grow faster", desc: "They seem to crack the algorithm. You're stuck at the same follower count for months." },
              { icon: "🎯", title: "Posting without strategy", desc: "Random topics, random times, random formats. That's not a strategy — it's noise." },
              { icon: "🔍", title: "No way to reverse-engineer", desc: "You can see their posts but can't extract the patterns that make their strategy work." },
            ].map((item, i) => (
              <div key={i} className="card p-7">
                <span className="text-2xl mb-4 block">{item.icon}</span>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-8 section-divider">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-mono text-sm font-semibold tracking-wider">HOW IT WORKS</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">Three steps to LinkedIn clarity</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Paste a profile URL", desc: "Enter any LinkedIn profile — yours, a competitor's, or someone you admire.", icon: "🔗" },
              { step: "02", title: "AI analyzes everything", desc: "We scrape their profile & posts, then AI breaks down their entire strategy.", icon: "🧠" },
              { step: "03", title: "Get your playbook", desc: "Receive a scored audit with specific actions to replicate what works.", icon: "📋" },
            ].map((item, i) => (
              <div key={i}>
                <span className="text-accent font-mono text-xs font-bold tracking-widest">{item.step}</span>
                <div className="text-4xl mt-4 mb-5">{item.icon}</div>
                <h3 className="text-white font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-8 section-divider">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-mono text-sm font-semibold tracking-wider">FEATURES</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">Everything you get in an audit</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "Profile Score", desc: "0-100 completeness score with specific fixes for headline, about, banner, and featured sections.", color: "#10b981" },
              { title: "Content Strategy", desc: "Posting frequency, content pillars, format breakdown, hook patterns, and hashtag analysis.", color: "#3b82f6" },
              { title: "Engagement Intel", desc: "Average engagement rates, comment patterns, best posting times, and growth trajectory.", color: "#8b5cf6" },
              { title: "Top Posts Analysis", desc: "What made their viral posts work — hooks, formats, topics, and timing deconstructed.", color: "#f59e0b" },
              { title: "Posting Heatmap", desc: "Visual heatmap of when they post and when their audience is most active.", color: "#ef4444" },
              { title: "Action Playbook", desc: "Prioritized list of changes ranked by impact. Know exactly what to do first.", color: "#10b981" },
            ].map((item, i) => (
              <div key={i} className="card p-7 group">
                <div className="w-2.5 h-2.5 rounded-full mb-5" style={{ backgroundColor: item.color }} />
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-28 px-8 section-divider">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get early access</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">Join the waitlist for advanced features — automated weekly audits, trend alerts, and AI-written content suggestions.</p>
          {submitted ? (
            <div className="card p-6 text-accent font-semibold">✓ You&apos;re on the list. We&apos;ll be in touch.</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex gap-3">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-navy-light border border-slate-600/20 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/40 transition-colors"
              />
              <button type="submit" className="bg-accent hover:bg-accent-dim text-navy font-semibold px-6 py-3.5 rounded-xl transition-all hover:scale-[1.02] whitespace-nowrap">
                Join Waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 px-8 section-divider text-center">
        <p className="text-slate-500 text-sm">© 2026 GrowthLens. Built for founders who take LinkedIn seriously.</p>
      </footer>
    </div>
  );
}
