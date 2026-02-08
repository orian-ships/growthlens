"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // TODO: Call Convex sendMagicLink action and wait for verification
    // For now, simplified direct login
    login(email.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f1729] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          Sign in to GrowthLens
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Track profiles, view trends, and get weekly digests.
        </p>

        {step === "email" ? (
          <form onSubmit={handleSubmit}>
            <label className="text-sm text-slate-400 block mb-2">Email address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-colors mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dim text-navy font-bold py-3 rounded-xl transition-colors"
            >
              Continue with Email →
            </button>
            <p className="text-slate-500 text-xs mt-3 text-center">
              We&apos;ll send you a magic link to sign in. No password needed.
            </p>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">📧</div>
            <p className="text-white font-semibold mb-2">Check your email</p>
            <p className="text-slate-400 text-sm">We sent a login link to <span className="text-accent">{email}</span></p>
            <button onClick={() => setStep("email")} className="text-slate-500 hover:text-white text-sm mt-4 transition-colors">
              Use a different email
            </button>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl">×</button>
      </div>
    </div>
  );
}
