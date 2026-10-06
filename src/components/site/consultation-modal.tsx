"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, User, MessageSquare, Send, CalendarClock, Briefcase } from "lucide-react";
import { useUI } from "@/lib/ui-store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function ConsultationModal() {
  const { consultOpen, consultTopic, closeConsult, openAuth, user } = useUI();
  const [form, setForm] = useState({ name: "", mobile: "", message: "", preferredTime: "", businessType: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (consultOpen) {
      setForm({ name: user?.fullName || "", mobile: user?.mobile || "", message: "", preferredTime: "", businessType: "" });
    }
  }, [consultOpen, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.message) {
      toast.error("لطفاً فیلدها را کامل کنید.");
      return;
    }
    if (!user) {
      closeConsult();
      openAuth("register");
      toast.info("برای ثبت درخواست ابتدا وارد شوید یا ثبت‌نام کنید.");
      return;
    }
    setLoading(true);
    const r = await api("/api/consultation", {
      method: "POST",
      body: JSON.stringify({ ...form, topic: consultTopic || "مشاوره عمومی", source: "form" }),
    });
    setLoading(false);
    if (r.ok) {
      toast.success("درخواست مشاوره ثبت شد! کارشناسان ما تماس می‌گیرند.");
      closeConsult();
    } else {
      toast.error(r.error || "خطا در ثبت.");
    }
  };

  return (
    <AnimatePresence>
      {consultOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center p-4">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={closeConsult} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-lg glass-strong rounded-3xl p-7 shadow-2xl border border-white/10"
          >
            <button onClick={closeConsult} className="absolute top-4 left-4 grid place-items-center h-9 w-9 rounded-full bg-background/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="بستن">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-extrabold text-foreground">درخواست مشاوره</h2>
                {consultTopic && <p className="text-xs text-muted-foreground">موضوع: {consultTopic}</p>}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <Cmp icon={User} label="نام" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Cmp icon={Phone} label="موبایل" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} ltr />
                <Cmp icon={Briefcase} label="نوع کسب‌وکار (اختیاری)" value={form.businessType} onChange={(v) => setForm({ ...form, businessType: v })} />
                <Cmp icon={CalendarClock} label="زمان تماس ترجیحی" value={form.preferredTime} onChange={(v) => setForm({ ...form, preferredTime: v })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">شرح درخواست</label>
                <div className="relative">
                  <MessageSquare className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    placeholder="کسب‌وکارتان و نیازتان را شرح دهید..."
                    className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand text-white px-6 py-3.5 font-bold shadow-glow disabled:opacity-60 transition-all"
              >
                {loading ? "در حال ارسال..." : (<><Send className="h-4 w-4" /> ثبت درخواست</>)}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Cmp({ icon: Icon, label, value, onChange, ltr }: { icon: any; label: string; value: string; onChange: (v: string) => void; ltr?: boolean }) {
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
