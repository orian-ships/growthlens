"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";

export default function CompareCTA({ profileName, profileUrl }: { profileName: string; profileUrl?: string }) {
  const router = useRouter();
  const [compareUrl, setCompareUrl] = useState("");

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareUrl.trim()) return;
    const params = new URLSearchParams();
    if (profileUrl) params.set("profileA", profileUrl);
    params.set("profileB", compareUrl.trim());
    router.push(`/compare?${params.toString()}`);
  };

  return (
    <Card>
      <div className="text-center py-4">
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          See how you stack up
        </h3>
        <p className="text-slate-400 mb-6">
          Compare {profileName}&apos;s strategy against another LinkedIn profile
        </p>
        <form onSubmit={handleCompare} className="flex gap-3 max-w-lg mx-auto">
          <input
            type="url"
            required
            placeholder="https://linkedin.com/in/other-profile"
            value={compareUrl}
            onChange={e => setCompareUrl(e.target.value)}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-colors text-sm"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-dim text-navy font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            Compare →
          </button>
        </form>
      </div>
    </Card>
  );
}
