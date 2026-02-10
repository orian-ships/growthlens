"use client";
import { useState, useEffect } from "react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://patient-toucan-352.eu-west-1.convex.site";

type Step = "ask" | "positive-detail" | "negative-detail" | "done";

export default function FeedbackPrompt({ auditId, profileUrl }: { auditId: string; profileUrl: string }) {
  const [step, setStep] = useState<Step>("ask");
  const [comment, setComment] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    fetch(`${CONVEX_URL}/api/feedback/check?auditId=${encodeURIComponent(auditId)}`)
      .then((r) => r.json())
      .then((data) => { if (data) setAlreadySubmitted(true); })
      .catch(() => {});
  }, [auditId]);

  const submit = async (rating: "positive" | "negative") => {
    setSubmitting(true);
    try {
      await fetch(`${CONVEX_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          profileUrl,
          rating,
          comment: comment || undefined,
          testimonial: testimonial || undefined,
          displayName: displayName || undefined,
        }),
      });
      setStep("done");
    } catch {
      // silent fail
    }
    setSubmitting(false);
  };

  if (alreadySubmitted || step === "done") {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 text-center">
        <p className="text-slate-400 text-sm">
          {step === "done" ? "Thanks for your feedback! 🙏" : ""}
        </p>
      </div>
    );
  }

  if (step === "ask") {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8 text-center">
        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Was this audit helpful?
        </h3>
        <p className="text-slate-400 text-sm mb-6">Your feedback helps us improve GrowthLens</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setStep("positive-detail")}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20"
          >
            👍 Yes, useful!
          </button>
          <button
            onClick={() => setStep("negative-detail")}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-white/[0.05] text-slate-300 border border-white/10 hover:bg-white/10"
          >
            👎 Could be better
          </button>
        </div>
      </div>
    );
  }

  if (step === "positive-detail") {
    return (
      <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-8">
        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Glad you liked it! 🎉
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Would you mind sharing a quick testimonial? It helps others discover GrowthLens.
        </p>
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Your name (shown publicly)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-accent/40"
          />
          <textarea
            placeholder="What did you find most valuable? (optional)"
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-accent/40 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => submit("positive")}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Submit"}
          </button>
          <button
            onClick={() => { submit("positive"); }}
            className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  // negative-detail
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8">
      <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
        We&apos;ll do better 💪
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        What could we improve? This goes directly to our team.
      </p>
      <textarea
        placeholder="What was missing or inaccurate?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-accent/40 resize-none mb-4"
      />
      <div className="flex gap-3">
        <button
          onClick={() => submit("negative")}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
