"use client";

import { PhoneCall, ClipboardList, Settings2, Rocket, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { useScrollProgress } from "@/lib/scroll";

const STEPS = [
  { icon: PhoneCall, title: "مشاوره اولیه", desc: "تماس رایگان و شناخت وضعیت مالی کسب‌وکار شما" },
  { icon: ClipboardList, title: "ارزیابی و برنامه‌ریزی", desc: "تحلیل دقیق نیازها و تدوین راهکار مالی و مالیاتی" },
  { icon: Settings2, title: "پیاده‌سازی", desc: "راه‌اندازی نرم‌افزار، دفاتر و فرآیندهای حسابداری" },
  { icon: Rocket, title: "رشد و پشتیبانی", desc: "گزارش‌دهی منظم، پشتیبانی دائمی و همراهی در رشد" },
];

export function ProcessSection() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>(["start center", "end center"]);
  const lineScale = progress;

  return (
    <section className="relative py-20 md:py-28">
      <div className="container mx-auto px-4">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
            مسیر همکاری
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
            در <span className="text-gradient-brand">۴ گام</span> به آرامش مالی می‌رسید
          </h2>
        </Reveal>

        <div ref={ref} className="relative max-w-4xl mx-auto">
          {/* center line */}
          <div className="absolute top-0 bottom-0 right-5 md:right-1/2 md:translate-x-1/2 w-0.5 bg-border">
            <div
              className="origin-top h-full w-full bg-gradient-brand transition-transform"
              style={{ transform: `scaleY(${lineScale})`, transformOrigin: "top" }}
            />
          </div>

          <div className="space-y-10 md:space-y-2">
            {STEPS.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className={`relative flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-6`}>
                    {/* dot */}
                    <div className="absolute right-5 md:right-1/2 md:translate-x-1/2 -mr-2.5 md:-mr-3 z-10">
                      <span className="block h-6 w-6 rounded-full bg-gradient-brand shadow-glow grid place-items-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      </span>
                    </div>
                    {/* content */}
                    <div className={`pr-14 md:pr-0 md:w-1/2 ${isLeft ? "md:pl-12 md:text-left" : "md:pr-12 md:text-right"}`}>
                      <div className="inline-block rounded-2xl border border-border/60 bg-card/60 p-5 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow transition-all max-w-sm">
                        <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow mb-3">
                          <s.icon className="h-6 w-6" />
                        </div>
                        <div className="text-xs font-bold text-primary mb-1">گام {i + 1}</div>
                        <h3 className="font-display text-lg font-extrabold text-foreground">{s.title}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
