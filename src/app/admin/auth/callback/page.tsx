"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
      // Exchange the PKCE code for a session — the browser client has
      // access to the code_verifier cookie that Safari strips on
      // cross-site server-side requests.
      supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
        if (!err) {
          window.location.href = "/admin/dashboard";
        } else {
          console.error("Code exchange failed:", err.message);
          setError(err.message);
          setTimeout(() => {
            window.location.href = "/admin/login?error=auth_failed";
          }, 2000);
        }
      });
    } else {
      // No code — check if tokens came via hash fragment (implicit flow)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/admin/login?error=auth_failed";
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center">
      <div className="text-center space-y-3">
        <span className="font-cormorant italic text-[28px] tracking-[-1px] text-[#e8e4df] animate-pulse">
          MoLuxury
        </span>
        {error ? (
          <p className="font-inter-tight text-[12px] text-red-400 mt-4">{error}</p>
        ) : (
          <p className="font-inter-tight text-[12px] text-[#888078] mt-4">
            Signing you in…
          </p>
        )}
      </div>
    </div>
  );
}
