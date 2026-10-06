"use client";

import { useEffect, useState } from "react";
import { ScrollText, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { PageHeader, AdminCard, EmptyState, faDate, Badge } from "@/components/admin/ui";

type Log = { id: string; actor: string | null; action: string; target: string | null; ip: string | null; userAgent: string | null; meta: string | null; createdAt: string };

const actionColor = (a: string): any => {
  if (a.includes("login_success")) return "emerald";
  if (a.includes("login_failed") || a.includes("delete") || a.includes("locked")) return "rose";
  if (a.includes("create")) return "emerald";
  if (a.includes("update")) return "amber";
  return "muted";
};

export default function LogsPage() {
  const [items, setItems] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: Log[] }>("/api/admin/logs?limit=200").then((r) => {
      if (r.ok && r.data) setItems(r.data.items);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader title="گزارش‌ها" desc="گزارش فعالیت‌های سیستم" />
      <AdminCard className="!p-0 overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <EmptyState icon={ScrollText} title="گزارشی نیست" /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-xs text-muted-foreground">
                <th className="p-3 font-semibold">عملیات</th><th className="p-3 font-semibold">کاربر</th><th className="p-3 font-semibold">IP</th><th className="p-3 font-semibold">زمان</th>
              </tr></thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3"><Badge color={actionColor(l.action)}>{l.action}</Badge></td>
                    <td className="p-3 text-foreground font-semibold">{l.actor || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs" dir="ltr">{l.ip || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{faDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </AdminCard>
    </div>
  );
}
