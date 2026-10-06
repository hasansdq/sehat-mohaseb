"use client";

import { useEffect, useState } from "react";
import {
  Phone, Mail, MapPin, Clock, Send, Instagram, Send as Telegram, MapPinned,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { PageHeader } from "@/components/site/page-header";
import { SiteLayout } from "@/components/site/site-layout";
import { toast } from "sonner";

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", mobile: "", topic: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/public/site").then((r) => {
      if (r.ok && r.data) setSettings(r.data.settings);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.message) {
      toast.error("لطفاً نام، شماره موبایل و پیام را پر کنید.");
      return;
    }
    setLoading(true);
    const r = await api("/api/consultation", {
      method: "POST",
      body: JSON.stringify({ ...form, source: "contact-page" }),
    });
    setLoading(false);
    if (r.ok) {
      toast.success("درخواست شما ثبت شد! کارشناسان ما به‌زودی تماس می‌گیرند.");
      setForm({ name: "", mobile: "", topic: "", message: "" });
    } else {
      toast.error(r.error || "خطا در ثبت درخواست.");
    }
  };

  const infoCards = [
    { icon: Phone, label: "تلفن تماس", value: settings["contact.phone"] || "۰۲۱-۹۱۰۱۰۰۱۰", href: settings["contact.phone"] ? `tel:${settings["contact.phone"]}` : null },
    { icon: Phone, label: "تلفن دوم", value: settings["contact.phone2"] || "۰۹۱۲-۱۱۱-۱۱۱۱", href: settings["contact.phone2"] ? `tel:${settings["contact.phone2"]}` : null },
    { icon: Mail, label: "ایمیل", value: settings["contact.email"] || "info@sehatmohaseb.ir", href: settings["contact.email"] ? `mailto:${settings["contact.email"]}` : null },
    { icon: MapPin, label: "آدرس", value: settings["contact.address"] || "تهران، خیابان ولیعصر، بالاتر از پارک‌وی" },
  ];

  const workingHours = settings["contact.workingHours"] || "شنبه تا چهارشنبه ۹ تا ۱۸ — پنجشنبه ۹ تا ۱۳";

  return (
    <SiteLayout>
      <PageHeader
        crumbs={[{ label: "تماس" }]}
        eyebrow="با ما در ارتباط باشید"
        title={<>بیایید <span className="text-gradient-brand">همکار</span> شویم</>}
        subtitle="فرم زیر را پر کنید یا مستقیم تماس بگیرید. کارشناسان ما آماده پاسخگویی هستند."
      />

      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* LEFT: info cards */}
            <div className="lg:col-span-2 space-y-4">
              {infoCards.map((c, i) => (
                <Reveal key={c.label} delay={i * 0.06}>
                  <a
                    href={c.href || "#"}
                    className={`flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow transition-all ${c.href ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow flex-shrink-0">
                      <c.icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{c.label}</div>
                      <div className="font-bold text-foreground truncate" dir="ltr" style={{ textAlign: "right" }}>{c.value}</div>
                    </div>
                  </a>
                </Reveal>
              ))}

              {/* Working hours highlighted card */}
              <Reveal delay={0.24}>
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-amber-400/10 p-5">
                  <div className="absolute -top-8 right-1/4 h-32 w-32 rounded-full bg-primary/20 blur-[80px]" />
                  <div className="relative flex items-start gap-4">
                    <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow flex-shrink-0">
                      <Clock className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="text-xs text-muted-foreground">ساعات کاری</div>
                      <div className="font-bold text-foreground mt-0.5 leading-relaxed">{workingHours}</div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Social */}
              <Reveal delay={0.3}>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-muted-foreground">ما را دنبال کنید:</span>
                  {settings["social.instagram"] && (
                    <a href={settings["social.instagram"]} target="_blank" rel="noreferrer" className="grid place-items-center h-10 w-10 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all" aria-label="اینستاگرام">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {settings["social.telegram"] && (
                    <a href={settings["social.telegram"]} target="_blank" rel="noreferrer" className="grid place-items-center h-10 w-10 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all" aria-label="تلگرام">
                      <Telegram className="h-5 w-5" />
                    </a>
                  )}
                  {settings["social.bale"] && (
                    <a href={settings["social.bale"]} target="_blank" rel="noreferrer" className="grid place-items-center h-10 w-10 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary hover:-translate-y-0.5 transition-all text-xs font-bold" aria-label="بله">
                      بله
                    </a>
                  )}
                </div>
              </Reveal>

              {/* Map placeholder */}
              <Reveal delay={0.36}>
                <div className="relative h-44 rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-br from-primary/15 via-background to-amber-400/10 grid place-items-center mt-2">
                  <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.4]" />
                  <div className="relative text-center">
                    <div className="grid place-items-center h-14 w-14 rounded-2xl bg-gradient-brand text-white shadow-glow mx-auto mb-3 animate-float-slow">
                      <MapPinned className="h-7 w-7" />
                    </div>
                    <div className="text-sm font-bold text-foreground">موقعیت ما روی نقشه</div>
                    <div className="text-xs text-muted-foreground mt-1">{settings["contact.address"] || "تهران، خیابان ولیعصر"}</div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* RIGHT: form */}
            <div className="lg:col-span-3">
              <Reveal delay={0.1}>
                <form onSubmit={submit} className="rounded-3xl border border-border/60 glass-strong p-6 md:p-8">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-semibold text-foreground mb-1.5 block">نام و نام خانوادگی</label>
                      <input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="مثلاً علی رضایی"
                        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="mobile" className="text-sm font-semibold text-foreground mb-1.5 block">شماره موبایل</label>
                      <input
                        id="mobile"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="09xxxxxxxxx"
                        inputMode="tel"
                        dir="ltr"
                        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-right"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="topic" className="text-sm font-semibold text-foreground mb-1.5 block">موضوع (اختیاری)</label>
                    <input
                      id="topic"
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      placeholder="مثلاً مشاوره مالیاتی"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="mt-4">
                    <label htmlFor="message" className="text-sm font-semibold text-foreground mb-1.5 block">پیام شما</label>
                    <textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      placeholder="درخواست یا سوال خود را بنویسید..."
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand text-white px-6 py-3.5 font-bold shadow-glow hover:shadow-glow-gold disabled:opacity-60 transition-all"
                  >
                    {loading ? "در حال ارسال..." : (<><Send className="h-4 w-4" /> ارسال درخواست</>)}
                  </button>
                  <p className="mt-3 text-xs text-muted-foreground text-center">
                    با ارسال این فرم، کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.
                  </p>
                </form>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
