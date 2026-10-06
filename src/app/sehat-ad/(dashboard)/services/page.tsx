"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wrench, Loader2, Grip } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Badge, EmptyState, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Service = { id: string; slug: string; title: string; shortDesc: string | null; description: string | null; icon: string | null; image: string | null; order: number; featured: boolean; priceLabel: string | null };

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: Service[] }>("/api/admin/services");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    const r = await api(`/api/admin/services/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error || "خطا.");
  };

  return (
    <div>
      <PageHeader title="مدیریت خدمات" desc="خدمات موسسه" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl"><Plus className="h-4 w-4 ml-1" /> خدمت جدید</Button>
      } />
      <AdminCard className="!p-0 overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <EmptyState icon={Wrench} title="خدماتی نیست" /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-xs text-muted-foreground">
                <th className="p-3 font-semibold">ترتیب</th><th className="p-3 font-semibold">عنوان</th><th className="p-3 font-semibold">آیکن</th><th className="p-3 font-semibold">قیمت</th><th className="p-3 font-semibold">ویژه</th><th className="p-3 font-semibold">عملیات</th>
              </tr></thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3 text-muted-foreground">{s.order}</td>
                    <td className="p-3 font-bold text-foreground">{s.title}</td>
                    <td className="p-3 text-muted-foreground">{s.icon || "—"}</td>
                    <td className="p-3 text-muted-foreground">{s.priceLabel || "—"}</td>
                    <td className="p-3">{s.featured ? <Badge color="amber">بله</Badge> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(s)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(s.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
      </AdminCard>
      <ServiceEditor open={creating || !!editing} item={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
    </div>
  );
}

function ServiceEditor({ open, item, onClose, onSaved }: { open: boolean; item: Service | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(item ? { ...item } : { title: "", slug: "", shortDesc: "", description: "", icon: "", image: "", order: 0, featured: false, priceLabel: "" });
  }, [open, item]);
  const save = async () => {
    if (!form.title?.trim()) { toast.error("عنوان الزامی است."); return; }
    setSaving(true);
    const r = await api(item ? `/api/admin/services/${item.id}` : "/api/admin/services", { method: item ? "PUT" : "POST", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { toast.success("ذخیره شد."); onSaved(); } else toast.error(r.error || "خطا.");
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl">{item ? "ویرایش خدمت" : "خدمت جدید"}</DialogTitle></DialogHeader>
        <div className="space-y-3.5">
          <Input label="عنوان" value={form.title || ""} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="نام آیکن (Lucide)" value={form.icon || ""} onChange={(v) => setForm({ ...form, icon: v })} ltr hint="مثلاً Calculator" />
            <Input label="برچسب قیمت" value={form.priceLabel || ""} onChange={(v) => setForm({ ...form, priceLabel: v })} />
          </div>
          <Textarea label="توضیح کوتاه" value={form.shortDesc || ""} onChange={(v) => setForm({ ...form, shortDesc: v })} rows={2} />
          <Textarea label="توضیح کامل" value={form.description || ""} onChange={(v) => setForm({ ...form, description: v })} rows={4} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="ترتیب" value={String(form.order ?? 0)} onChange={(v) => setForm({ ...form, order: Number(v) || 0 })} ltr />
            <label className="flex items-center gap-2 text-sm font-semibold pt-6">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 rounded" />
              خدمت ویژه (نمایش در صفحه اصلی)
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
