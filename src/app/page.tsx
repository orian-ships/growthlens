"use client";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Now in beta — free audits for early users
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              See why their LinkedIn<br />
              <span className="gradient-text">grows faster than yours</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Enter any LinkedIn profile. Get a complete strategy breakdown — content pillars, posting patterns, engagement tactics, and an action playbook to close the gap.
            </p>
          </div>
          <div className="animate-fade-in-delay flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/audit" className="bg-accent hover:bg-accent-dim text-navy font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 animate-pulse-glow">
              Audit a Profile — Free
            </a>
            <a href="/compare" className="glass text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-navy-lighter transition-all">
              Compare Two Profiles
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6 border-t border-slate-600/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>You&apos;re posting into the void</h2>
          <p className="text-slate-400 text-center mb-16 text-lg max-w-2xl mx-auto">LinkedIn is the #1 growth channel for founders. But without data, you&apos;re guessing.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "😤", title: "No idea what's working", desc: "You post 3x/week but can't tell which content drives followers vs. falls flat." },
              { icon: "📉", title: "Competitors grow faster", desc: "They seem to crack the algorithm. You're stuck at the same follower count for months." },
              { icon: "🎯", title: "Posting without strategy", desc: "Random topics, random times, random formats. That's not a strategy — it's noise." },
              { icon: "🔍", title: "No way to reverse-engineer", desc: "You can see their posts but can't extract the patterns that make their strategy work." },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover:border-slate-600/30 transition-all">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-slate-600/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-16" style={{ fontFamily: 'Satoshi, sans-serif' }}>Three steps to LinkedIn clarity</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste a profile URL", desc: "Enter any LinkedIn profile — yours, a competitor's, or someone you admire.", icon: "🔗" },
              { step: "02", title: "AI analyzes everything", desc: "We scrape their profile & posts, then AI breaks down their entire strategy.", icon: "🧠" },
              { step: "03", title: "Get your playbook", desc: "Receive a scored audit with specific actions to replicate what works.", icon: "📋" },
            ].map((item, i) => (
              <div key={i} className="text-left">
                <span className="text-accent font-mono text-sm font-bold">{item.step}</span>
                <div className="text-4xl my-4">{item.icon}</div>
                <h3 className="text-white font-semibold text-xl mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features preview */}
      <section className="py-24 px-6 border-t border-slate-600/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16" style={{ fontFamily: 'Satoshi, sans-serif' }}>Everything you get in an audit</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Profile Score", desc: "0-100 completeness score with specific fixes for headline, about, banner, and featured sections.", color: "bg-accent" },
              { title: "Content Strategy", desc: "Posting frequency, content pillars, format breakdown, hook patterns, and hashtag analysis.", color: "bg-blue" },
              { title: "Engagement Intel", desc: "Average engagement rates, comment patterns, best posting times, and growth trajectory.", color: "bg-purple" },
              { title: "Top Posts Analysis", desc: "What made their viral posts work — hooks, formats, topics, and timing deconstructed.", color: "bg-amber" },
              { title: "Posting Heatmap", desc: "Visual heatmap of when they post and when their audience is most active.", color: "bg-red" },
              { title: "Action Playbook", desc: "Prioritized list of changes ranked by impact. Know exactly what to do first.", color: "bg-accent" },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-6 group hover:border-slate-600/30 transition-all">
                <div className={`w-3 h-3 rounded-full ${item.color} mb-4`} />
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-24 px-6 border-t border-slate-600/20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Get early access</h2>
          <p className="text-slate-400 mb-8">Join the waitlist for advanced features — automated weekly audits, trend alerts, and AI-written content suggestions.</p>
          {submitted ? (
            <div className="glass rounded-2xl p-6 text-accent font-semibold">✓ You&apos;re on the list. We&apos;ll be in touch.</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex gap-3">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-navy-light border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button type="submit" className="bg-accent hover:bg-accent-dim text-navy font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                Join Waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-600/20 text-center text-slate-500 text-sm">
        <p>© 2025 GrowthLens. Built for founders who take LinkedIn seriously.</p>
      </footer>
    </div>
  );
}
