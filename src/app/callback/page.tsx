'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Composio redirects back after auth — close the window or redirect to audit
    const connected = searchParams.get('connected_account_id');
    if (connected) {
      setStatus('success');
      // Store the connection in localStorage
      localStorage.setItem('gl_twitter_connected', 'true');
      localStorage.setItem('gl_twitter_account_id', connected);
      // Auto-close or redirect after 2s
      setTimeout(() => {
        window.close();
        // If window.close() doesn't work (not opened by script), redirect
        window.location.href = '/audit';
      }, 2000);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <div className="text-zinc-400">Connecting your account...</div>
        )}
        {status === 'success' && (
          <div>
            <div className="text-2xl mb-2">✅</div>
            <div className="text-white font-semibold">Account connected!</div>
            <div className="text-zinc-400 text-sm mt-1">Redirecting back to audit...</div>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="text-2xl mb-2">❌</div>
            <div className="text-white font-semibold">Connection failed</div>
            <div className="text-zinc-400 text-sm mt-1">
              <a href="/audit" className="underline">Go back to audit</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
