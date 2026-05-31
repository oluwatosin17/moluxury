"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WishlistOverlay from "@/components/wishlist-overlay";
import CartOverlay from "@/components/cart-overlay";
import HeartParticleLayer from "@/components/heart-particle-layer";
import FixedSearch from "@/components/fixed-search";
import { useCart, itemKey, CartItem } from "@/lib/cart-context";
import { playButton, playTab, playSuccess } from "@/lib/sound";

type Step = "details" | "payment" | "confirmed";

const STEPS: Step[] = ["details", "payment", "confirmed"];
const STEP_LABELS = { details: "Details", payment: "Payment", confirmed: "Confirmed" };

function formatPrice(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

type FormData = {
  name: string; email: string; phone: string; address: string;
  country: string; city: string; state: string; zip: string; notes: string;
};

// ── Order Summary sidebar ──────────────────────────────────────────────────
function OrderSummary({ step, formData, snapshot }: { step: Step; formData: FormData; snapshot?: CartItem[] }) {
  const { items, subtotal } = useCart();
  const displayItems = snapshot ?? items;
  const displaySubtotal = snapshot
    ? snapshot.reduce((s, i) => s + i.priceNum * i.quantity, 0)
    : subtotal;
  return (
    <div className="bg-[#f9f8f5] rounded-[12px] p-5 flex flex-col gap-8 w-full lg:w-[500px] lg:shrink-0">
      <span className="font-cormorant italic text-[26px] tracking-[-1px] text-primary">Order Summary</span>

      <div className="flex flex-col gap-6">
        {displayItems.map((item) => (
          <div key={itemKey(item)} className="flex gap-3">
            <div className="relative w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[4px] overflow-hidden shrink-0">
              <Image src={item.src} alt={item.name} fill className="object-cover" unoptimized />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0 py-[2px]">
              <p className="font-inter-tight text-[14px] tracking-[-0.3px] text-primary line-clamp-2 leading-snug">{item.name}</p>
              <span className="font-inter-tight font-medium text-[14px] text-primary tracking-[-0.3px]">
                {formatPrice(item.priceNum * item.quantity)}
              </span>
              <div className="flex gap-4 lg:gap-[30px] flex-wrap">
                {[
                  { label: "LENGTH",   value: item.length },
                  { label: "DENSITY",  value: item.density },
                  { label: "QTY",      value: String(item.quantity).padStart(2, "0") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-[2px]">
                    <span className="font-inter-tight font-bold text-[10px] tracking-[1px] uppercase text-[#afa79c]">{label}</span>
                    <span className="font-inter-tight font-medium text-[12px] text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex flex-col">
        <div className="border-t border-[#f5f7fa]">
          <div className="flex flex-col gap-[14px] py-6">
            <div className="flex justify-between">
              <span className="font-inter-tight font-light text-[14px] text-[#525866] tracking-[-0.3px]">Shipping Costs</span>
              <span className="font-inter-tight text-[14px] text-primary">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="font-inter-tight font-light text-[14px] text-[#525866] tracking-[-0.3px]">Subtotal (tax incl.)</span>
              <span className="font-inter-tight text-[14px] text-primary">{formatPrice(displaySubtotal)}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-dashed border-[#dddad5] pt-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="font-inter-tight font-light text-[14px] text-[#525866] tracking-[-0.3px]">Total</span>
            <span className="font-inter-tight font-semibold text-[16px] text-primary tracking-[-0.3px]">{formatPrice(displaySubtotal)}</span>
          </div>
        </div>

        {/* Ship To / Contact — only on confirmed step */}
        {step === "confirmed" && formData.name && (
          <div className="flex flex-col gap-4 border-t border-[#e1e4ea] pt-4 mt-2">
            <div className="flex flex-col gap-1">
              <span className="font-inter-tight font-bold text-[10px] tracking-[1px] uppercase text-[#afa79c]">SHIP TO</span>
              <p className="font-inter-tight font-medium text-[16px] text-primary leading-[24px]">{formData.name}</p>
              {(formData.address || formData.city) && (
                <p className="font-inter-tight font-light text-[14px] text-[#666052] leading-[24px]">
                  {[formData.address, formData.city, formData.state, formData.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            {(formData.email || formData.phone) && (
              <div className="flex flex-col gap-1">
                <span className="font-inter-tight font-bold text-[10px] tracking-[1px] uppercase text-[#afa79c]">CONTACT</span>
                {formData.email && <p className="font-inter-tight font-medium text-[16px] text-primary leading-[24px]">{formData.email}</p>}
                {formData.phone && <p className="font-inter-tight font-light text-[14px] text-[#666052] leading-[24px]">{formData.phone}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step pills ─────────────────────────────────────────────────────────────
function StepPills({ current, onStep }: { current: Step; onStep: (s: Step) => void }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-4">
      {STEPS.map((s, i) => {
        const isActive = s === current;
        const isPast   = i < currentIdx;
        return (
          <button
            key={s}
            onClick={() => { if (isPast) { playTab(); onStep(s); } }}
            disabled={!isPast && !isActive}
            className={`rounded-full font-inter-tight text-[12px] transition-all cursor-pointer disabled:cursor-default ${
              isActive
                ? "bg-[#181b25] text-white border border-[#181b25] px-[21px] py-[11px]"
                : isPast
                  ? "bg-[#0f973d] text-white border border-[#0f973d] px-[21px] py-[11px] hover:opacity-80"
                  : "text-[#1a1a1a] px-[20.5px] py-[10.5px]"
            }`}
            style={(!isActive && !isPast) ? { border: "0.5px solid #c8c4bb" } : undefined}
          >
            {STEP_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────
function Field({
  label, placeholder, type = "text", value, onChange, children, half = false, error,
}: {
  label: string; placeholder?: string; type?: string;
  value?: string; onChange?: (v: string) => void;
  children?: React.ReactNode; half?: boolean; error?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${half ? "flex-1 min-w-0" : "w-full"}`}>
      <span className="font-inter-tight text-[11px] tracking-[1.1px] text-[#71685b]">{label}</span>
      {children ?? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`border-b pb-[14px] pt-[14px] font-inter-tight text-[14px] text-primary placeholder:text-[#bbb7aa] bg-transparent outline-none w-full transition-colors ${
            error ? "border-red-400" : "border-[#d2cfc6]"
          }`}
        />
      )}
      {error && <span className="font-inter-tight text-[11px] text-red-400 -mt-1">{error}</span>}
    </div>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} title="Copy" className="shrink-0 hover:opacity-60 transition-opacity cursor-pointer">
      {copied ? (
        <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
          <path d="M2 8.5l3.5 3.5 6-7" stroke="#0f973d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
          <rect x="0.5" y="4.5" width="9" height="12" rx="1.5" stroke="#bbb6aa" />
          <path d="M4 4V2.5A1.5 1.5 0 015.5 1h7A1.5 1.5 0 0114 2.5v9A1.5 1.5 0 0112.5 13H11" stroke="#bbb6aa" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

// ── Step 1: Details ────────────────────────────────────────────────────────
function StepDetails({
  formData, onChange, onNext,
}: {
  formData: FormData; onChange: (k: keyof FormData, v: string) => void; onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = () => {
    const required: (keyof FormData)[] = ["name", "email", "phone", "address", "country", "city"];
    const next: Partial<Record<keyof FormData, string>> = {};
    for (const key of required) {
      if (!formData[key].trim()) next[key] = "This field is required";
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Enter a valid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) { playButton(); onNext(); }
  };

  return (
    <div className="flex flex-col gap-[68px]">
      <div className="flex flex-col gap-8">
        <div className="flex gap-5">
          <Field half label="FULL NAME" placeholder="Enter your name" value={formData.name} onChange={(v) => onChange("name", v)} error={errors.name} />
          <Field half label="EMAIL ADDRESS" placeholder="email@example.com" value={formData.email} onChange={(v) => onChange("email", v)} type="email" error={errors.email} />
        </div>
        <Field label="PHONE NUMBER" placeholder="Enter your phone number" value={formData.phone} onChange={(v) => onChange("phone", v)} type="tel" error={errors.phone} />
        <Field label="STREET ADDRESS" placeholder="House number and street name" value={formData.address} onChange={(v) => onChange("address", v)} error={errors.address} />
        <Field label="COUNTRY" error={errors.country}>
          <div className={`flex items-center border-b pb-[12px] pt-[12px] transition-colors ${errors.country ? "border-red-400" : "border-[#d2cfc6]"}`}>
            <select
              value={formData.country}
              onChange={(e) => onChange("country", e.target.value)}
              className="flex-1 font-inter-tight text-[14px] text-primary bg-transparent outline-none appearance-none"
            >
              <option value="" disabled>Select country</option>
              <option>Nigeria</option>
              <option>Ghana</option>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Canada</option>
            </select>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-secondary/40">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Field>
        <div className="flex gap-6">
          <Field half label="CITY" error={errors.city}>
            <div className={`flex items-center border-b pb-[12px] pt-[12px] transition-colors ${errors.city ? "border-red-400" : "border-[#d2cfc6]"}`}>
              <input value={formData.city} onChange={(e) => onChange("city", e.target.value)} placeholder="Select city" className="flex-1 font-inter-tight text-[14px] placeholder:text-[#bbb7aa] text-primary bg-transparent outline-none" />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-secondary/40">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Field>
          <Field half label="STATE">
            <div className="flex items-center border-b border-[#d2cfc6] pb-[12px] pt-[12px]">
              <input value={formData.state} onChange={(e) => onChange("state", e.target.value)} placeholder="Select state" className="flex-1 font-inter-tight text-[14px] placeholder:text-[#bbb7aa] text-primary bg-transparent outline-none" />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-secondary/40">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Field>
          <Field half label="ZIP CODE" placeholder="Enter ZIP code" value={formData.zip} onChange={(v) => onChange("zip", v)} />
        </div>
        <Field label="ADDITIONAL NOTES" placeholder="Enter special instructions" value={formData.notes} onChange={(v) => onChange("notes", v)} />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleNext}
          className="w-full bg-primary text-white font-inter-tight font-medium text-[16px] py-[12px] rounded-[24px] flex items-center justify-center gap-1 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
        >
          Continue to payment
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11h14M11 5l6 6-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-inter-tight text-[10px] text-[#968f7d] text-center leading-[15px]">
          We&apos;ll confirm your booking and share preparation details within a few hours.
        </p>
      </div>
    </div>
  );
}

// ── Step 2: Payment ────────────────────────────────────────────────────────
function StepPayment({ onNext, total, email }: { onNext: () => void; total: number; email: string }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Header text */}
      <div className="flex flex-col gap-3 lg:gap-4">
        <span className="font-inter-tight font-light text-[14px] text-[#666052] tracking-[-0.3px]">Bank Transfer</span>
        <p className="font-inter-tight text-[28px] tracking-[-0.5px] text-primary leading-normal">
          Send {formatPrice(total)} to the account below.
        </p>
        <p className="font-inter-tight font-light text-[13px] text-[#666052] tracking-[-0.3px] leading-[20px]">
          Complete your order by sending the total amount to the account details below. Once your transfer is confirmed, we&apos;ll begin processing and prepare your order. Secure online payment options are on the way, bank transfer is currently the supported payment method.
        </p>
      </div>

      {/* Amount + bank details */}
      <div className="flex flex-col gap-1">
        {/* Prominent total box */}
        <div className="bg-[#f9f8f5] rounded-[4px] p-6 lg:p-[41px] flex flex-col items-center gap-0 border border-white/5">
          <span className="font-inter-tight text-[11px] tracking-[1.1px] text-[#bbb6aa] uppercase">AMOUNT TO PAY</span>
          <span className="font-cormorant text-[48px] text-primary text-center leading-[72px]">
            {formatPrice(total)}
          </span>
          <div className="mt-4 bg-[#f1ede7] rounded-full flex items-center gap-2 px-3 py-1">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="4.75" stroke="#181b25" strokeWidth="1" />
              <path d="M5.5 3.5v1M5.5 6.5v1.5" stroke="#181b25" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="font-inter-tight text-[13px] text-primary">Use your full name as reference</span>
          </div>
        </div>

        {/* Bank detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {[
            { label: "BANK NAME",      value: "Opay" },
            { label: "ACCOUNT NUMBER", value: "8144730948" },
            { label: "ACCOUNT NAME",   value: "MoLuxury" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#f9f8f5] rounded-[4px] p-[25px] flex flex-col gap-1 border border-white/5">
              <span className="font-inter-tight font-bold text-[10px] text-[#bbb6aa] uppercase">{label}</span>
              <div className="flex items-center justify-between">
                <span className="font-inter-tight text-[18px] text-primary leading-[28px]">{value}</span>
                <CopyButton value={value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => { playSuccess(); onNext(); }}
          className="w-full bg-[#0e121b] text-white font-inter-tight font-medium text-[16px] py-[12px] rounded-[24px] flex items-center justify-center gap-1 hover:bg-[#0e121b]/90 active:scale-[0.98] transition-all cursor-pointer"
        >
          I have paid
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11h14M11 5l6 6-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-inter-tight text-[10px] text-[#968f7d] text-center leading-[15px]">
          Your order is reserved as soon as you click I have paid. We&apos;ll email {email || "you"} once we confirm the transfer.
        </p>
      </div>
    </div>
  );
}

// ── Step 3: Confirmed ──────────────────────────────────────────────────────
function StepConfirmed({ formData, orderSnapshot, orderId }: { formData: FormData; orderSnapshot: CartItem[]; orderId: string }) {
  const firstName = formData.name.split(" ")[0] || "there";
  const { clearCart } = useCart();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mailSending, setMailSending] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pre-filled message content
  const total = orderSnapshot.reduce((s, i) => s + i.priceNum * i.quantity, 0);
  const itemLines = orderSnapshot.map(
    (i) => `• ${i.name} | ${i.length} | ${i.density} | Qty: ${i.quantity} | ${formatPrice(i.priceNum * i.quantity)}`
  );
  const waMessage = [
    `Hi MoLuxury! I've just placed an order and made payment.`,
    ``,
    `*Order Details:*`,
    ...itemLines,
    ``,
    `*Total Paid:* ${formatPrice(total)}`,
    ``,
    `*Customer Info:*`,
    `Name: ${formData.name}`,
    `Email: ${formData.email}`,
    `Phone: ${formData.phone}`,
    `Address: ${[formData.address, formData.city, formData.state, formData.country].filter(Boolean).join(", ")}`,
    ``,
    `Please find my proof of payment attached. Thank you!`,
  ].join("\n");
  const waHref = `https://wa.me/2348144730948?text=${encodeURIComponent(waMessage)}`;

  const handleSendMail = async () => {
    setMailSending(true);
    const fd = new FormData();
    fd.append("order", JSON.stringify({
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: [formData.address, formData.city, formData.state, formData.country].filter(Boolean).join(", "),
      items: orderSnapshot,
      total,
      notes: formData.notes || undefined,
    }));
    if (uploadedFile) fd.append("file", uploadedFile);
    await fetch("/api/send-order", { method: "POST", body: fd });
    setMailSending(false);
    setMailSent(true);
  };

  // Clear cart and fire confetti on mount
  useEffect(() => {
    clearCart();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#c9a84c", "#e8ddd0", "#181b25", "#8b7355", "#d4c5a9", "#6b7f6d"];
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 120,
      w: 3 + Math.random() * 4,
      h: 7 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 0.8 + Math.random() * 1.8,
      va: (Math.random() - 0.5) * 0.07,
      opacity: 0.6 + Math.random() * 0.4,
    }));

    let frame: number;
    let elapsed = 0;

    const animate = () => {
      elapsed++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      for (const p of particles) {
        if (p.y < canvas.height + 20) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.va;
          ctx.save();
          ctx.globalAlpha = p.opacity * Math.max(0, 1 - elapsed / 220);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }
      if (active && elapsed < 240) frame = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[200]"
        style={{ width: "100vw", height: "100vh" }}
      />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <span className="font-inter-tight font-light text-[14px] text-[#666052] tracking-[-0.3px]">Awaiting payment confirmation</span>
          <p className="font-inter-tight text-[28px] tracking-[-0.5px] text-primary leading-normal">
            Order received
          </p>
          {orderId && (
            <span className="font-inter-tight text-[12px] tracking-[1px] text-[#afa79c] uppercase">{orderId}</span>
          )}
          <p className="font-inter-tight font-light text-[13px] text-[#666052] tracking-[-0.3px] leading-[20px]">
            Thanks, {firstName}, we&apos;ve received your order and reserved it for you. A confirmation has been sent to {formData.email || "your email"}. We&apos;re currently awaiting confirmation of your payment.
          </p>
        </div>

        {/* Upload proof card */}
        <div className="bg-[#f9f8f5] rounded-[4px] p-6 flex flex-col gap-6 border border-white/5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-inter-tight text-[22px] tracking-[-0.5px] text-primary leading-normal">Upload proof of payment</p>
              <p className="font-inter-tight font-light text-[13px] text-[#666052] tracking-[-0.3px] leading-[20px]">
                Send a screenshot or receipt of your transfer. Once submitted, it will be automatically sent to our team for verification.
              </p>
            </div>
            {/* Drop zone */}
            <label className="border border-dashed border-[#d2cfc6] rounded-[12px] p-6 flex flex-col items-center gap-4 cursor-pointer hover:border-[#a09890] transition-colors">
              {uploadedFile ? (
                <>
                  <div className="size-12 rounded-full bg-[#0f973d]/10 flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M4.5 11.5l4.5 4.5 8-9" stroke="#0f973d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 items-center text-center">
                    <span className="font-inter-tight font-medium text-[14px] text-primary tracking-[-0.2px] max-w-[260px] truncate">{uploadedFile.name}</span>
                    <span className="font-inter-tight text-[12px] text-[#0f973d] tracking-[-0.2px]">Uploaded successfully</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setUploadedFile(null); }}
                    className="font-inter-tight text-[12px] text-[#666052] hover:text-primary transition-colors underline cursor-pointer"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-secondary/50">
                    <path d="M5.333 21.333v2.667A2.667 2.667 0 008 26.667h16a2.667 2.667 0 002.667-2.667v-2.667M16 20V5.333M16 5.333l-5.333 5.334M16 5.333l5.333 5.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex flex-col gap-[6px] items-center text-center">
                    <span className="font-inter-tight font-medium text-[14px] text-primary tracking-[-0.2px]">Choose a file or drag &amp; drop it here.</span>
                    <span className="font-inter-tight text-[12px] text-[#525866] tracking-[-0.2px]">JPEG, PNG, PDF, and MP4 formats, up to 50 MB.</span>
                  </div>
                  <div className="bg-white border border-[#e1e4ea] rounded-[6px] px-2 py-[6px] shadow-[0px_1px_1px_rgba(10,13,20,0.03)]">
                    <span className="font-inter-tight font-medium text-[12px] text-primary tracking-[-0.2px]">Browse file</span>
                  </div>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,video/mp4"
                onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Send actions — email button full width, WhatsApp centered below */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => { playButton(); handleSendMail(); }}
              disabled={mailSending || mailSent}
              className="w-full bg-[#0e121b] text-white font-inter-tight font-medium text-[16px] py-[12px] px-8 rounded-[24px] flex items-center justify-center gap-2 hover:bg-[#0e121b]/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-default"
            >
              {mailSent ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sent
                </>
              ) : mailSending ? "Sending..." : "Send via mail"}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-inter-tight font-light text-[13px] text-[#666052] tracking-[-0.3px]">Prefer Whatsapp?</span>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playButton()}
                className="font-inter-tight font-medium text-[13px] text-primary tracking-[-0.3px] hover:opacity-70 transition-opacity cursor-pointer"
              >
                Send via Whatsapp
              </a>
            </div>
          </div>
        </div>

        {/* Process note */}
        <p className="font-inter-tight font-light text-[13px] text-[#666052] tracking-[-0.3px] leading-[20px]">
          Our system securely logs your payment receipt and queues it for review, while our finance team verifies your transfer; once confirmed, you&apos;ll receive your official invoice and be notified when your piece is ready for dispatch.
        </p>

        {/* Continue shopping */}
        <Link
          href="/shop"
          className="flex items-center gap-2 font-inter-tight font-medium text-[16px] text-primary tracking-[-0.3px] hover:opacity-70 transition-opacity w-fit"
        >
          Continue shopping
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3.5l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </>
  );
}

// ── Main checkout page ─────────────────────────────────────────────────────
export default function CheckoutPage() {
  const [step, setStep] = useState<Step>("details");
  const [fading, setFading] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState("");
  const { subtotal, items } = useCart();

  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", phone: "", address: "",
    country: "", city: "", state: "", zip: "", notes: "",
  });

  const handleFormChange = useCallback((k: keyof FormData, v: string) => {
    setFormData((prev) => ({ ...prev, [k]: v }));
  }, []);

  const goToStep = (next: Step) => {
    setFading(true);
    setTimeout(() => {
      setStep(next);
      setFading(false);
    }, 200);
  };

  const goNext = () => {
    const nextIdx = STEPS.indexOf(step) + 1;
    if (nextIdx < STEPS.length) {
      if (STEPS[nextIdx] === "confirmed") {
        const snapshot = [...items];
        const id = `MO-${Date.now().toString(36).toUpperCase()}`;
        const confirmedAt = new Date().toISOString();
        setOrderSnapshot(snapshot);
        setOrderId(id);
        // Fire customer confirmation email automatically — no manual action required
        fetch("/api/confirm-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: id,
            customerName: formData.name,
            customerEmail: formData.email,
            items: snapshot,
            total: snapshot.reduce((s, i) => s + i.priceNum * i.quantity, 0),
            confirmedAt,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) console.error("[checkout] confirm-order failed:", data.error);
            else console.log("[checkout] confirm-order success:", data);
          })
          .catch((err) => console.error("[checkout] confirm-order fetch error:", err));
      }
      goToStep(STEPS[nextIdx]);
    }
  };

  if (items.length === 0 && step !== "confirmed") {
    return (
      <>
        <Navbar />
        <WishlistOverlay />
        <CartOverlay />
        <HeartParticleLayer />
        <FixedSearch />
        <main className="bg-surface min-h-screen flex flex-col items-center justify-center gap-6 px-4 lg:px-20">
          <p className="font-cormorant italic text-[48px] tracking-[-2px] text-primary">Your bag is empty.</p>
          <Link href="/shop" className="font-inter-tight text-[13px] text-secondary underline hover:text-primary">
            Browse the collection
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <FixedSearch />

      <main className="bg-surface min-h-screen">
        {/* Back link */}
        <div className="px-4 lg:px-20 pt-[72px] lg:pt-[88px] pb-0">
          <Link
            href={step === "details" ? "/shop" : "#"}
            onClick={(e) => {
              if (step !== "details") {
                e.preventDefault();
                goToStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)]);
              }
            }}
            className="flex items-center gap-2 font-inter-tight font-semibold text-[10px] tracking-[1px] uppercase text-primary hover:opacity-60 transition-opacity w-fit"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
        </div>

        {/* Main layout */}
        <div className="px-4 lg:px-20 pt-[24px] lg:pt-[37px] pb-16 lg:pb-20">
          <div className={`flex flex-col-reverse lg:flex-row lg:gap-[120px] lg:items-start gap-8 transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}>
            {/* Left: form area */}
            <div className="flex flex-1 min-w-0 flex-col gap-4">
              <div className="flex flex-col gap-4 mb-[68px]">
                <h1 className="font-cormorant font-semibold italic text-[32px] lg:text-[44px] tracking-[-1.5px] text-primary leading-[1.05]">
                  Just a few details
                </h1>
                <StepPills current={step} onStep={goToStep} />
              </div>

              {step === "details"   && <StepDetails   formData={formData} onChange={handleFormChange} onNext={goNext} />}
              {step === "payment"   && <StepPayment   onNext={goNext} total={subtotal} email={formData.email} />}
              {step === "confirmed" && <StepConfirmed formData={formData} orderSnapshot={orderSnapshot} orderId={orderId} />}
            </div>

            {/* Right: order summary */}
            <OrderSummary step={step} formData={formData} snapshot={step === "confirmed" ? orderSnapshot : undefined} />
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
