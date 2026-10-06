"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Lock, User, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useUI } from "@/lib/ui-store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function AuthModal() {
  const { authOpen, authMode, closeAuth, openAuth, setUser } = useUI();
  const [form, setForm] = useState({ mobile: "", password: "", fullName: "" });
  const [loading, setLoading] = useState(false);
  const isLogin = authMode === "login";

  useEffect(() => {
    if (authOpen) setForm({ mobile: "", password: "", fullName: "" });
  }, [authOpen, authMode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mobile = form.mobile.trim();
    if (!/^09\d{9}$/.test(mobile.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()))) {
      toast.error("شماره موبایل معتبر وارد کنید (09xxxxxxxxx).");
      return;
    }
    if (form.password.length < 6) {
      toast.error("رمز عبور حداقل ۶ کاراکتر.");
      return;
    }
    setLoading(true);
    const path = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body: any = { mobile, password: form.password };
    if (!isLogin) body.fullName = form.fullName;
    const r = await api<{ user: any }>(path, { method: "POST", body: JSON.stringify(body) });
    setLoading(false);
    if (r.ok && r.data) {
      setUser(r.data.user);
      toast.success(isLogin ? "خوش آمدید!" : "ثبت‌نام موفق بود! خوش آمدید.");
      closeAuth();
    } else {
      toast.error(r.error || "خطا در عملیات.");
    }
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center p-4"
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={closeAuth} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-md [perspective:1200px]"
          >
            {/* glow */}
            <div className="absolute -inset-4 bg-gradient-brand rounded-3xl blur-2xl opacity-20" />
            <div className="relative glass-strong rounded-3xl p-7 shadow-2xl border border-white/10 overflow-hidden">
              {/* decorative grid */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <button onClick={closeAuth} className="absolute top-4 left-4 grid place-items-center h-9 w-9 rounded-full bg-background/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="بستن">
                <X className="h-5 w-5" />
              </button>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-foreground">
                      {isLogin ? "ورود به حساب" : "ساخت حساب کاربری"}
                    </h2>
                    <p className="text-xs text-muted-foreground">به همراه مالی کسب‌وکارتان خوش آمدید</p>
                  </div>
                </div>

                {/* tabs */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-background/60 border border-border mb-6">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => openAuth(m)}
                      className={`py-2.5 text-sm font-bold rounded-lg transition-all ${authMode === m ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {m === "login" ? "ورود" : "ثبت‌نام"}
                    </button>
                  ))}
                </div>

                <form onSubmit={submit} className="space-y-3.5">
                  {!isLogin && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">نام و نام خانوادگی</label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          placeholder="مثلاً علی رضایی"
                          className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">شماره موبایل</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="09xxxxxxxxx"
                        inputMode="tel"
                        dir="ltr"
                        className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all tracking-wider"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">رمز عبور</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="حداقل ۶ کاراکتر"
                        className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand text-white px-6 py-3.5 font-bold shadow-glow hover:shadow-glow-gold disabled:opacity-60 transition-all"
                  >
                    {loading ? "در حال پردازش..." : (<>
                      <Sparkles className="h-4 w-4" />
                      {isLogin ? "ورود به حساب" : "ثبت‌نام و ورود"}
                    </>)}
                  </button>
                </form>

                <div className="mt-5 text-center text-xs text-muted-foreground">
                  با ورود، شرایط و قوانین موسسه صحت محاسب را می‌پذیرید.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
