"use client";

import { useEffect, useState } from "react";
import { Mail, Loader2, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, EmptyState, faDate } from "@/components/admin/ui";

type N = { id: string; email: string; mobile: string | null; createdAt: string };

export default function NewsletterPage() {
  const [items, setItems] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: N[] }>("/api/admin/newsletter");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const r = await api(`/api/admin/newsletter/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  return (
    <div>
      <PageHeader title="خبرنامه" desc={`مشترکین خبرنامه (${items.length} نفر)`} />
      <AdminCard className="!p-0 overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <EmptyState icon={Mail} title="مشترکی نیست" /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-xs text-muted-foreground">
                <th className="p-3 font-semibold">ایمیل</th><th className="p-3 font-semibold">موبایل</th><th className="p-3 font-semibold">تاریخ</th><th className="p-3 font-semibold">عملیات</th>
              </tr></thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3 font-bold text-foreground" dir="ltr">{n.email}</td>
                    <td className="p-3 text-muted-foreground" dir="ltr">{n.mobile || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{faDate(n.createdAt)}</td>
                    <td className="p-3">
                      <button onClick={() => remove(n.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </AdminCard>
    </div>
  );
}
