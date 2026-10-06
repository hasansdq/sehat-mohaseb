"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { useInViewState } from "@/lib/scroll";

function toPersianDigits(s: string) {
  return s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

function Counter({ value }: { value: string }) {
  const { ref, inView } = useInViewState<HTMLSpanElement>(true, "0px");
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView) return;
    const match = value.match(/(\+?)(\d+(?:\.\d+)?)(.*)/);
    if (!match) { setDisplay(value); return; }
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr);
    const decimals = numStr.includes(".") ? 1 : 0;
    const dur = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = (target * eased).toFixed(decimals);
      setDisplay(toPersianDigits(`${prefix}${cur}${suffix}`));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

export function StatsSection() {
  const [stats, setStats] = useState<Record<string, string>>({});

  useEffect(() => {
    api<{ stats: Record<string, string>; counts: any }>(`/api/public/stats`).then((r) => {
      if (r.ok && r.data) setStats(r.data.stats);
    });
  }, []);

  const items = [
    { value: stats.stat1_value || "+12", label: stats.stat1_label || "سال تجربه" },
    { value: stats.stat2_value || "+850", label: stats.stat2_label || "کسب‌وکار همراه" },
    { value: stats.stat3_value || "%98", label: stats.stat3_label || "رضایت مشتریان" },
    { value: stats.stat4_value || "+30", label: stats.stat4_label || "متخصص مالی" },
  ];

  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden border border-border/60 glass-strong p-8 md:p-10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-amber-400/5" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
              {items.map((it, i) => (
                <Reveal key={it.label} delay={i * 0.08} className="text-center">
                  <div className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-gradient-brand">
                    <Counter value={it.value} />
                  </div>
                  <div className="mt-2 text-sm md:text-base font-semibold text-muted-foreground">
                    {it.label}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
