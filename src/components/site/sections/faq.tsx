"use client";

import { useEffect, useState } from "react";
import { Plus, HelpCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

type FAQ = { id: string; question: string; answer: string };

export function FaqSection() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [open, setOpen] = useState<number | null>(0);
  const { openConsult } = useUI();

  useEffect(() => {
    api<{ items: FAQ[] }>("/api/public/faqs").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
    });
  }, []);

  return (
    <section id="faq" className="relative py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
            <HelpCircle className="h-4 w-4" />
            سوالات متداول
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
            هرچی نیاز است <span className="text-gradient-brand">بدانید</span>
          </h2>
        </Reveal>

        <div className="space-y-3">
          {items.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.05}>
              <div className={cn("rounded-2xl border bg-card/60 overflow-hidden transition-all", open === i ? "border-primary/40 shadow-glow" : "border-border/60")}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="font-bold text-foreground">{f.question}</span>
                  <span
                    className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary flex-shrink-0 transition-transform duration-300"
                    style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{f.answer}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 text-center rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-foreground font-bold">سوال دیگری دارید؟</p>
            <p className="text-sm text-muted-foreground mt-1">کارشناسان ما آماده پاسخگویی هستند.</p>
            <button
              onClick={() => openConsult("پاسخ به سوال عمومی")}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-white font-bold shadow-glow hover:-translate-y-0.5 transition-all"
            >
              پرسیدن از کارشناس
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
