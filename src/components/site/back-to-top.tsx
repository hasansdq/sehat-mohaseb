"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Floating "back to top" button — appears after scrolling down 600px.
// Smoothly scrolls to top on click. Hidden on very small screens to avoid
// clutter (the chatbot already occupies the bottom-right corner).
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-40 grid place-items-center h-11 w-11 rounded-full bg-gradient-brand text-white shadow-glow hover:scale-110 active:scale-95 transition-transform animate-in fade-in slide-in-from-bottom-2 duration-300"
      aria-label="بازگشت به بالا"
      title="بازگشت به بالا"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
