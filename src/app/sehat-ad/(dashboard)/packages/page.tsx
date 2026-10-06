"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package, Loader2, Crown } from "lucide-react";
import { api, toman } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Badge, EmptyState, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Pkg = { id: string; slug: string; name: string; software: string | null; category: string | null; shortDesc: string | null; description: string | null; features: string | null; price: number | null; oldPrice: number | null; badge: string | null; popular: boolean; order: number; icon: string | null };

export default function PackagesPage() {
  const [items, setItems] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: Pkg[] }>("/api/admin/packages");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    const r = await api(`/api/admin/packages/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error || "خطا.");
  };

  return (
    <div>
      <PageHeader title="مدیریت بسته‌ها" desc="بسته‌های کسب‌وکار" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl"><Plus className="h-4 w-4 ml-1" /> بسته جدید</Button>
      } />
      <AdminCard className="!p-0 overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <EmptyState icon={Package} title="بسته‌ای نیست" /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-xs text-muted-foreground">
                <th className="p-3 font-semibold">نام</th><th className="p-3 font-semibold">نرم‌افزار</th><th className="p-3 font-semibold">دسته</th><th className="p-3 font-semibold">قیمت</th><th className="p-3 font-semibold">محبوب</th><th className="p-3 font-semibold">عملیات</th>
              </tr></thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3 font-bold text-foreground">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.software || "—"}</td>
                    <td className="p-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="p-3 text-muted-foreground">{p.price != null ? `${toman(p.price)} ت` : "—"}</td>
                    <td className="p-3">{p.popular ? <Badge color="amber"><Crown className="h-3 w-3 ml-1" /> محبوب</Badge> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(p)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(p.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </AdminCard>
      <PackageEditor open={creating || !!editing} item={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
    </div>
  );
}

function PackageEditor({ open, item, onClose, onSaved }: { open: boolean; item: Pkg | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(item ? { ...item } : { name: "", software: "", category: "", shortDesc: "", description: "", features: "", price: "", oldPrice: "", badge: "", popular: false, order: 0, icon: "" });
  }, [open, item]);
  const save = async () => {
    if (!form.name?.trim()) { toast.error("نام الزامی است."); return; }
    setSaving(true);
    const r = await api(item ? `/api/admin/packages/${item.id}` : "/api/admin/packages", { method: item ? "PUT" : "POST", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { toast.success("ذخیره شد."); onSaved(); } else toast.error(r.error || "خطا.");
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle className="font-display text-xl">{item ? "ویرایش بسته" : "بسته جدید"}</DialogTitle></DialogHeader>
        <div className="space-y-3.5">
          <Input label="نام" value={form.name || ""} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="نرم‌افزار" value={form.software || ""} onChange={(v) => setForm({ ...form, software: v })} hint="سپیدار / دشت / آموزشی" />
            <Input label="دسته" value={form.category || ""} onChange={(v) => setForm({ ...form, category: v })} />
          </div>
          <Textarea label="توضیح کوتاه" value={form.shortDesc || ""} onChange={(v) => setForm({ ...form, shortDesc: v })} rows={2} />
          <Textarea label="توضیح کامل" value={form.description || ""} onChange={(v) => setForm({ ...form, description: v })} rows={4} />
          <Textarea label="امکانات (هر خط یک مورد)" value={form.features || ""} onChange={(v) => setForm({ ...form, features: v })} rows={5} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="قیمت (تومان)" value={String(form.price ?? "")} onChange={(v) => setForm({ ...form, price: v === "" ? null : Number(v) })} ltr />
            <Input label="قیمت قبلی (تومان)" value={String(form.oldPrice ?? "")} onChange={(v) => setForm({ ...form, oldPrice: v === "" ? null : Number(v) })} ltr />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="برچسب" value={form.badge || ""} onChange={(v) => setForm({ ...form, badge: v })} hint="مثلاً پرفروش‌ترین" />
            <Input label="ترتیب" value={String(form.order ?? 0)} onChange={(v) => setForm({ ...form, order: Number(v) || 0 })} ltr />
            <Input label="نام آیکن" value={form.icon || ""} onChange={(v) => setForm({ ...form, icon: v })} ltr />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={!!form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} className="h-4 w-4 rounded" />
            بسته محبوب (برجسته در سایت)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>انصراف</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-brand text-white shadow-glow">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
