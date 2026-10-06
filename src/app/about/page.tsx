"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target, ShieldCheck, HeartHandshake, LineChart,
  Star, Quote, Mail, Linkedin, ArrowLeft, Sparkles, Users, Award,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { PageHeader } from "@/components/site/page-header";
import { SiteLayout } from "@/components/site/site-layout";
import { useUI } from "@/lib/ui-store";
import { useInViewState } from "@/lib/scroll";

type TeamMember = {
  id: string; name: string; role: string | null; bio: string | null;
  photoUrl: string | null; linkedin: string | null; email: string | null;
};
type Testimonial = {
  id: string; name: string; company: string | null; role: string | null;
  message: string; rating: number; avatarUrl: string | null;
};

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

export default function AboutPage() {
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { openConsult } = useUI();

  useEffect(() => {
    api<{ items: { section: string; key: string; value: string }[] }>("/api/public/landing").then((r) => {
      if (r.ok && r.data) {
        const map: Record<string, string> = {};
        for (const it of r.data.items) map[`${it.section}.${it.key}`] = it.value;
        setBlocks(map);
      }
    });
    api<{ items: TeamMember[] }>("/api/public/team").then((r) => {
      if (r.ok && r.data) setTeam(r.data.items);
    });
    api<{ items: Testimonial[] }>("/api/public/testimonials").then((r) => {
      if (r.ok && r.data) setTestimonials(r.data.items);
    });
  }, []);

  const values = [
    { icon: Target, title: "مأموریتی واقعی", desc: "ایجاد مرکز قابل اعتماد مالی برای کسب‌وکارها" },
    { icon: ShieldCheck, title: "امنیت مالی", desc: "شفافیت و نظم واقعی در حساب‌ها" },
    { icon: HeartHandshake, title: "همراهی دائمی", desc: "نقش همراه مالی کسب‌وکار، نه فقط حسابدار" },
    { icon: LineChart, title: "رشد پایدار", desc: "تصمیم‌های مالی دقیق برای توسعه" },
  ];

  const stats = [
    { value: blocks["stats.stat1_value"] || "+12", label: blocks["stats.stat1_label"] || "سال تجربه" },
    { value: blocks["stats.stat2_value"] || "+850", label: blocks["stats.stat2_label"] || "کسب‌وکار همراه" },
    { value: blocks["stats.stat3_value"] || "%98", label: blocks["stats.stat3_label"] || "رضایت مشتریان" },
    { value: blocks["stats.stat4_value"] || "+30", label: blocks["stats.stat4_label"] || "متخصص مالی" },
  ];

  return (
    <SiteLayout>
      <PageHeader
        crumbs={[{ label: "درباره ما" }]}
        eyebrow="داستان ما"
        title={<>با <span className="text-gradient-brand">صحت محاسب</span>، حساب‌ها سالم و کسب‌وکار رشد می‌کند</>}
        subtitle="از یک نیاز واقعی شروع شد: کمک به صاحبان کسب‌وکار برای عبور از پیچیدگی مالیات و رسیدن به شفافیت واقعی."
      />

      {/* Story section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          {/* visual */}
          <div className="order-2 lg:order-1">
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
          <div className="order-1 lg:order-2">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                چرا ما را انتخاب می‌کنند
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
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
          </div>
        </div>
      </section>

      {/* Values grid */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              <Award className="h-4 w-4" />
              ارزش‌های ما
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              چهار <span className="text-gradient-brand">اصول</span> که به آن پایبندیم
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all">
                  <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow mb-4 group-hover:scale-110 transition-transform">
                    <v.icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden border border-border/60 glass-strong p-8 md:p-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-amber-400/5" />
              <div className="absolute -top-10 right-1/4 h-60 w-60 rounded-full bg-primary/15 blur-[100px] animate-float-slow" />
              <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
                {stats.map((it, i) => (
                  <Reveal key={it.label} delay={i * 0.08} className="text-center">
                    <div className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-gradient-brand">
                      {it.value}
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

      {/* Team */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              <Users className="h-4 w-4" />
              تیم متخصص
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
              با <span className="text-gradient-brand">متخصصان</span> ما آشنا شوید
            </h2>
          </Reveal>
          {team.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">در حال بارگذاری اعضای تیم...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {team.map((m, i) => (
                <Reveal key={m.id} delay={i * 0.06}>
                  <div className="group h-full rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all">
                    <div className="flex items-center gap-4">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className="h-16 w-16 rounded-2xl object-cover" />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-gradient-brand grid place-items-center text-white font-display text-2xl font-black shadow-glow">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-extrabold text-foreground truncate">{m.name}</h3>
                        {m.role && <div className="text-sm text-primary font-bold mt-0.5">{m.role}</div>}
                      </div>
                    </div>
                    {m.bio && <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">{m.bio}</p>}
                    <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
                      {m.linkedin && (
                        <a href={m.linkedin} target="_blank" rel="noreferrer" className="grid place-items-center h-9 w-9 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary transition-all" aria-label="لینکدین">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="grid place-items-center h-9 w-9 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary transition-all" aria-label="ایمیل">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[90%] bg-amber-400/5 blur-[120px] rounded-full" />
          </div>
          <div className="container mx-auto px-4">
            <Reveal className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 mb-4">
                <Star className="h-4 w-4" />
                نظر مشتریان
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
                کسب‌وکارهایی که به ما <span className="text-gradient-brand">اعتماد</span> کردند
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5 md:gap-6">
              {testimonials.slice(0, 3).map((t, i) => (
                <Reveal key={t.id} delay={i * 0.08} className="h-full">
                  <div className="relative h-full rounded-2xl border border-border/60 bg-card/60 p-6 hover:-translate-y-1.5 hover:border-amber-400/40 transition-all">
                    <Quote className="absolute top-4 left-4 h-10 w-10 text-primary/15" />
                    <div className="flex items-center gap-1 mb-4 relative">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-4 w-4 ${idx < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="relative text-foreground/85 leading-relaxed mb-6">«{t.message}»</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-gradient-brand grid place-items-center text-white font-bold">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{[t.role, t.company].filter(Boolean).join(" • ")}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA band */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-amber-400/10 p-8 md:p-14 text-center">
              <div className="absolute -top-10 right-1/3 h-60 w-60 rounded-full bg-primary/20 blur-[100px] animate-float-slow" />
              <div className="absolute -bottom-10 left-1/3 h-60 w-60 rounded-full bg-amber-400/15 blur-[100px] animate-float" />
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground">
                  آماده <span className="text-gradient-brand">همکاری</span> هستید؟
                </h2>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                  همین حالا درخواست مشاوره بدهید تا کارشناسان ما با شما تماس بگیرند و بهترین مسیر را برای کسب‌وکار شما پیدا کنند.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => openConsult("درخواست مشاوره از صفحه درباره ما")}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white px-7 py-3.5 font-bold shadow-glow hover:-translate-y-0.5 transition-all"
                  >
                    درخواست مشاوره رایگان
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 font-bold text-foreground hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                  >
                    صفحه تماس
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
