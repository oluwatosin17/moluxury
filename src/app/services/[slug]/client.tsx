"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WishlistOverlay from "@/components/wishlist-overlay";
import CartOverlay from "@/components/cart-overlay";
import HeartParticleLayer from "@/components/heart-particle-layer";
import FixedSearch from "@/components/fixed-search";
import { playButton } from "@/lib/sound";

const services: Record<string, {
  name: string;
  description: string;
  price: string;
  timeframe: string;
  checklist: string[];
  image: string;
  subtext: string;
}> = {
  "wig-styling": {
    name: "Wig Styling",
    description:
      "A precision styling service tailored to your event, mood, and aesthetic. From sleek and straight to full curls and vintage waves, every look is set, finished, and perfected by hand.",
    price: "From ₦25,000",
    timeframe: "1–2 Hours",
    checklist: [
      "Custom set to your preferred style",
      "Heat styling with professional tools",
      "Finish spray for all-day hold",
      "Complimentary silk press finish",
    ],
    subtext: "Styled to perfection. Finished by hand. Designed to last.",
    image: "https://www.figma.com/api/mcp/asset/84b5c32e-f907-44a5-a859-454fba77c57e",
  },
  "wig-revamping": {
    name: "Wig Revamping",
    description:
      "A restoration service that revives worn, dry, or lifeless wigs into a soft, healthy, and wearable finish. Through deep cleansing, conditioning, and precision restyling, we restore texture, movement, and overall beauty, so your unit feels renewed, not replaced.",
    price: "From ₦25,000",
    timeframe: "2–3 Hours",
    checklist: [
      "Deep detox and conditioning treatment",
      "Lace cleaning and professional tinting",
      "Standard precision styling (Straight or Waves)",
      "Minor lace repair and tightening",
    ],
    subtext: "Carefully handled. Professionally restored. Built to last longer.",
    image: "https://www.figma.com/api/mcp/asset/b8de375b-0c26-463a-9812-0636fc98a1af",
  },
  "wig-installation": {
    name: "Wig Installation",
    description:
      "A professional installation that looks and feels completely natural. We prep, blend, and secure your wig for a seamless finish that lasts, whether lace front, full lace, or closure.",
    price: "From ₦20,000",
    timeframe: "1–2 Hours",
    checklist: [
      "Natural hairline prep and mapping",
      "Lace tinting and customisation",
      "Secure adhesive application",
      "Blending and final styling",
    ],
    subtext: "Seamless. Undetectable. Styled to stay.",
    image: "https://www.figma.com/api/mcp/asset/376ca829-21bd-4b0e-8b2d-0e4637cb77c5",
  },
  "wig-coloring": {
    name: "Wig Coloring",
    description:
      "Custom colour work tailored to your vision. From subtle tones to bold transformations, our colorists use techniques that protect the integrity of every strand while delivering results that turn heads.",
    price: "From ₦35,000",
    timeframe: "2–4 Hours",
    checklist: [
      "Strand test before full application",
      "Custom colour mixing to your reference",
      "Balayage, highlights, or full colour",
      "Deep conditioning treatment after colour",
    ],
    subtext: "Colour crafted for you. Results that speak for themselves.",
    image: "https://www.figma.com/api/mcp/asset/dc2930a2-4063-457c-a47f-095b8fbc3bc7",
  },
  "wig-maintenance": {
    name: "Wig Maintenance",
    description:
      "Regular maintenance is the secret to a long-lasting wig. We deep condition, detangle, and restore moisture to keep your wig looking fresh, soft, and full for longer.",
    price: "From ₦15,000",
    timeframe: "1–2 Hours",
    checklist: [
      "Gentle shampoo and deep condition",
      "Detangle and moisture restoration",
      "Cap and lace cleaning",
      "Light restyling and finishing",
    ],
    subtext: "Preserved. Refreshed. Ready to wear again.",
    image: "https://www.figma.com/api/mcp/asset/592215e5-24e7-4f32-8afa-eda1592e7c5b",
  },
  "custom-consultation": {
    name: "Custom Consultation",
    description:
      "Not sure where to start? Our one-on-one consultation helps you find your perfect wig: texture, length, lace type, density, everything tailored to your face shape, lifestyle, and aesthetic.",
    price: "From ₦10,000",
    timeframe: "45–60 Min",
    checklist: [
      "Face shape and lifestyle assessment",
      "Wig type and texture recommendation",
      "Density and length guidance",
      "Personalised care routine plan",
    ],
    subtext: "Clarity before commitment. Guidance you can trust.",
    image: "https://www.figma.com/api/mcp/asset/55b5f586-a577-4811-9779-75abf6a3e0eb",
  },
};

