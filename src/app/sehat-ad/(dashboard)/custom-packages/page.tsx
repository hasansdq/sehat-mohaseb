"use client";

import { useEffect, useState } from "react";
import { Wand2, Loader2, Trash2, Sparkles, Check, Building2 } from "lucide-react";
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

type P = { id: string; businessName: string | null; businessType: string | null; employeeCount: number | null; monthlyTransactions: number | null; needsSoftware: boolean; needsTraining: boolean; needsTax: boolean; needsPayroll: boolean; budget: string | null; notes: string | null; suggestedPlan: string | null; aiSummary: string | null; status: string; contactName: string | null; contactMobile: string | null; createdAt: string };

export default function CustomPackagesPage() {
  const [items, setItems] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: P[] }>("/api/admin/custom-packages");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const r = await api(`/api/admin/custom-packages/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    if (r.ok) { toast.success("وضعیت بروزرسانی شد."); load(); } else toast.error(r.error);
  };
  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    const r = await api(`/api/admin/custom-packages/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  return (
    <div>
      <PageHeader title="پک‌های اختصاصی" desc="درخواست‌های ساخت پک اختصاصی" />
      <div className="space-y-3">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <AdminCard><EmptyState icon={Wand2} title="درخواستی نیست" /></AdminCard> :
          items.map((p) => {
            const st = STATUS.find((s) => s.v === p.status) || STATUS[0];
            const needs = [
              p.needsSoftware && "نرم‌افزار", p.needsTax && "مالیات", p.needsTraining && "آموزش", p.needsPayroll && "حقوق و دستمزد",
            ].filter(Boolean);
            return (
              <AdminCard key={p.id}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-gold text-amber-950"><Wand2 className="h-4.5 w-4.5" /></span>
                      <span className="font-bold text-foreground">{p.businessName || "پک اختصاصی"}</span>
                      <Badge color={st.color}>{st.label}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {p.businessType && <div><div className="text-xs text-muted-foreground">نوع کسب‌وکار</div><div className="font-bold text-foreground">{p.businessType}</div></div>}
                      {p.employeeCount != null && <div><div className="text-xs text-muted-foreground">کارکنان</div><div className="font-bold text-foreground">{p.employeeCount}</div></div>}
                      {p.monthlyTransactions != null && <div><div className="text-xs text-muted-foreground">تراکنش/ماه</div><div className="font-bold text-foreground">{p.monthlyTransactions}</div></div>}
                      {p.budget && <div><div className="text-xs text-muted-foreground">بودجه</div><div className="font-bold text-foreground">{p.budget}</div></div>}
                      {p.contactName && <div><div className="text-xs text-muted-foreground">نام تماس</div><div className="font-bold text-foreground">{p.contactName}</div></div>}
                      {p.contactMobile && <div><div className="text-xs text-muted-foreground">موبایل</div><div className="font-bold text-foreground" dir="ltr">{p.contactMobile}</div></div>}
                    </div>
                    {needs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">{needs.map((n, i) => <Badge key={i} color="primary">{n}</Badge>)}</div>
                    )}
                    {p.notes && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.notes}</p>}
                    {p.aiSummary && (
                      <div className="mt-2 rounded-xl bg-amber-400/5 border border-amber-400/20 p-3 flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-foreground/80"><span className="font-bold">خلاصه هوش مصنوعی: </span>{p.aiSummary}</div>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">{faDate(p.createdAt)}</div>
                  </div>
                  <div className="flex flex-col gap-2 lg:w-40">
                    <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      {STATUS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                    </select>
                    <button onClick={() => remove(p.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/10 text-rose-500 px-3 py-2 text-xs font-bold hover:bg-rose-500/20 transition-colors"><Trash2 className="h-3.5 w-3.5" /> حذف</button>
                  </div>
                </div>
              </AdminCard>
            );
          })}
      </div>
    </div>
  );
}
