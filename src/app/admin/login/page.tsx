"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const authError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error: authErr } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${baseUrl}/admin/auth/callback` },
    });
    setLoading(false);
    if (authErr) { setError(authErr.message); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="font-cormorant italic text-[28px] tracking-[-1px] text-[#e8e4df]">
            MoLuxury
          </span>
          <p className="font-inter-tight text-[11px] tracking-[2px] uppercase text-[#888078] mt-1">
            Admin Dashboard
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/30 flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 10l4.5 4.5L17 5.5" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-inter-tight text-[14px] text-[#e8e4df]">Magic link sent to</p>
            <p className="font-inter-tight text-[14px] text-[#c9a96e]">{email}</p>
            <p className="font-inter-tight text-[12px] text-[#888078] mt-2">
              Check your inbox and click the link to sign in. It expires in 1 hour.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-4 font-inter-tight text-[12px] text-[#888078] hover:text-[#e8e4df] transition-colors cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(authError || error) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-[8px] px-4 py-3">
                <p className="font-inter-tight text-[12px] text-red-400">
                  {authError === "unauthorized"
                    ? "This email is not authorised to access the admin dashboard."
                    : authError === "auth_failed"
                    ? "Authentication failed. Please try again."
                    : error}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="omosope43@gmail.com"
                required
                className="w-full bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-4 py-3 font-inter-tight text-[14px] text-[#e8e4df] placeholder:text-[#888078] outline-none focus:border-[#c9a96e]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#c9a96e] hover:bg-[#d4b87a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0e0f11] font-inter-tight font-medium text-[14px] rounded-[8px] py-3 transition-colors cursor-pointer"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>

            <p className="font-inter-tight text-[11px] text-[#888078] text-center">
              We&apos;ll send a sign-in link to your email. No password needed.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
