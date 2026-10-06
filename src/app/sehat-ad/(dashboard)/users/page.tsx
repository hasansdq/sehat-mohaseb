"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserCog, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Badge, EmptyState, faDate, Input } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type U = { id: string; mobile: string; fullName: string | null; email: string | null; role: string; status: string; company: string | null; jobTitle: string | null; createdAt: string; lastLoginAt: string | null };

export default function UsersPage() {
  const [items, setItems] = useState<U[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<U | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: U[] }>(`/api/admin/users?q=${encodeURIComponent(q)}`);
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("کاربر حذف شود؟")) return;
    const r = await api(`/api/admin/users/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  return (
    <div>
      <PageHeader title="کاربران" desc="مدیریت کاربران سایت" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl"><Plus className="h-4 w-4 ml-1" /> کاربر جدید</Button>
      } />
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="جستجوی نام یا موبایل..." className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
        <Button variant="outline" onClick={load}>جستجو</Button>
      </div>
      <AdminCard className="!p-0 overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <EmptyState icon={UserCog} title="کاربری نیست" /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-xs text-muted-foreground">
                <th className="p-3 font-semibold">کاربر</th><th className="p-3 font-semibold">موبایل</th><th className="p-3 font-semibold">نقش</th><th className="p-3 font-semibold">وضعیت</th><th className="p-3 font-semibold">آخرین ورود</th><th className="p-3 font-semibold">عملیات</th>
              </tr></thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold">{(u.fullName || "ک").charAt(0)}</span>
                        <div>
                          <div className="font-bold text-foreground">{u.fullName || "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground" dir="ltr">{u.mobile}</td>
                    <td className="p-3"><Badge color={u.role === "ADMIN" ? "amber" : "primary"}>{u.role === "ADMIN" ? "مدیر" : "کاربر"}</Badge></td>
                    <td className="p-3"><Badge color={u.status === "ACTIVE" ? "emerald" : "rose"}>{u.status === "ACTIVE" ? "فعال" : "مسدود"}</Badge></td>
                    <td className="p-3 text-muted-foreground text-xs">{faDate(u.lastLoginAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(u)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(u.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </AdminCard>
      <UserEditor open={creating || !!editing} item={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
    </div>
  );
}

function UserEditor({ open, item, onClose, onSaved }: { open: boolean; item: U | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(item ? { fullName: item.fullName || "", email: item.email || "", status: item.status, role: item.role, password: "" } : { mobile: "", fullName: "", email: "", password: "", role: "USER", status: "ACTIVE" }); }, [open, item]);
  const save = async () => {
    setSaving(true);
    const body = { ...form };
    if (item && !body.password) delete body.password;
    if (!item && !body.mobile) { setSaving(false); toast.error("موبایل الزامی است."); return; }
    const r = await api(item ? `/api/admin/users/${item.id}` : "/api/admin/users", { method: item ? "PUT" : "POST", body: JSON.stringify(body) });
    setSaving(false);
    if (r.ok) { toast.success("ذخیره شد."); onSaved(); } else toast.error(r.error);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl">{item ? "ویرایش کاربر" : "کاربر جدید"}</DialogTitle></DialogHeader>
        <div className="space-y-3.5">
          {!item && <Input label="شماره موبایل" value={form.mobile || ""} onChange={(v) => setForm({ ...form, mobile: v })} ltr placeholder="09xxxxxxxxx" />}
          <Input label="نام و نام خانوادگی" value={form.fullName || ""} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Input label="ایمیل" value={form.email || ""} onChange={(v) => setForm({ ...form, email: v })} ltr />
          <Input label={item ? "رمز عبور جدید (اختیاری)" : "رمز عبور"} value={form.password || ""} onChange={(v) => setForm({ ...form, password: v })} type="text" ltr hint={item ? "خالی = بدون تغییر" : "حداقل ۶ کاراکتر"} />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-foreground mb-1.5 block">نقش</span>
              <select value={form.role || "USER"} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm">
                <option value="USER">کاربر</option>
                <option value="ADMIN">مدیر</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground mb-1.5 block">وضعیت</span>
              <select value={form.status || "ACTIVE"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm">
                <option value="ACTIVE">فعال</option>
                <option value="SUSPENDED">مسدود</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>انصراف</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-brand text-white shadow-glow">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
