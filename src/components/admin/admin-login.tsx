"use client";

import { useState } from "react";
import { Lock, User, Shield, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function AdminLogin({ onSuccess }: { onSuccess: (admin: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("نام کاربری و رمز عبور را وارد کنید.");
      return;
    }
    setLoading(true);
    const r = await api<{ admin: any }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (r.ok && r.data?.admin) {
      toast.success("خوش آمدید به پنل مدیریت صحت محاسب");
      onSuccess(r.data.admin);
    } else {
      setError(r.error || "ورود ناموفق بود.");
    }
  };

  return (
    <div className="min-h-screen relative grid place-items-center p-4 overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-amber-400/5" />
        <div className="absolute top-0 right-0 h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-amber-400/15 blur-[120px] animate-float" />
        <div
          className="absolute inset-0 opacity-[0.03] animate-grid-pan"
          style={{
            backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-4 bg-gradient-brand rounded-3xl blur-2xl opacity-20" />
        <div className="relative glass-strong rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-primary/30 pulse-ring" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary mb-2">
              <Lock className="h-3 w-3" /> منطقه امن
            </div>
            <h1 className="font-display text-2xl font-black text-foreground">پنل مدیریت صحت محاسب</h1>
            <p className="text-sm text-muted-foreground mt-1">برای ورود، اطلاعات مدیر را وارد کنید</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">نام کاربری</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری مدیر"
                  autoComplete="username"
                  className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">رمز عبور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-10 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="نمایش رمز"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-sm font-semibold text-rose-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand text-white px-6 py-3.5 font-bold shadow-glow hover:shadow-glow-gold disabled:opacity-60 transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Lock className="h-4 w-4" /> ورود امن</>)}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              بازگشت به سایت
            </a>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              محافظت شده با JWT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
