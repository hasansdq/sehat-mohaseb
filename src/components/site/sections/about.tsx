"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Target, HeartHandshake, LineChart } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { useScrollProgress, useInViewState } from "@/lib/scroll";

export function AboutSection() {
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const { ref, progress } = useScrollProgress<HTMLDivElement>(["start end", "end start"]);
  const imageY = 60 + progress * -100;
  const textY = 40 + progress * -60;

  useEffect(() => {
    api<{ items: { section: string; key: string; value: string }[] }>("/api/public/landing").then((r) => {
      if (r.ok && r.data) {
        const map: Record<string, string> = {};
        for (const it of r.data.items) map[`${it.section}.${it.key}`] = it.value;
        setBlocks(map);
      }
    });
  }, []);

  const values = [
    { icon: Target, title: "مأموریتی واقعی", desc: "ایجاد مرکز قابل اعتماد مالی برای کسب‌وکارها" },
    { icon: ShieldCheck, title: "امنیت مالی", desc: "شفافیت و نظم واقعی در حساب‌ها" },
    { icon: HeartHandshake, title: "همراهی دائمی", desc: "نقش همراه مالی کسب‌وکار، نه فقط حسابدار" },
    { icon: LineChart, title: "رشد پایدار", desc: "تصمیم‌های مالی دقیق برای توسعه" },
  ];

  return (
    <section id="about" ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        {/* visual */}
        <div style={{ transform: `translateY(${imageY}px)` }} className="order-2 lg:order-1">
          <Reveal>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-brand rounded-3xl rotate-3 blur-2xl opacity-20" />
              <div className="relative rounded-3xl overflow-hidden border border-border/60 glass-strong p-2">
                <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-background to-amber-400/10 p-8 h-80 grid place-items-center">
                  <div className="relative w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 glass-strong rounded-2xl p-4 shadow-glow w-72 animate-float-slow">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-foreground">رضایت مشتری</div>
                        <div className="text-2xl font-black text-gradient-brand">٪۹۸</div>
                      </div>
                      <ProgressLine />
                    </div>
                    <div className="absolute top-28 left-4 glass-strong rounded-2xl p-4 shadow-glow w-56 animate-float">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-emerald-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">جریمه مالیاتی حذف‌شده</div>
                          <div className="text-lg font-black text-foreground">۲.۴B تومان</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-48 right-2 glass-strong rounded-2xl p-4 shadow-glow w-52 animate-float-slow" style={{ animationDelay: "1s" }}>
                      <div className="flex items-center gap-2">
                        <LineChart className="h-8 w-8 text-amber-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">رشد متوسط مشتریان</div>
                          <div className="text-lg font-black text-foreground">+۱۸٪ سالانه</div>
                        </div>
                      </div>
                    </div>
                    <div className="h-64" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* text */}
        <div style={{ transform: `translateY(${textY}px)` }} className="order-1 lg:order-2">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              درباره ما
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
              از یک <span className="text-gradient-brand">نیاز واقعی</span> شروع شد
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              {blocks["about.body"] || "موسسه ما با یک نیاز واقعی شکل گرفت؛ صاحبان کسب‌وکار درگیر پیچیدگی قوانین مالیاتی، دفاتر حسابداری نامنظم و گزارش‌های غیرقابل استناد بودند. ما این کمبود را دیدیم و مأموریتی جدید را آغاز کردیم: ایجاد یک مرکز حرفه‌ای، قابل اعتماد و به‌روز که بتواند امنیت مالی، شفافیت و نظم واقعی را برای کسب‌وکارها فراهم کند."}
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {blocks["about.body2"] || "امروز، موسسه ما به‌عنوان مجموعه‌ای شناخته می‌شود که به مشتریانش کمک می‌کند تصمیم‌های مالی دقیق بگیرند، ریسک‌های مالیاتی را کم کنند و با آرامش روی توسعه کسب‌وکار تمرکز کنند."}
            </p>
          </Reveal>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={0.2 + i * 0.06}>
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 hover:border-primary/30 transition-colors">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-brand text-white shadow-glow flex-shrink-0">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-bold text-foreground">{v.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{v.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressLine() {
  const { ref, inView } = useInViewState<HTMLDivElement>(true, "0px");
  return (
    <div ref={ref} className="mt-3 h-2 rounded-full bg-primary/10 overflow-hidden">
      <div
        className="h-full bg-gradient-brand transition-all duration-1000 ease-out"
        style={{ width: inView ? "98%" : "0%" }}
      />
    </div>
  );
}
