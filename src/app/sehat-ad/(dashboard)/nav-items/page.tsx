"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, ChevronDown, Loader2, Menu } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Badge, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  parentId: string | null;
  order: number;
  visible: boolean;
  children?: NavItem[];
};

export default function NavItemsPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: NavItem[] }>("/api/admin/nav-items");
    if (r.ok && r.data) {
      const tops = r.data.items.filter((i) => !i.parentId).sort((a, b) => a.order - b.order);
      const tree = tops.map((top) => ({
        ...top,
        children: r.data!.items.filter((c) => c.parentId === top.id).sort((a, b) => a.order - b.order),
      }));
      setItems(tree);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("این آیتم منو حذف شود؟ زیرمنو‌ها هم حذف می‌شوند.")) return;
    const r = await api(`/api/admin/nav-items/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error || "خطا.");
  };

  const toggleVisible = async (item: NavItem) => {
    const r = await api(`/api/admin/nav-items/${item.id}`, {
      method: "PUT",
      body: JSON.stringify({ visible: !item.visible }),
    });
    if (r.ok) { toast.success(item.visible ? "مخفی شد." : "نمایش داده شد."); load(); }
  };

  return (
    <div>
      <PageHeader title="مدیریت منوی هدر" desc="تنظیم آیتم‌های منوی بالای سایت — برچسب، لینک، ترتیب و نمایش" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl">
          <Plus className="h-4 w-4 ml-1" /> آیتم جدید
        </Button>
      } />

      <AdminCard className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Menu} title="آیتم منویی وجود ندارد" desc="اولین آیتم را ایجاد کنید." />
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((item) => (
              <div key={item.id}>
                {/* top-level item */}
                <div className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{item.label}</span>
                      {!item.visible && <Badge color="muted">مخفی</Badge>}
                      {item.children && item.children.length > 0 && <Badge color="primary">{item.children.length} زیرمنو</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">{item.href}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleVisible(item)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="نمایش/مخفی">
                      {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditing(item)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(item.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* children */}
                {item.children && item.children.length > 0 && (
                  <div className="pr-12 bg-muted/10">
                    {item.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors border-t border-border/20">
                        <ChevronDown className="h-3 w-3 text-muted-foreground/40 rotate-[-90deg] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground/90">{child.label}</span>
                            {!child.visible && <Badge color="muted">مخفی</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">{child.href}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleVisible(child)} className="grid place-items-center h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                            {child.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => setEditing(child)} className="grid place-items-center h-7 w-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => remove(child.id)} className="grid place-items-center h-7 w-7 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Add sub-item button for parent items */}
      <div className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">افزودن زیرمنو به یک آیتم والد:</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              onClick={() => { setEditing(null); setCreating(true); }}
              className="text-xs"
            >
              <Plus className="h-3 w-3 ml-1" /> زیرمنو برای {item.label}
            </Button>
          ))}
        </div>
      </div>

      <NavItemEditor
        open={creating || !!editing}
        item={editing}
        parents={items}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSaved={() => { setCreating(false); setEditing(null); load(); }}
      />
    </div>
  );
}

function NavItemEditor({
  open, item, parents, onClose, onSaved,
}: {
  open: boolean;
  item: NavItem | null;
  parents: NavItem[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        label: item?.label || "",
        href: item?.href || "/",
        icon: item?.icon || "",
        parentId: item?.parentId || null,
        order: item?.order || 0,
        visible: item?.visible !== false,
      });
    }
  }, [open, item]);

  const save = async () => {
    if (!form.label?.trim()) { toast.error("برچسب الزامی است."); return; }
    if (!form.href?.trim()) { toast.error("لینک الزامی است."); return; }
    setSaving(true);
    const r = await api(
      item ? `/api/admin/nav-items/${item.id}` : "/api/admin/nav-items",
      { method: item ? "PUT" : "POST", body: JSON.stringify(form) }
    );
    setSaving(false);
    if (r.ok) { toast.success("ذخیره شد."); onSaved(); } else toast.error(r.error || "خطا.");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{item ? "ویرایش آیتم منو" : "آیتم منوی جدید"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5">
          <label className="block">
            <span className="text-sm font-semibold text-foreground mb-1.5 block">برچسب (نام نمایشی)</span>
            <input
              value={form.label || ""}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="مثلاً خدمات"
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-foreground mb-1.5 block">لینک (URL)</span>
            <input
              value={form.href || ""}
              onChange={(e) => setForm({ ...form, href: e.target.value })}
              placeholder="/services"
              dir="ltr"
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-foreground mb-1.5 block">آیتم والد (برای زیرمنو)</span>
            <select
              value={form.parentId || ""}
              onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">— آیتم سطح بالا (والد) —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-foreground mb-1.5 block">ترتیب نمایش</span>
              <input
                type="number"
                value={form.order || 0}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                dir="ltr"
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </label>
            <label className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                checked={form.visible !== false}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm font-semibold text-foreground">نمایش در منو</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>انصراف</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-brand text-white shadow-glow">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
