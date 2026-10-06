"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl font-black text-foreground">{title}</h1>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card/60 p-5", className)}>{children}</div>
  );
}

export function StatCard({ icon: Icon, label, value, color = "primary" }: { icon: any; label: string; value: ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    primary: "bg-gradient-brand shadow-glow text-white",
    amber: "bg-gradient-gold shadow-glow-gold text-amber-950",
    emerald: "bg-emerald-500 shadow-emerald-500/30 text-white",
    blue: "bg-sky-500 shadow-sky-500/30 text-white",
    rose: "bg-rose-500 shadow-rose-500/30 text-white",
  };
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn("grid place-items-center h-12 w-12 rounded-2xl", colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-black text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc?: string }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <div className="font-bold text-foreground">{title}</div>
      {desc && <div className="text-sm text-muted-foreground mt-1">{desc}</div>}
    </div>
  );
}

export function Badge({ children, color = "muted" }: { children: ReactNode; color?: "muted" | "primary" | "amber" | "emerald" | "rose" | "blue" }) {
  const map: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    rose: "bg-rose-500/10 text-rose-500",
    blue: "bg-sky-500/10 text-sky-500",
  };
  return <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold", map[color])}>{children}</span>;
}

export const faDate = (d: string | Date | null) => {
  if (!d) return "—";
  try { return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d)); } catch { return "—"; }
};

export function Input({ label, value, onChange, type, placeholder, ltr, hint }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; ltr?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={ltr ? "ltr" : "rtl"}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
      {hint && <span className="text-xs text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  );
}

export function Textarea({ label, value, onChange, rows = 4, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground mb-1.5 block">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
      />
      {hint && <span className="text-xs text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  );
}
