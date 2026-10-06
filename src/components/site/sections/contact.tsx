"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, Instagram, Send as Telegram } from "lucide-react";
import { api } from "@/lib/api-client";
import { Reveal } from "@/components/site/reveal";
import { useUI } from "@/lib/ui-store";
import { toast } from "sonner";

export function ContactSection() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", mobile: "", message: "", topic: "" });
  const [loading, setLoading] = useState(false);
  const { consultTopic } = useUI();

  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/public/site").then((r) => {
      if (r.ok && r.data) setSettings(r.data.settings);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.message) {
      toast.error("لطفاً همه فیلدها را پر کنید.");
      return;
    }
    setLoading(true);
    const r = await api("/api/consultation", {
      method: "POST",
      body: JSON.stringify({ ...form, topic: form.topic || consultTopic || "درخواست تماس" }),
    });
    setLoading(false);
    if (r.ok) {
      toast.success("درخواست شما ثبت شد! کارشناسان ما به‌زودی تماس می‌گیرند.");
      setForm({ name: "", mobile: "", message: "", topic: "" });
    } else {
      toast.error(r.error || "خطا در ثبت درخواست.");
    }
  };

  const cards = [
    { icon: Phone, label: "تلفن تماس", value: settings["contact.phone"] || "۰۲۱-۹۱۰۱۰۰۱۰", href: `tel:${settings["contact.phone"] || ""}` },
    { icon: Mail, label: "ایمیل", value: settings["contact.email"] || "info@sehatmohaseb.ir", href: `mailto:${settings["contact.email"] || ""}` },
    { icon: MapPin, label: "آدرس", value: settings["contact.address"] || "تهران، خیابان ولیعصر" },
    { icon: Clock, label: "ساعات کاری", value: settings["contact.workingHours"] || "شنبه تا چهارشنبه ۹ تا ۱۸" },
  ];

  return (
    <section id="contact" className="relative py-20 md:py-28">
      <div className="container mx-auto px-4">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
            تماس با ما
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
            بیایید <span className="text-gradient-brand">همکار</span> شویم
          </h2>
          <p className="mt-4 text-muted-foreground">فرم زیر را پر کنید یا مستقیم تماس بگیرید.</p>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* info cards */}
          <div className="lg:col-span-2 space-y-4">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.06}>
                <a
                  href={c.href || "#"}
                  className={`flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 hover:-translate-y-1 hover:border-primary/40 transition-all ${c.href ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-glow flex-shrink-0">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                    <div className="font-bold text-foreground truncate">{c.value}</div>
                  </div>
                </a>
              </Reveal>
            ))}
            {/* social */}
            <Reveal delay={0.24}>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-muted-foreground">ما را دنبال کنید:</span>
                {settings["social.instagram"] && (
                  <a href={settings["social.instagram"]} target="_blank" rel="noreferrer" className="grid place-items-center h-10 w-10 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary transition-all" aria-label="اینستاگرام">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings["social.telegram"] && (
                  <a href={settings["social.telegram"]} target="_blank" rel="noreferrer" className="grid place-items-center h-10 w-10 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary transition-all" aria-label="تلگرام">
                    <Telegram className="h-5 w-5" />
                  </a>
                )}
                {settings["social.bale"] && (
                  <a href={settings["social.bale"]} target="_blank" rel="noreferrer" className="grid place-items-center h-10 w-10 rounded-xl bg-card border border-border hover:border-primary/40 hover:text-primary transition-all" aria-label="بله">
                    <span className="text-sm font-bold">بله</span>
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {/* form */}
          <div className="lg:col-span-3">
            <Reveal delay={0.1}>
              <form onSubmit={submit} className="rounded-3xl border border-border/60 glass-strong p-6 md:p-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">نام و نام خانوادگی</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="مثلاً علی رضایی"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">شماره موبایل</label>
                    <input
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder="09xxxxxxxxx"
                      inputMode="tel"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">موضوع (اختیاری)</label>
                  <input
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="مثلاً مشاوره مالیاتی"
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="mt-4">
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">پیام شما</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
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
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
