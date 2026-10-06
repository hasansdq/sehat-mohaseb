"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, Briefcase, Building2, MessageSquare, Package, Clock, CheckCircle2, AlertCircle, LogOut, RefreshCw } from "lucide-react";
import { useUI } from "@/lib/ui-store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  NEW: { label: "جدید", cls: "bg-blue-500/10 text-blue-500" },
  CONTACTED: { label: "در حال پیگیری", cls: "bg-amber-500/10 text-amber-600" },
  DONE: { label: "تکمیل شد", cls: "bg-emerald-500/10 text-emerald-600" },
  CANCELLED: { label: "لغو شد", cls: "bg-rose-500/10 text-rose-500" },
};

const faDate = (d: string | null) => d ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d)) : "";

export function UserPanel() {
  const { panelOpen, closePanel, panelTab, setPanelTab, user, setUser, openAuth } = useUI();
  const [profile, setProfile] = useState<any>(null);
  const [consults, setConsults] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [form, setForm] = useState({ fullName: "", email: "", jobTitle: "", company: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [me, c, p] = await Promise.all([
      api<{ user: any }>("/api/auth/me"),
      api<{ items: any[] }>("/api/my/consultations"),
      api<{ items: any[] }>("/api/my/custom-packages"),
    ]);
    if (me.ok && me.data?.user) {
      setProfile(me.data.user);
      setForm({
        fullName: me.data.user.fullName || "",
        email: me.data.user.email || "",
        jobTitle: me.data.user.jobTitle || "",
        company: me.data.user.company || "",
      });
    }
    if (c.ok && c.data) setConsults(c.data.items);
    if (p.ok && p.data) setPackages(p.data.items);
    setLoading(false);
  };

  useEffect(() => {
    if (!panelOpen || !user) return;
    refresh();
  }, [panelOpen, user]);

  const saveProfile = async () => {
    setSaving(true);
    const r = await api("/api/auth/me", { method: "PUT", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) toast.success("پروفایل بروزرسانی شد.");
    else toast.error(r.error || "خطا در بروزرسانی.");
  };

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    closePanel();
  };

  const tabs = [
    { id: "profile", label: "پروفایل", icon: User },
    { id: "consultations", label: "مشاوره‌ها", icon: MessageSquare },
    { id: "packages", label: "پک‌های اختصاصی", icon: Package },
  ];

  if (!user) return null;

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={closePanel} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-y-0 left-0 w-full max-w-2xl bg-background shadow-2xl flex flex-col"
          >
            {/* header */}
            <div className="relative p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <button onClick={closePanel} className="absolute top-4 right-4 grid place-items-center h-9 w-9 rounded-full bg-background/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="بستن">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center text-white font-black text-xl shadow-glow">
                  {(profile?.fullName || user.fullName || "ک").charAt(0)}
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold text-foreground">{profile?.fullName || user.fullName || "کاربر"}</div>
                  <div className="text-sm text-muted-foreground" dir="ltr">{user.mobile}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={refresh} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  بروزرسانی
                </button>
                <button onClick={logout} className="mr-auto inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">
                  <LogOut className="h-3.5 w-3.5" />
                  خروج
                </button>
              </div>
            </div>

            {/* tabs */}
            <div className="flex border-b border-border bg-card/40 overflow-x-auto scrollbar-thin">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPanelTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors",
                    panelTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              {panelTab === "profile" && (
                <div className="space-y-4 max-w-lg">
                  <div className="rounded-2xl border border-border bg-card/40 p-5">
                    <h3 className="font-bold text-foreground mb-4">اطلاعات شخصی</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field icon={User} label="نام و نام خانوادگی" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
                      <Field icon={Mail} label="ایمیل" value={form.email} onChange={(v) => setForm({ ...form, email: v })} ltr />
                      <Field icon={Briefcase} label="عنوان شغلی" value={form.jobTitle} onChange={(v) => setForm({ ...form, jobTitle: v })} />
                      <Field icon={Building2} label="نام شرکت" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                    </div>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-brand text-white px-5 py-2.5 text-sm font-bold shadow-glow disabled:opacity-60 transition-all"
                    >
                      {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>
                  </div>
                  <div className="rounded-2xl border border-border bg-card/40 p-5">
                    <h3 className="font-bold text-foreground mb-4">اطلاعات حساب</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> شماره موبایل</span>
                        <span className="font-bold text-foreground" dir="ltr">{user.mobile}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> عضویت از</span>
                        <span className="font-bold text-foreground">{faDate(profile?.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> وضعیت</span>
                        <span className="font-bold text-emerald-600">فعال</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {panelTab === "consultations" && (
                <div className="space-y-3">
                  {consults.length === 0 ? (
                    <Empty icon={MessageSquare} title="هنوز درخواست مشاوره‌ای ندارید" desc="از بخش خدمات یا بسته‌ها درخواست کنید." />
                  ) : consults.map((c) => {
                    const s = STATUS_MAP[c.status] || STATUS_MAP.NEW;
                    return (
                      <div key={c.id} className="rounded-2xl border border-border bg-card/40 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-foreground">{c.topic || "مشاوره عمومی"}</div>
                          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", s.cls)}>{s.label}</span>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{c.message}</div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {faDate(c.createdAt)}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {panelTab === "packages" && (
                <div className="space-y-3">
                  {packages.length === 0 ? (
                    <Empty icon={Package} title="پک اختصاصی نساخته‌اید" desc="از دستیار هوش مصنوعی پک اختصاصی بسازید." />
                  ) : packages.map((p) => {
                    const s = STATUS_MAP[p.status] || STATUS_MAP.NEW;
                    return (
                      <div key={p.id} className="rounded-2xl border border-border bg-card/40 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-foreground">{p.businessName || "پک اختصاصی"}</div>
                          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", s.cls)}>{s.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                          {p.businessType && <Info k="نوع کسب‌وکار" v={p.businessType} />}
                          {p.employeeCount != null && <Info k="کارکنان" v={String(p.employeeCount)} />}
                          {p.budget && <Info k="بودجه" v={p.budget} />}
                          {p.suggestedPlan && <Info k="پیشنهاد" v={p.suggestedPlan} />}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {faDate(p.createdAt)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ icon: Icon, label, value, onChange, ltr }: { icon: any; label: string; value: string; onChange: (v: string) => void; ltr?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={ltr ? "ltr" : "rtl"}
          className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-bold text-foreground">{v}</div>
    </div>
  );
}

function Empty({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <div className="font-bold text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}
