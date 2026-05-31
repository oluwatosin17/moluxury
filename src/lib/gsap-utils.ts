/**
 * Shared GSAP animation presets for MoLuxury.
 * All timings are fast (<400ms), ease-forward for entries, power-in for exits.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Fade + subtle rise entrance for a single element */
export function fadeUp(
  el: Element | null,
  opts: { delay?: number; duration?: number; y?: number } = {}
) {
  if (!el) return;
  const { delay = 0, duration = 0.5, y = 24 } = opts;
  gsap.fromTo(
    el,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, delay, ease: "power2.out", clearProps: "transform" }
  );
}

/** Staggered fade-up for a list of elements */
export function fadeUpStagger(
  els: Element[] | NodeListOf<Element>,
  opts: { delay?: number; stagger?: number; duration?: number; y?: number } = {}
) {
  if (!els || !Array.from(els).length) return;
  const { delay = 0, stagger = 0.06, duration = 0.45, y = 20 } = opts;
  gsap.fromTo(
    Array.from(els),
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, delay, stagger, ease: "power2.out", clearProps: "transform" }
  );
}

/** Scroll-triggered fade-up – attaches once per element */
export function scrollFadeUp(
  el: Element | null,
  opts: { start?: string; y?: number; duration?: number } = {}
) {
  if (!el || typeof window === "undefined") return;
  const { start = "top 88%", y = 32, duration = 0.55 } = opts;
  gsap.fromTo(
    el,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
    }
  );
}

/** Staggered scroll-triggered fade-up for a container's children */
export function scrollFadeUpChildren(
  parent: Element | null,
  childSelector = ":scope > *",
  opts: { start?: string; stagger?: number; y?: number; duration?: number; delay?: number } = {}
) {
  if (!parent || typeof window === "undefined") return;
  const children = Array.from(parent.querySelectorAll(childSelector));
  if (!children.length) return;
  const { start = "top 88%", stagger = 0.08, y = 28, duration = 0.5, delay = 0 } = opts;
  gsap.fromTo(
    children,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: parent,
        start,
        once: true,
      },
    }
  );
}
