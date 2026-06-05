"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function OrderLookupPage() {
  const [ref, setRef] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (ref.trim()) router.push(`/orders/${ref.trim().toUpperCase()}`);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface pt-[88px] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="space-y-3">
            <h1 className="font-cormorant italic text-[42px] md:text-[56px] tracking-[-3px] text-primary leading-none">
              Track your piece.
            </h1>
            <p className="font-inter-tight text-[14px] text-secondary leading-relaxed">
              Enter your order reference to see where it is.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={ref}
              onChange={e => setRef(e.target.value)}
              placeholder="e.g. MO-ABC123"
              className="w-full bg-white border border-black/10 rounded-full px-5 py-3.5 font-inter-tight text-[14px] text-primary placeholder:text-muted outline-none focus:border-primary/40 transition-colors text-center tracking-[1px] uppercase"
            />
            <button
              type="submit"
              disabled={!ref.trim()}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 text-white font-inter-tight font-medium text-[14px] rounded-full py-3.5 transition-colors cursor-pointer"
            >
              Track Order
            </button>
          </form>

          <p className="font-inter-tight text-[12px] text-muted">
            Your order reference was sent in your confirmation email.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