// "Also like" thumbnails use portrait-style images from Figma detail page design
const allServices = [
  { slug: "wig-styling",         name: "Wig Styling",         image: "https://www.figma.com/api/mcp/asset/fb6cc908-8ca4-4899-acac-70c47f48af86" },
  { slug: "wig-revamping",       name: "Wig Revamping",       image: "https://www.figma.com/api/mcp/asset/f7efbb20-dd90-45fd-a846-fb9437fae921" },
  { slug: "wig-installation",    name: "Wig Installation",    image: "https://www.figma.com/api/mcp/asset/3c0783cd-5449-44fd-8ea6-ab050b43d1ab" },
  { slug: "wig-coloring",        name: "Wig Coloring",        image: "https://www.figma.com/api/mcp/asset/3f9fa5ac-8616-471e-b820-c211d9f2eb9c" },
  { slug: "wig-maintenance",     name: "Wig Maintenance",     image: "https://www.figma.com/api/mcp/asset/592215e5-24e7-4f32-8afa-eda1592e7c5b" },
  { slug: "custom-consultation", name: "Custom Consultation", image: "https://www.figma.com/api/mcp/asset/55b5f586-a577-4811-9779-75abf6a3e0eb" },
];

function BookingPanel({
  isOpen,
  onClose,
  service,
}: {
  isOpen: boolean;
  onClose: () => void;
  service: { name: string; description: string };
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [contact, setContact] = useState<"whatsapp" | "email">("whatsapp");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Set initial off-screen position before first paint (no flash)
  useLayoutEffect(() => {
    gsap.set(panelRef.current, { x: "100%" });
    gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
  }, []);

  // Animate open/close whenever isOpen changes
  useEffect(() => {
    if (isOpen) {
      gsap.set(backdropRef.current, { pointerEvents: "auto" });
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.to(panelRef.current, { x: "0%", duration: 0.38, ease: "power3.out" });
    } else {
      gsap.to(panelRef.current, { x: "100%", duration: 0.32, ease: "power3.in" });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => gsap.set(backdropRef.current, { pointerEvents: "none" }),
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    if (!name.trim() || !date) return;
    const contactValue = contact === "whatsapp" ? whatsapp : email;
    if (!contactValue.trim()) return;

    if (contact === "whatsapp") {
      const msgLines = [
        `Hi MoLuxury! I'd like to book a *${service.name}* appointment.`,
        ``,
        `*Name:* ${name}`,
        `*Preferred Date:* ${date}`,
        `*WhatsApp:* ${whatsapp}`,
        ``,
        `Please confirm my booking. Thank you!`,
      ];
      const msg = encodeURIComponent(msgLines.join("\n"));
      window.open(`https://wa.me/2348144730948?text=${msg}`, "_blank", "noopener,noreferrer");
      setSubmitted(true);
    } else {
      await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: service.name,
          customerName: name,
          preferredDate: date,
          contactMethod: "email",
          contactValue: email,
        }),
      });
      setSubmitted(true);
    }
  };

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[69] bg-black/60 backdrop-blur-[8px]"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-[70] w-full lg:top-4 lg:right-4 lg:bottom-4 lg:w-[480px] bg-white lg:rounded-[16px] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0 shrink-0">
          <span className="font-cormorant italic text-[20px] tracking-[-1px] text-primary">
            Your selection
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="size-7 flex items-center justify-center hover:opacity-50 transition-opacity cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="#181b25" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-10 pb-[96px]">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
              <div className="size-14 rounded-full bg-[#0f973d]/10 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M5 13l5.5 5.5L21 8" stroke="#0f973d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-cormorant italic text-[28px] tracking-[-1.5px] text-primary leading-[1.15] max-w-[260px]">
                Request sent
              </p>
              <p className="font-inter-tight font-light text-[13px] text-[#666052] leading-[20px] max-w-[280px]">
                We&apos;ll confirm your booking and share preparation details within a few hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); onClose(); }}
                className="mt-2 font-inter-tight text-[13px] text-primary underline hover:opacity-60 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-[56px]">
              {/* Service info */}
              <div className="flex flex-col gap-3">
                <h2 className="font-cormorant italic font-semibold text-[44px] tracking-[-1.5px] text-primary leading-[1.05]">
                  {service.name}
                </h2>
                <p className="font-inter-tight font-light text-[13px] text-[#666052] leading-[20px]">
                  {service.description}
                </p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-[40px]">
                {/* Full Name */}
                <div className="flex flex-col gap-[14px]">
                  <span className="font-inter-tight text-[11px] tracking-[1.1px] text-[#afa79c] uppercase">Full Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="border-b border-[#dfddd7] pt-[14px] pb-[14.5px] font-inter-tight text-[14px] text-primary placeholder:text-[#bbb7aa] bg-transparent outline-none w-full"
                  />
                </div>

                {/* Preferred Date */}
                <div className="flex flex-col gap-[14px]">
                  <span className="font-inter-tight text-[11px] tracking-[1.1px] text-[#afa79c] uppercase">Preferred Date</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="border-b border-[#dfddd7] pt-[14px] pb-[14.5px] font-inter-tight text-[14px] text-primary bg-transparent outline-none cursor-pointer w-full"
                  />
                </div>

                {/* Contact Preference — sliding pill toggle */}
                <div className="flex flex-col gap-[14px]">
                  <span className="font-inter-tight text-[11px] tracking-[1.1px] text-[#afa79c] uppercase">Contact Preference</span>
                  <div className="relative flex bg-[rgba(57,52,48,0.5)] rounded-full p-[5px] w-[320px]">
                    <div
                      className={`absolute top-[5px] bottom-[5px] w-[calc(50%-5px)] bg-white rounded-full transition-all duration-200 ${
                        contact === "whatsapp" ? "left-[5px]" : "left-[calc(50%)]"
                      }`}
                    />
                    {(["whatsapp", "email"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setContact(opt)}
                        className={`relative z-10 flex-1 py-[10px] font-inter-tight text-[12px] tracking-[1px] uppercase transition-colors duration-200 cursor-pointer ${
                          contact === opt ? "text-[#0e121b]" : "text-white"
                        }`}
                      >
                        {opt === "whatsapp" ? "Whatsapp" : "Email"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic contact field */}
                {contact === "whatsapp" ? (
                  <div className="flex flex-col gap-[14px]">
                    <span className="font-inter-tight text-[11px] tracking-[1.1px] text-[#afa79c] uppercase">Whatsapp Number</span>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Enter whatsapp number"
                      className="border-b border-[#dfddd7] pt-[14px] pb-[14.5px] font-inter-tight text-[14px] text-primary placeholder:text-[#bbb7aa] bg-transparent outline-none w-full"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-[14px]">
                    <span className="font-inter-tight text-[11px] tracking-[1.1px] text-[#afa79c] uppercase">Email Address</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="border-b border-[#dfddd7] pt-[14px] pb-[14.5px] font-inter-tight text-[14px] text-primary placeholder:text-[#bbb7aa] bg-transparent outline-none w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar — fixed to panel bottom */}
        {!submitted && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-[#f5f7fa] p-6 bg-white">
            <button
              onClick={() => { playButton(); handleSend(); }}
              className="w-full bg-[#0e121b] text-white font-inter-tight font-medium text-[16px] py-3 rounded-[24px] flex items-center justify-center gap-2 hover:bg-[#0e121b]/90 active:scale-[0.98] transition-all cursor-pointer"
            >
              Send a Request
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M9 4l6 5-6 5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function ServiceDetailClient({ params: serverParams }: { params?: { slug: string } }) {
  const clientParams = useParams();
  const slug = serverParams?.slug ?? (typeof clientParams.slug === "string" ? clientParams.slug : "");
  const service = services[slug];
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!service) return notFound();

  const related = allServices.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <FixedSearch />

      <BookingPanel
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        service={{ name: service.name, description: service.description }}
      />

      <main className="bg-surface min-h-screen">
        {/* Breadcrumb */}
        <div className="px-4 lg:px-[80px] pt-[72px] lg:pt-[88px] pb-0 flex items-center gap-3">
          <Link href="/services" className="font-inter-tight font-semibold text-[10px] tracking-[1px] text-[#afa79c] hover:text-primary transition-colors uppercase">
            Services
          </Link>
          <span className="font-inter-tight font-semibold text-[10px] text-[#9ca3af]">/</span>
          <span className="font-inter-tight font-semibold text-[10px] tracking-[1px] text-primary uppercase">
            {service.name}
          </span>
        </div>

        {/* Main content — stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start lg:justify-center pt-6 lg:pt-[40px] pb-12 lg:pb-[80px] px-4 lg:px-[80px] gap-6">
          {/* Left: hero image */}
          <div className="relative rounded-[2px] overflow-hidden w-full h-[320px] sm:h-[440px] lg:w-[576px] lg:h-[634px] lg:shrink-0">
            <Image
              src={service.image}
              alt={service.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Right: info */}
          <div className="flex flex-col gap-4 w-full lg:w-[478px] lg:shrink-0">
            <div className="flex flex-col gap-4">
              <h1 className="font-cormorant italic font-semibold text-[32px] lg:text-[44px] tracking-[-1.5px] text-primary leading-normal">
                {service.name}
              </h1>
              <p className="font-inter-tight font-light text-[14px] text-[#666052] tracking-[-0.3px] leading-[20px]">
                {service.description}
              </p>
            </div>

            {/* Price + Timeframe */}
            <div className="flex gap-[30px]">
              <div className="flex flex-col gap-1">
                <span className="font-inter-tight font-bold text-[10px] tracking-[1px] text-[#afa79c] uppercase">Price</span>
                <span className="font-inter-tight font-medium text-[16px] text-[#1a1a1a]">{service.price}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-inter-tight font-bold text-[10px] tracking-[1px] text-[#afa79c] uppercase">Timeframe</span>
                <span className="font-inter-tight font-medium text-[16px] text-[#1a1a1a]">{service.timeframe}</span>
              </div>
            </div>

            {/* Checklist — green filled circles with top border */}
            <div className="border-t border-[#dfddd7] py-6 flex flex-col gap-3">
              {service.checklist.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="size-[20px] rounded-full bg-[#0f973d] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-inter-tight font-light text-[14px] text-[#666052] tracking-[-0.3px] leading-[20px]">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { playButton(); setBookingOpen(true); }}
                className="w-full bg-black text-white font-inter-tight font-bold text-[12px] tracking-[1.2px] py-[16px] rounded-full flex items-center justify-center gap-2 hover:bg-black/90 active:scale-[0.99] transition-all cursor-pointer uppercase"
              >
                Send a Request
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M8 4l5 4-5 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="font-inter-tight text-[10px] text-[#968f7d] text-center leading-[15px]">
                {service.subtext}
              </p>
            </div>
          </div>
        </div>

        {/* You might also like */}
        <div className="pb-12 lg:pb-[80px]">
          <div className="flex items-center justify-between px-4 lg:px-[80px] mb-5 lg:mb-6">
            <span className="font-cormorant italic text-[24px] lg:text-[32px] tracking-[-3px] text-primary">
              You might also like
            </span>
            <Link href="/services" className="flex items-center gap-2 lg:gap-4 font-inter-tight text-[12px] lg:text-[16px] tracking-[2px] text-secondary hover:text-primary transition-colors uppercase">
              View All
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Related service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="bg-surface group flex flex-col"
              >
                <div className="relative w-full overflow-hidden rounded-[2px] h-[280px] sm:h-[380px] lg:h-[530px]">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between px-[16px] py-[8px] bg-surface">
                  <span className="font-cormorant italic text-[24px] tracking-[-2px] text-primary">{s.name}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary/60 group-hover:text-primary group-hover:translate-x-[2px] transition-all duration-200">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
