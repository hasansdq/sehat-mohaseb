"use client";

// Global decorative background for the entire site. Renders a fixed,
// multi-layer, subtle backdrop (base gradient + animated grid + dot pattern
// + floating color orbs + slow conic glow + edge fades) that sits BEHIND all
// page content. Semi-transparent section cards (bg-card/60) let this show
// through, giving every page depth and cohesion instead of a flat solid color.

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
      {/* Layer 1: subtle vertical brand tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] via-background to-background" />

      {/* Layer 2: animated grid lines (very subtle) */}
      <div
        className="absolute inset-0 opacity-[0.04] animate-grid-pan"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
        }}
      />

      {/* Layer 3: dot pattern with radial fade for organic feel */}
      <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.45] dark:opacity-[0.55]" />

      {/* Layer 4: slow-rotating conic glow (depth + movement) */}
      <div className="absolute top-1/2 left-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 conic-glow opacity-[0.12] blur-[110px] animate-spin-slow" />

      {/* Layer 5: floating colored orbs (primary / gold / emerald) */}
      <div className="absolute top-[8%] -right-40 h-[34rem] w-[34rem] rounded-full bg-primary/[0.10] blur-[130px] animate-float-slow" />
      <div className="absolute top-[42%] -left-40 h-[30rem] w-[30rem] rounded-full bg-amber-400/[0.08] blur-[130px] animate-float" />
      <div
        className="absolute bottom-[6%] right-[28%] h-[26rem] w-[26rem] rounded-full bg-emerald-500/[0.07] blur-[120px] animate-float-slow"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-[70%] left-[15%] h-[22rem] w-[22rem] rounded-full bg-primary/[0.06] blur-[110px] animate-float"
        style={{ animationDelay: "0.8s" }}
      />

      {/* Layer 6: top + bottom edge fades (anchors content) */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

      {/* Layer 7: subtle vignette for focus */}
      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-[0.5]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, transparent 40%, color-mix(in oklab, var(--background) 40%, transparent) 100%)",
        }}
      />
    </div>
  );
}
