"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Building2, Users, Receipt, Wallet, Sparkles, Send, Check, ListChecks } from "lucide-react";
import { useUI } from "@/lib/ui-store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BIZ_TYPES = ["خدماتی", "تولیدی", "تجاری", "فروشگاهی", "آنلاین"];
const NEEDS = [
  { k: "needsSoftware", label: "نرم‌افزار حسابداری" },
  { k: "needsTraining", label: "آموزش" },
  { k: "needsTax", label: "خدمات مالیاتی" },
  { k: "needsPayroll", label: "حقوق و دستمزد" },
];

export function CustomPackageModal() {
  const { pkgOpen, pkgHints, closePkg, openAuth, user, openConsult } = useUI();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "", businessType: "", employeeCount: "", monthlyTransactions: "",
    needsSoftware: true, needsTraining: false, needsTax: true, needsPayroll: false,
    budget: "", notes: "",
    contactName: "", contactMobile: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pkgOpen) {
      setStep(0);
      setForm((f) => ({
        ...f,
        businessName: "",
        contactName: user?.fullName || "",
        contactMobile: user?.mobile || "",
      }));
      // prefill from hints (AI)
      if (pkgHints?.businessType) setForm((f) => ({ ...f, businessType: pkgHints.businessType }));
      if (pkgHints?.employeeCount) setForm((f) => ({ ...f, employeeCount: String(pkgHints.employeeCount) }));
      if (pkgHints?.monthlyTransactions) setForm((f) => ({ ...f, monthlyTransactions: String(pkgHints.monthlyTransactions) }));
      if (pkgHints?.needsSoftware != null) setForm((f) => ({ ...f, needsSoftware: !!pkgHints.needsSoftware }));
      if (pkgHints?.needsTax != null) setForm((f) => ({ ...f, needsTax: !!pkgHints.needsTax }));
      if (pkgHints?.needsTraining != null) setForm((f) => ({ ...f, needsTraining: !!pkgHints.needsTraining }));
      if (pkgHints?.needsPayroll != null) setForm((f) => ({ ...f, needsPayroll: !!pkgHints.needsPayroll }));
      if (pkgHints?.budget) setForm((f) => ({ ...f, budget: String(pkgHints.budget) }));
      if (pkgHints?.suggestedPlan) setForm((f) => ({ ...f, notes: String(pkgHints.suggestedPlan) }));
    }
  }, [pkgOpen, pkgHints, user]);

  const steps = ["کسب‌وکار", "نیازها", "تماس"];
  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!form.businessType) { toast.error("نوع کسب‌وکار را انتخاب کنید."); setStep(0); return; }
    if (!form.contactName || !form.contactMobile) { toast.error("نام و موبایل تماس را وارد کنید."); setStep(2); return; }
    if (!user) {
      closePkg();
      openAuth("register");
      toast.info("برای ثبت پک اختصاصی ابتدا وارد شوید یا ثبت‌نام کنید.");
      return;
    }
    setLoading(true);
    const r = await api("/api/custom-package", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        employeeCount: Number(form.employeeCount) || null,
        monthlyTransactions: Number(form.monthlyTransactions) || null,
        aiSummary: pkgHints?.suggestedPlan || "",
      }),
    });
    setLoading(false);
    if (r.ok) {
      toast.success("پک اختصاصی شما ثبت شد! کارشناسان ما بررسی و پاسخ می‌دهند.");
      closePkg();
    } else {
      toast.error(r.error || "خطا در ثبت.");
    }
  };

  return (
    <AnimatePresence>
      {pkgOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] grid place-items-center p-4">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={closePkg} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-xl glass-strong rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* header */}
            <div className="relative p-6 bg-gradient-to-r from-amber-400/10 to-transparent border-b border-border">
              <button onClick={closePkg} className="absolute top-4 left-4 grid place-items-center h-9 w-9 rounded-full bg-background/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="بستن">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-gold grid place-items-center shadow-glow-gold">
                  <Wand2 className="h-6 w-6 text-amber-950" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-extrabold text-foreground">ساخت پک اختصاصی</h2>
                  <p className="text-xs text-muted-foreground">در کمتر از یک دقیقه پک مناسب کسب‌وکارتان</p>
                </div>
              </div>
              {/* steps indicator */}
              <div className="mt-5 flex items-center gap-2">
                {steps.map((s, i) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div className={cn("grid place-items-center h-7 w-7 rounded-full text-xs font-bold transition-all", i <= step ? "bg-gradient-brand text-white" : "bg-background/60 text-muted-foreground border border-border")}>
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn("text-xs font-bold", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                    {i < 2 && <div className={cn("flex-1 h-0.5 rounded-full transition-all", i < step ? "bg-gradient-brand" : "bg-border")} />}
                  </div>
                ))}
              </div>
            </div>

            {/* body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> نوع کسب‌وکار</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {BIZ_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => setForm({ ...form, businessType: t })}
                          className={cn("py-2.5 rounded-xl text-sm font-bold border transition-all", form.businessType === t ? "bg-gradient-brand text-white border-transparent shadow-glow" : "border-border bg-background/60 text-muted-foreground hover:border-primary/40")}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> تعداد کارکنان</label>
                    <input
                      value={form.employeeCount}
                      onChange={(e) => setForm({ ...form, employeeCount: e.target.value.replace(/\D/g, "") })}
                      inputMode="numeric"
                      placeholder="مثلاً 12"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> حجم تراکنش ماهانه (تقریبی)</label>
                    <input
                      value={form.monthlyTransactions}
                      onChange={(e) => setForm({ ...form, monthlyTransactions: e.target.value.replace(/\D/g, "") })}
                      inputMode="numeric"
                      placeholder="مثلاً 500"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> نیازمندی‌های شما</label>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {NEEDS.map((n) => (
                        <button
                          key={n.k}
                          onClick={() => setForm({ ...form, [n.k]: !(form as any)[n.k] })}
                          className={cn("flex items-center gap-3 rounded-xl p-3.5 border transition-all text-right", (form as any)[n.k] ? "bg-primary/5 border-primary/40" : "border-border bg-background/60 hover:border-primary/30")}
                        >
                          <span className={cn("grid place-items-center h-6 w-6 rounded-lg border-2 transition-all", (form as any)[n.k] ? "bg-gradient-brand border-transparent text-white" : "border-border")}>
                            {(form as any)[n.k] && <Check className="h-4 w-4" />}
                          </span>
                          <span className="text-sm font-bold text-foreground">{n.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> بودجه تقریبی (تومان)</label>
                    <input
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      placeholder="مثلاً ۵ تا ۱۰ میلیون"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">توضیحات (اختیاری)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      placeholder="هر توضیحی که می‌تواند کمک کند..."
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground/80">
                      درخواست شما توسط کارشناسان ما بررسی و بهترین پک با قیمت اختصاصی پیشنهاد می‌شود. اطلاعات تماس را وارد کنید تا هماهنگ کنیم.
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">نام</label>
                    <input
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder="نام و نام خانوادگی"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">شماره موبایل</label>
                    <input
                      value={form.contactMobile}
                      onChange={(e) => setForm({ ...form, contactMobile: e.target.value })}
                      placeholder="09xxxxxxxxx"
                      inputMode="tel"
                      dir="ltr"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all tracking-wider"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="p-6 border-t border-border flex items-center gap-3">
              {step > 0 && (
                <button onClick={back} className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold hover:bg-primary/5 transition-colors">
                  قبلی
                </button>
              )}
              {step < 2 ? (
                <button onClick={next} className="mr-auto inline-flex items-center gap-2 rounded-xl bg-gradient-brand text-white px-6 py-2.5 text-sm font-bold shadow-glow">
                  مرحله بعد
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="mr-auto inline-flex items-center gap-2 rounded-xl bg-gradient-brand text-white px-6 py-2.5 text-sm font-bold shadow-glow disabled:opacity-60"
                >
                  {loading ? "در حال ارسال..." : (<><Send className="h-4 w-4" /> ثبت پک اختصاصی</>)}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
