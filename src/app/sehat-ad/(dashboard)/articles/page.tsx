"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, FileText, Star, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Badge, EmptyState, faDate, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Article = { id: string; slug: string; title: string; excerpt: string | null; content: string; coverUrl: string | null; category: string | null; tags: string | null; authorName: string | null; status: string; featured: boolean; views: number; publishedAt: string | null; createdAt: string };

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ items: Article[] }>(`/api/admin/articles?q=${encodeURIComponent(q)}`);
    if (r.ok && r.data) setItems(r.data.items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSearch = () => load();

  const remove = async (id: string) => {
    if (!confirm("این مقاله حذف شود؟")) return;
    const r = await api(`/api/admin/articles/${id}`, { method: "DELETE" });
    if (r.ok) { toast.success("حذف شد."); load(); } else toast.error(r.error || "خطا.");
  };

  return (
    <div>
      <PageHeader title="مدیریت مقالات" desc="ایجاد، ویرایش و حذف مقالات" action={
        <Button onClick={() => setCreating(true)} className="bg-gradient-brand text-white shadow-glow rounded-xl">
          <Plus className="h-4 w-4 ml-1" /> مقاله جدید
        </Button>
      } />

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} placeholder="جستجوی عنوان..." className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
        <Button variant="outline" onClick={onSearch}>جستجو</Button>
      </div>

      <AdminCard className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div>
        ) : items.length === 0 ? (
          <EmptyState icon={FileText} title="مقاله‌ای یافت نشد" desc="اولین مقاله را ایجاد کنید." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-right text-xs text-muted-foreground">
                  <th className="p-3 font-semibold">عنوان</th>
                  <th className="p-3 font-semibold">دسته</th>
                  <th className="p-3 font-semibold">وضعیت</th>
                  <th className="p-3 font-semibold">بازدید</th>
                  <th className="p-3 font-semibold">تاریخ</th>
                  <th className="p-3 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {a.featured && <Star className="h-4 w-4 text-amber-400 fill-amber-400 flex-shrink-0" />}
                        <span className="font-bold text-foreground line-clamp-1">{a.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{a.category || "—"}</td>
                    <td className="p-3"><Badge color={a.status === "PUBLISHED" ? "emerald" : a.status === "ARCHIVED" ? "muted" : "amber"}>{a.status === "PUBLISHED" ? "منتشر شده" : a.status === "ARCHIVED" ? "بایگانی" : "پیش‌نویس"}</Badge></td>
                    <td className="p-3 text-muted-foreground">{a.views.toLocaleString("fa-IR")}</td>
                    <td className="p-3 text-muted-foreground text-xs">{faDate(a.publishedAt || a.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(a)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="ویرایش"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(a.id)} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <ArticleEditor open={creating || !!editing} article={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
    </div>
  );
}

function ArticleEditor({ open, article, onClose, onSaved }: { open: boolean; article: Article | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(article ? { ...article } : { title: "", slug: "", excerpt: "", content: "", coverUrl: "", category: "", tags: "", authorName: "", status: "DRAFT", featured: false, readingMinutes: "" });
    }
  }, [open, article]);

  const save = async () => {
    if (!form.title?.trim()) { toast.error("عنوان الزامی است."); return; }
    setSaving(true);
    const method = article ? "PUT" : "POST";
    const path = article ? `/api/admin/articles/${article.id}` : "/api/admin/articles";
    const r = await api(path, { method, body: JSON.stringify(form) });
    setSaving(false);
    if (r.ok) { toast.success(article ? "بروزرسانی شد." : "ایجاد شد."); onSaved(); } else toast.error(r.error || "خطا.");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{article ? "ویرایش مقاله" : "مقاله جدید"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5">
          <Input label="عنوان" value={form.title || ""} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="نامک (slug)" value={form.slug || ""} onChange={(v) => setForm({ ...form, slug: v })} ltr hint="خالی بگذارید تا خودکار ساخته شود" />
            <Input label="دسته‌بندی" value={form.category || ""} onChange={(v) => setForm({ ...form, category: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="نام نویسنده" value={form.authorName || ""} onChange={(v) => setForm({ ...form, authorName: v })} />
            <Input label="زمان مطالعه (دقیقه)" value={String(form.readingMinutes || "")} onChange={(v) => setForm({ ...form, readingMinutes: v })} ltr />
          </div>
          <Input label="آدرس کاور" value={form.coverUrl || ""} onChange={(v) => setForm({ ...form, coverUrl: v })} ltr placeholder="https://..." />
          <Input label="برچسب‌ها (با ویرگول)" value={form.tags || ""} onChange={(v) => setForm({ ...form, tags: v })} />
          <Textarea label="خلاصه" value={form.excerpt || ""} onChange={(v) => setForm({ ...form, excerpt: v })} rows={2} />
          <Textarea label="محتوا" value={form.content || ""} onChange={(v) => setForm({ ...form, content: v })} rows={8} hint="پشتیبانی از متن ساده" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 rounded" />
              مقاله ویژه
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              وضعیت:
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                <option value="DRAFT">پیش‌نویس</option>
                <option value="PUBLISHED">منتشر شده</option>
                <option value="ARCHIVED">بایگانی</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>انصراف</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-brand text-white shadow-glow">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
