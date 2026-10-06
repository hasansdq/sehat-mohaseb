"use client";

import { useEffect, useState } from "react";
import { PhoneCall, Loader2, Trash2, CheckCircle2, Phone } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Badge, EmptyState, faDate } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const STATUS = [
  { v: "NEW", label: "جدید", color: "blue" },
  { v: "CONTACTED", label: "در پیگیری", color: "amber" },
  { v: "DONE", label: "تکمیل شد", color: "emerald" },
  { v: "CANCELLED", label: "لغو", color: "rose" },
] as const;

type C = { id: string; name: string; mobile: string; topic: string | null; businessType: string | null; message: string; preferredTime: string | null; status: string; source: string | null; createdAt: string };

export default function ConsultationsPage() {
  const [items, setItems] = useState<C[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: C[] }>(`/api/admin/consultations${filter ? `?status=${filter}` : ""}`);
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: string) => {
    const r = await api(`/api/admin/consultations/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    if (r.ok) { toast.success("وضعیت بروزرسانی شد."); load(); } else toast.error(r.error);
  };
  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    const r = await api(`/api/admin/consultations/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  return (
    <div>
      <PageHeader title="مشاوره‌ها" desc="درخواست‌های مشاوره دریافت‌شده" />
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter("")} className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-colors", filter === "" ? "bg-gradient-brand text-white" : "bg-muted text-muted-foreground hover:bg-primary/10")}>همه</button>
        {STATUS.map((s) => (
          <button key={s.v} onClick={() => setFilter(s.v)} className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-colors", filter === s.v ? "bg-gradient-brand text-white" : "bg-muted text-muted-foreground hover:bg-primary/10")}>{s.label}</button>
        ))}
      </div>
      <div className="space-y-3">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <AdminCard><EmptyState icon={PhoneCall} title="مشاوره‌ای نیست" /></AdminCard> :
          items.map((c) => {
            const st = STATUS.find((s) => s.v === c.status) || STATUS[0];
            return (
              <AdminCard key={c.id}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">{c.name}</span>
                      <a href={`tel:${c.mobile}`} className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline" dir="ltr"><Phone className="h-3.5 w-3.5" /> {c.mobile}</a>
                      <Badge color={st.color}>{st.label}</Badge>
                      {c.source === "chatbot" && <Badge color="primary">از چت‌بات</Badge>}
                    </div>
                    {c.topic && <div className="mt-1 text-sm font-semibold text-foreground">موضوع: {c.topic}</div>}
                    {c.businessType && <div className="text-xs text-muted-foreground">نوع کسب‌وکار: {c.businessType}</div>}
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.message}</p>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span>{faDate(c.createdAt)}</span>
                      {c.preferredTime && <span>• زمان ترجیحی: {c.preferredTime}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-40">
                    <select value={c.status} onChange={(e) => setStatus(c.id, e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      {STATUS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                    </select>
                    <button onClick={() => setStatus(c.id, "DONE")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 px-3 py-2 text-xs font-bold hover:bg-emerald-500/20 transition-colors"><CheckCircle2 className="h-3.5 w-3.5" /> تکمیل</button>
                    <button onClick={() => remove(c.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/10 text-rose-500 px-3 py-2 text-xs font-bold hover:bg-rose-500/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /> حذف</button>
                  </div>
                </div>
              </AdminCard>
            );
          })}
      </div>
    </div>
  );
}
