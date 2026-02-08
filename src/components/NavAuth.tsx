"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "./LoginModal";

export default function NavAuth() {
  const { user, logout, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/dashboard/trends" className="text-sm text-slate-400 hover:text-white transition-colors">
          My Dashboard
        </a>
        <span className="text-xs text-slate-500">{user.email}</span>
        <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="text-sm px-4 py-2 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20 transition-colors"
      >
        Sign in
      </button>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
