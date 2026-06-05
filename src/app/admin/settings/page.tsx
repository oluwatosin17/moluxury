"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminTopbar from "@/components/admin/topbar";

export default function AdminSettings() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const vars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL",   label: "Supabase URL",       secret: false },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key", secret: true },
    { key: "NEXT_PUBLIC_SITE_URL",       label: "Site URL",            secret: false },
    { key: "RESEND_FROM_EMAIL",          label: "From Email (Resend)", secret: false },
    { key: "RESEND_TO_EMAIL",            label: "Admin Email",         secret: false },
  ];

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Settings" />
      <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto max-w-2xl">

        <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-3">
          <h3 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Signed in as</h3>
          <p className="font-inter-tight text-[14px] text-[#c9a96e]">{email || "Loading…"}</p>
        </div>

        <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
          <h3 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Environment Variables</h3>
          <p className="font-inter-tight text-[12px] text-[#888078]">
            Configure these in your Vercel dashboard and local <code className="text-[#c9a96e]">.env.local</code> file.
          </p>
          <div className="space-y-3">
            {vars.map(v => (
              <div key={v.key} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <div>
                  <p className="font-mono text-[12px] text-[#c9a96e]">{v.key}</p>
                  <p className="font-inter-tight text-[11px] text-[#888078] mt-0.5">{v.label}</p>
                </div>
                <span className={`font-inter-tight text-[11px] px-2 py-0.5 rounded-full ${
                  v.secret ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-[rgba(255,255,255,0.05)] text-[#888078]"
                }`}>
                  {v.secret ? "secret" : "public"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-3">
          <h3 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Quick Links</h3>
          <div className="space-y-2">
            {[
              { label: "Supabase Dashboard",  href: "https://supabase.com/dashboard" },
              { label: "Resend Dashboard",    href: "https://resend.com/overview" },
              { label: "Vercel Dashboard",    href: "https://vercel.com/dashboard" },
            ].map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0 font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] transition-colors"
              >
                {label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M8 1h3v3M5 7l6-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
