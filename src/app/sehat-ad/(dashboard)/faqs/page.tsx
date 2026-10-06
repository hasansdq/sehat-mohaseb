"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, HelpCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, EmptyState, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FAQ = { id: string; question: string; answer: string; order: number };

export default function FaqsPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: FAQ[] }>("/api/admin/faqs");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    const r = await api(`/api/admin/faqs/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  return (
    <div>
      <PageHeader title="سوالات متداول" desc="مدیریت پرسش‌وپاسخ‌ها" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl"><Plus className="h-4 w-4 ml-1" /> سوال جدید</Button>
      } />
      <div className="space-y-3">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
         items.length === 0 ? <AdminCard><EmptyState icon={HelpCircle} title="سوالی نیست" /></AdminCard> :
          items.map((f) => (
            <AdminCard key={f.id} className="!p-0 overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => setOpen((o) => ({ ...o, [f.id]: !o[f.id] }))} className="grid place-items-center h-9 w-9 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                  {open[f.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground">{f.question}</div>
                  {open[f.id] && <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.answer}</div>}
                </div>
                <span className="text-xs text-muted-foreground">ترتیب: {f.order}</span>
                <button onClick={() => setEditing(f)} className="grid place-items-center h-9 w-9 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(f.id)} className="grid place-items-center h-9 w-9 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </AdminCard>
          ))
        }
      </div>
      <FaqEditor open={creating || !!editing} item={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
    </div>
  );
}

function FaqEditor({ open, item, onClose, onSaved }: { open: boolean; item: FAQ | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(item ? { ...item } : { question: "", answer: "", order: 0 }); }, [open, item]);
  const save = async () => {
    if (!form.question?.trim()) { toast.error("سوال الزامی است."); return; }
    setSaving(true);
    const r = await api(item ? `/api/admin/faqs/${item.id}` : "/api/admin/faqs", { method: item ? "PUT" : "POST", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { toast.success("ذخیره شد."); onSaved(); } else toast.error(r.error);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl">{item ? "ویرایش سوال" : "سوال جدید"}</DialogTitle></DialogHeader>
        <div className="space-y-3.5">
          <Input label="سوال" value={form.question || ""} onChange={(v) => setForm({ ...form, question: v })} />
          <Textarea label="پاسخ" value={form.answer || ""} onChange={(v) => setForm({ ...form, answer: v })} rows={4} />
          <Input label="ترتیب" value={String(form.order ?? 0)} onChange={(v) => setForm({ ...form, order: Number(v) || 0 })} ltr />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>انصراف</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-brand text-white shadow-glow">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
