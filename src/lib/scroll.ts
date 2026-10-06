"use client";

import { useEffect, useRef, useState } from "react";

// Returns scroll progress (0..1) of an element through the viewport.
// Replaces framer-motion's useScroll for 3D scroll effects — much lighter.
export function useScrollProgress<T extends HTMLElement>(offset: ["start start" | "start end" | "start center", "end start" | "end end" | "end center"] = ["start start", "end start"]) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // start: when element top reaches the "start" anchor; end: when bottom passes "end" anchor
      // We compute a 0..1 progress where 0 = element just entered, 1 = element fully left.
      const startAnchor = offset[0] === "start start" ? 0 : offset[0] === "start center" ? vh / 2 : vh;
      const endAnchor = offset[1] === "end start" ? 0 : offset[1] === "end center" ? vh / 2 : vh;
      const total = (rect.height + vh - endAnchor + startAnchor) || 1;
      const traveled = startAnchor - rect.top;
      const p = Math.max(0, Math.min(1, traveled / total));
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}

// Maps a 0..1 progress to a value via linear interpolation between stops.
export function interpolate(progress: number, stops: [number, number][], out: [number, number]): number {
  // simple linear ramp from out[0] at progress=stops[0][0] to out[1] at progress=stops[0][1]
  const [from, to] = stops[0];
  if (progress <= from) return out[0];
  if (progress >= to) return out[1];
  const t = (progress - from) / (to - from);
  return out[0] + (out[1] - out[0]) * t;
}

// In-view hook via IntersectionObserver — replaces framer-motion useInView.
export function useInViewState<T extends HTMLElement>(once = true, margin = "-80px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) ob.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin: margin }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [once, margin]);
  return { ref, inView };
}
