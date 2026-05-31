"use client";
import { useEffect, useState, useRef } from "react";
import { HeartFill } from "@mingcute/react";

interface Particle {
  id: number;
  x: number;
  y: number;
}

function AnimatedHeart({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const navHeart = document.querySelector('button[aria-label="Wishlist"]');
    const navRect = navHeart?.getBoundingClientRect();
    if (!navRect) { onDone(); return; }

    // Displacement from particle start → navbar heart center
    const endX = navRect.left + navRect.width / 2 - x;
    const endY = navRect.top + navRect.height / 2 - y;

    // Arc control point: peak upward, leaning toward destination
    const midX = endX * 0.28 - 30;
    const midY = endY * 0.42 - 90;

    const anim = el.animate(
      [
        { transform: "translate(0px, 0px) scale(1)",                               opacity: 1 },
        { transform: `translate(${midX}px, ${midY}px) scale(0.72)`, opacity: 0.75, offset: 0.45 },
        { transform: `translate(${endX}px, ${endY}px) scale(0.15)`,               opacity: 0 },
      ],
      { duration: 700, easing: "ease-in-out", fill: "forwards" }
    );

    anim.onfinish = () => {
      // Pulse the navbar heart icon on landing
      if (navHeart) {
        navHeart.classList.add("animate-heart-nav-pulse");
        setTimeout(() => navHeart.classList.remove("animate-heart-nav-pulse"), 350);
      }
      onDone();
    };

    return () => anim.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className="fixed pointer-events-none"
      style={{ left: x - 10, top: y - 10, willChange: "transform, opacity" }}
    >
      <HeartFill size={20} color="white" />
    </div>
  );
}

export default function HeartParticleLayer() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ x: number; y: number }>) => {
      setParticles((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), x: e.detail.x, y: e.detail.y },
      ]);
    };
    window.addEventListener("wishlist:heart-spawn", handler as EventListener);
    return () => window.removeEventListener("wishlist:heart-spawn", handler as EventListener);
  }, []);

  const remove = (id: number) =>
    setParticles((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      {particles.map((p) => (
        <AnimatedHeart key={p.id} x={p.x} y={p.y} onDone={() => remove(p.id)} />
      ))}
    </div>
  );
}
