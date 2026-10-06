"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, EmptyState, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type T = { id: string; name: string; company: string | null; role: string | null; message: string; rating: number; avatarUrl: string | null; order: number };

export default function TestimonialsPage() {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: T[] }>("/api/admin/testimonials");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    const r = await api(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  return (
    <div>
      <PageHeader title="نظرات مشتریان" desc="مدیریت دیدگاه‌ها" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl"><Plus className="h-4 w-4 ml-1" /> نظر جدید</Button>
      } />
      {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
       items.length === 0 ? <AdminCard><EmptyState icon={Star} title="نظری نیست" /></AdminCard> :
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((t) => (
            <AdminCard key={t.id}>
              <div className="flex items-start gap-3">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />)}</div>
                <div className="mr-auto flex gap-1">
                  <button onClick={() => setEditing(t)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(t.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/80 leading-relaxed">«{t.message}»</p>
              <div className="mt-3 text-sm">
                <span className="font-bold text-foreground">{t.name}</span>
                <span className="text-muted-foreground"> • {[t.role, t.company].filter(Boolean).join("، ")}</span>
              </div>
            </AdminCard>
          ))}
        </div>}
      <TestimonialEditor open={creating || !!editing} item={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
    </div>
  );
}

function TestimonialEditor({ open, item, onClose, onSaved }: { open: boolean; item: T | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(item ? { ...item } : { name: "", company: "", role: "", message: "", rating: 5, avatarUrl: "", order: 0 }); }, [open, item]);
  const save = async () => {
    if (!form.name?.trim()) { toast.error("نام الزامی است."); return; }
    setSaving(true);
    const r = await api(item ? `/api/admin/testimonials/${item.id}` : "/api/admin/testimonials", { method: item ? "PUT" : "POST", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { toast.success("ذخیره شد."); onSaved(); } else toast.error(r.error);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl">{item ? "ویرایش نظر" : "نظر جدید"}</DialogTitle></DialogHeader>
        <div className="space-y-3.5">
          <Input label="نام" value={form.name || ""} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="سمت" value={form.role || ""} onChange={(v) => setForm({ ...form, role: v })} />
            <Input label="شرکت" value={form.company || ""} onChange={(v) => setForm({ ...form, company: v })} />
          </div>
          <Textarea label="متن نظر" value={form.message || ""} onChange={(v) => setForm({ ...form, message: v })} rows={3} />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-foreground mb-1.5 block">امتیاز</span>
              <select value={form.rating || 5} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ستاره</option>)}
              </select>
            </label>
            <Input label="ترتیب" value={String(form.order ?? 0)} onChange={(v) => setForm({ ...form, order: Number(v) || 0 })} ltr />
          </div>
          <Input label="آدرس آواتار" value={form.avatarUrl || ""} onChange={(v) => setForm({ ...form, avatarUrl: v })} ltr placeholder="https://..." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>انصراف</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-brand text-white shadow-glow">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
