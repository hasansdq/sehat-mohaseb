"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users2, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, EmptyState, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Member = { id: string; name: string; role: string; bio: string | null; photoUrl: string | null; linkedin: string | null; email: string | null; order: number };

export default function TeamPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: Member[] }>("/api/admin/team");
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    const r = await api(`/api/admin/team/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error);
  };

  return (
    <div>
      <PageHeader title="تیم" desc="اعضای تیم موسسه" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl"><Plus className="h-4 w-4 ml-1" /> عضو جدید</Button>
      } />
      {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> :
       items.length === 0 ? <AdminCard><EmptyState icon={Users2} title="عضوی نیست" /></AdminCard> :
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((m) => (
            <AdminCard key={m.id}>
              <div className="flex items-start gap-3">
                {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="h-14 w-14 rounded-2xl object-cover" /> :
                  <div className="h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center text-white font-bold text-lg">{m.name.charAt(0)}</div>}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground">{m.name}</div>
                  <div className="text-sm text-primary font-semibold">{m.role}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(m)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(m.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {m.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{m.bio}</p>}
            </AdminCard>
          ))}
        </div>}
      <TeamEditor open={creating || !!editing} item={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
    </div>
  );
}

function TeamEditor({ open, item, onClose, onSaved }: { open: boolean; item: Member | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(item ? { ...item } : { name: "", role: "", bio: "", photoUrl: "", linkedin: "", email: "", order: 0 }); }, [open, item]);
  const save = async () => {
    if (!form.name?.trim()) { toast.error("نام الزامی است."); return; }
    setSaving(true);
    const r = await api(item ? `/api/admin/team/${item.id}` : "/api/admin/team", { method: item ? "PUT" : "POST", body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { toast.success("ذخیره شد."); onSaved(); } else toast.error(r.error);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl">{item ? "ویرایش عضو" : "عضو جدید"}</DialogTitle></DialogHeader>
        <div className="space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="نام" value={form.name || ""} onChange={(v) => setForm({ ...form, name: v })} />
            <Input label="سمت" value={form.role || ""} onChange={(v) => setForm({ ...form, role: v })} />
          </div>
          <Textarea label="بیوگرافی" value={form.bio || ""} onChange={(v) => setForm({ ...form, bio: v })} rows={3} />
          <Input label="آدرس عکس" value={form.photoUrl || ""} onChange={(v) => setForm({ ...form, photoUrl: v })} ltr />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="لینکدین" value={form.linkedin || ""} onChange={(v) => setForm({ ...form, linkedin: v })} ltr />
            <Input label="ایمیل" value={form.email || ""} onChange={(v) => setForm({ ...form, email: v })} ltr />
          </div>
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
