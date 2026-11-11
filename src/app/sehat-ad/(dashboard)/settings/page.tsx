"use client";

import { useEffect, useState, useRef } from "react";
import { Settings, Loader2, Save, Globe, Phone, Share2, Search as SeoIcon, Sparkles, Shield, UserCog, Database, Palette, Zap, CheckCircle2, XCircle, Loader, ShieldCheck, Newspaper, Upload, Image as ImageIcon, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "عمومی", icon: Globe },
  { id: "theme", label: "رنگ‌بندی و تم", icon: Palette },
  { id: "trustbar", label: "نوار بالای هدر", icon: ShieldCheck },
  { id: "blog", label: "تنظیمات وبلاگ", icon: Newspaper },
  { id: "contact", label: "تماس", icon: Phone },
  { id: "social", label: "شبکه‌های اجتماعی", icon: Share2 },
  { id: "seo", label: "سئو", icon: SeoIcon },
  { id: "ai", label: "هوش مصنوعی", icon: Sparkles },
  { id: "openai", label: "اتصال OpenAI", icon: Zap },
  { id: "security", label: "امنیت", icon: Shield },
  { id: "admin", label: "ورود مدیر", icon: UserCog },
  { id: "backup", label: "پشتیبان", icon: Database },
];

// group mapping for each setting key
const KEY_GROUP: Record<string, string> = {};
const KEY_LABELS: Record<string, { label: string; type?: "text" | "textarea" | "boolean"; group: string; hint?: string; ltr?: boolean }> = {
  // general
  "site.title": { label: "عنوان سایت", group: "general" },
  "site.tagline": { label: "شعار", group: "general" },
  "site.description": { label: "توضیحات کوتاه", group: "general", type: "textarea" },
  "site.announcement": { label: "پیام اعلان", group: "general", hint: "نوار اعلان بالای سایت" },
  "site.announcementActive": { label: "فعال‌سازی اعلان", group: "general", type: "boolean" },
  // theme (color picker)
  "site.brandColor": { label: "رنگ اصلی برند", group: "theme", ltr: true, hint: "رنگ غالب سایت (دکمه‌ها، گرادینت‌ها، آیکن‌ها)" },
  "site.accentColor": { label: "رنگ طلایی/تاکیدی", group: "theme", ltr: true, hint: "رنگ ثانویه برای تاکید و بَج‌ها" },
  // trustbar (marquee bar at top of header)
  "trustbar.enabled": { label: "نمایش نوار بالای هدر", group: "trustbar", type: "boolean" },
  "trustbar.item1_text": { label: "متن آیتم ۱", group: "trustbar" },
  "trustbar.item1_icon": { label: "آیکن آیتم ۱ (Lucide)", group: "trustbar", ltr: true, hint: "مثلاً ShieldCheck, Award, Headset" },
  "trustbar.item2_text": { label: "متن آیتم ۲", group: "trustbar" },
  "trustbar.item2_icon": { label: "آیکن آیتم ۲ (Lucide)", group: "trustbar", ltr: true },
  "trustbar.item3_text": { label: "متن آیتم ۳", group: "trustbar" },
  "trustbar.item3_icon": { label: "آیکن آیتم ۳ (Lucide)", group: "trustbar", ltr: true },
  "trustbar.item4_text": { label: "متن آیتم ۴", group: "trustbar" },
  "trustbar.item4_icon": { label: "آیکن آیتم ۴ (Lucide)", group: "trustbar", ltr: true },
  "trustbar.item5_text": { label: "متن آیتم ۵ (اختیاری)", group: "trustbar", hint: "خالی بگذارید تا نمایش داده نشود" },
  "trustbar.item5_icon": { label: "آیکن آیتم ۵", group: "trustbar", ltr: true },
  "trustbar.item6_text": { label: "متن آیتم ۶ (اختیاری)", group: "trustbar", hint: "خالی بگذارید تا نمایش داده نشود" },
  "trustbar.item6_icon": { label: "آیکن آیتم ۶", group: "trustbar", ltr: true },
  // blog settings
  "blog.title": { label: "عنوان صفحه وبلاگ", group: "blog" },
  "blog.subtitle": { label: "زیرعنوان وبلاگ", group: "blog", type: "textarea" },
  "blog.showSearch": { label: "نمایش جستجو در وبلاگ", group: "blog", type: "boolean" },
  "blog.showNewsletter": { label: "نمایش خبرنامه در وبلاگ", group: "blog", type: "boolean" },
  "blog.newsletterTitle": { label: "عنوان بخش خبرنامه", group: "blog" },
  "blog.newsletterSubtitle": { label: "زیرعنوان خبرنامه", group: "blog", type: "textarea" },
  "blog.postsPerPage": { label: "تعداد مقاله در هر صفحه", group: "blog", ltr: true },
  // contact
  "contact.phone": { label: "تلفن", group: "contact", ltr: true },
  "contact.phone2": { label: "تلفن دوم", group: "contact", ltr: true },
  "contact.email": { label: "ایمیل", group: "contact", ltr: true },
  "contact.address": { label: "آدرس", group: "contact", type: "textarea" },
  "contact.workingHours": { label: "ساعات کاری", group: "contact" },
  // social
  "social.instagram": { label: "اینستاگرام", group: "social", ltr: true },
  "social.telegram": { label: "تلگرام", group: "social", ltr: true },
  "social.bale": { label: "بله", group: "social", ltr: true },
  "social.linkedin": { label: "لینکدین", group: "social", ltr: true },
  "social.whatsapp": { label: "واتساپ", group: "social", ltr: true },
  "social.aparat": { label: "آپارات", group: "social", ltr: true },
  // seo
  "seo.metaTitle": { label: "عنوان متا", group: "seo" },
  "seo.metaDescription": { label: "توضیحات متا", group: "seo", type: "textarea" },
  // ai
  "ai.enabled": { label: "فعال‌سازی دستیار هوش مصنوعی", group: "ai", type: "boolean" },
  "ai.model": { label: "مدل", group: "ai", ltr: true, hint: "مثلاً glm-4.6" },
  "ai.temperature": { label: "دما (0-1)", group: "ai", ltr: true },
  "ai.maxTokens": { label: "حداکثر توکن", group: "ai", ltr: true },
  "ai.systemPrompt": { label: "پرامپت پایه سیستم", group: "ai", type: "textarea", hint: "هویت و رفتار دستیار. در زمان اجرا با اطلاعات خدمات و بسته‌ها تکمیل می‌شود." },
  "ai.greeting": { label: "پیام خوش‌آمدگویی", group: "ai", type: "textarea" },
  "ai.enablePackageBuilder": { label: "ساخت پک اختصاصی", group: "ai", type: "boolean" },
  "ai.enableConsultation": { label: "رزرو مشاوره", group: "ai", type: "boolean" },
  // openai connection
  "openai.enabled": { label: "استفاده از OpenAI به‌جای SDK پیش‌فرض", group: "openai", type: "boolean" },
  "openai.apiKey": { label: "کلید API OpenAI", group: "openai", ltr: true, hint: "مثلاً sk-proj-xxxxxx — از پنل OpenAI دریافت کنید" },
  "openai.baseUrl": { label: "آدرس API (اختیاری)", group: "openai", ltr: true, hint: "پیش‌فرض: https://api.openai.com/v1 — برای پراکسی قابل تغییر" },
  "openai.model": { label: "مدل انتخابی", group: "openai", ltr: true, hint: "از لیست مدل‌ها انتخاب کنید (بعد از تست اتصال)" },
  "openai.temperature": { label: "دما (0-2)", group: "openai", ltr: true },
  "openai.maxTokens": { label: "حداکثر توکن پاسخ", group: "openai", ltr: true },
  // security
  "security.maxLoginAttempts": { label: "حداکثر تلاش ورود", group: "security", ltr: true },
  "security.lockMinutes": { label: "مدت قفل (دقیقه)", group: "security", ltr: true },
  "security.rateLimit": { label: "محدودسازی نرخ درخواست", group: "security", type: "boolean" },
  "security.twoFactor": { label: "احراز هویت دو مرحله‌ای", group: "security", type: "boolean", hint: "به‌زودی" },
  // backup
  "backup.autoEnabled": { label: "پشتیبان خودکار", group: "backup", type: "boolean", hint: "نیازمند زمان‌بندی سرور" },
};

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api<{ settings: Record<string, string> }>("/api/admin/settings");
    if (r.ok && r.data) setSettings(r.data.settings);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const keysForTab = Object.entries(KEY_LABELS).filter(([, meta]) => meta.group === tab).map(([k]) => k);

  const save = async () => {
    setSaving(true);
    const items: Record<string, { value: string; group: string }> = {};
    for (const k of keysForTab) {
      items[k] = { value: settings[k] ?? "", group: KEY_LABELS[k].group };
    }
    const r = await api("/api/admin/settings", { method: "PUT", body: JSON.stringify({ items }) });
    setSaving(false);
    if (r.ok) toast.success("تنظیمات ذخیره شد."); else toast.error(r.error || "خطا.");
  };

  return (
    <div>
      <PageHeader title="تنظیمات" desc="مدیریت کامل تنظیمات سایت و سیستم" action={
        <Button onClick={save} disabled={saving || loading} className="bg-gradient-brand text-white shadow-glow rounded-xl">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 ml-1" />}
          {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </Button>
      } />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-thin pb-2 lg:pb-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn("flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition-all", tab === t.id ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                <t.icon className="h-4 w-4 flex-shrink-0" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0">
          <AdminCard>
            {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> در حال بارگذاری...</div> : (
              <div className="space-y-4">
                {tab === "admin" ? (
                  <AdminCredentials />
                ) : (
                  <>
                    <div className="flex items-center gap-2 pb-3 border-b border-border">
                      {(() => { const T = TABS.find((t) => t.id === tab)!; return <><T.icon className="h-5 w-5 text-primary" /><h3 className="font-bold text-foreground">{T.label}</h3></>; })()}
                    </div>

                    {/* ===== Logo uploader (only on general tab) ===== */}
                    {tab === "general" && (
                      <LogoUploader
                        value={settings["site.logoUrl"] || ""}
                        onChange={(url) => setSettings({ ...settings, "site.logoUrl": url })}
                      />
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      {keysForTab.map((k) => {
                        const meta = KEY_LABELS[k];
                        const val = settings[k] ?? "";
                        if (meta.type === "boolean") {
                          return (
                            <label key={k} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3.5">
                              <div><div className="text-sm font-bold text-foreground">{meta.label}</div>{meta.hint && <div className="text-xs text-muted-foreground mt-0.5">{meta.hint}</div>}</div>
                              <button
                                onClick={() => setSettings({ ...settings, [k]: val === "true" ? "false" : "true" })}
                                className={cn("relative h-7 w-12 rounded-full transition-colors", val === "true" ? "bg-gradient-brand" : "bg-muted")}
                              >
                                <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", val === "true" ? "left-1" : "right-1")} />
                              </button>
                            </label>
                          );
                        }
                        if (meta.type === "textarea") {
                          return (
                            <div key={k} className="sm:col-span-2">
                              <Textarea label={meta.label} value={val} onChange={(v) => setSettings({ ...settings, [k]: v })} rows={4} hint={meta.hint} />
                            </div>
                          );
                        }
                        return <Input key={k} label={meta.label} value={val} onChange={(v) => setSettings({ ...settings, [k]: v })} ltr={meta.ltr} hint={meta.hint} placeholder={meta.ltr ? "..." : ""} />;
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

function AdminCredentials() {
  const [username, setUsername] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingU, setSavingU] = useState(false);
  const [savingP, setSavingP] = useState(false);
  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/admin/settings").then((r) => {
      if (r.ok && r.data) setUsername(r.data.settings["admin.username"] || "");
    });
  }, []);

  const changeUsername = async () => {
    if (username.length < 3) { toast.error("نام کاربری کوتاه است."); return; }
    setSavingU(true);
    const r = await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ action: "changeUsername", username }) });
    setSavingU(false);
    if (r.ok) toast.success("نام کاربری تغییر کرد."); else toast.error(r.error);
  };
  const changePassword = async () => {
    if (newPw.length < 12) { toast.error("رمز جدید کوتاه است."); return; }
    setSavingP(true);
    const r = await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ action: "changePassword", currentPassword: currentPw, newPassword: newPw }) });
    setSavingP(false);
    if (r.ok) { toast.success("رمز عبور تغییر کرد."); setCurrentPw(""); setNewPw(""); } else toast.error(r.error);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-border mb-4"><UserCog className="h-5 w-5 text-primary" /><h3 className="font-bold text-foreground">نام کاربری مدیر</h3></div>
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <Input label="نام کاربری" value={username} onChange={(v) => setUsername(v)} ltr />
          <Button onClick={changeUsername} disabled={savingU} className="bg-gradient-brand text-white shadow-glow h-[42px]">{savingU ? <Loader2 className="h-4 w-4 animate-spin" /> : "تغییر نام کاربری"}</Button>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 pb-3 border-b border-border mb-4"><Shield className="h-5 w-5 text-primary" /><h3 className="font-bold text-foreground">تغییر رمز عبور مدیر</h3></div>
        <div className="space-y-3">
          <Input label="رمز عبور فعلی" value={currentPw} onChange={(v) => setCurrentPw(v)} type="password" ltr />
          <Input label="رمز عبور جدید" value={newPw} onChange={(v) => setNewPw(v)} type="password" ltr hint="حداقل ۱۲ کاراکتر" />
          <Button onClick={changePassword} disabled={savingP} className="bg-gradient-brand text-white shadow-glow">{savingP ? <Loader2 className="h-4 w-4 animate-spin" /> : "تغییر رمز عبور"}</Button>
        </div>
      </div>
      <div className="rounded-xl bg-amber-400/5 border border-amber-400/20 p-4 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>تغییر نام کاربری یا رمز عبور بلافاصله اعمال می‌شود. برای ورود بعدی از اطلاعات جدید استفاده کنید.</div>
      </div>
    </div>
  );
}

// ============================================================
// LogoUploader — professional file-picker upload for site logo
// ============================================================
// - Click to pick (file picker dialog)
// - Drag & drop support
// - Image preview (with on-page delete)
// - 1:1 square crop is NOT applied — we just display the uploaded
//   image as-is; admin should upload a square or rounded logo.
// - The selected URL is stored as `site.logoUrl` setting and is
//   used both in the navbar AND as the site favicon (injected at
//   runtime via BrandFaviconInjector).
// ============================================================
function LogoUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    // Client-side validation
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("حجم تصویر باید کمتر از ۸ مگابایت باشد.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", "logo");
      const resp = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await resp.json();
      if (json.ok && json.data?.url) {
        onChange(json.data.url);
        toast.success("لوگو بارگذاری شد. برای اعمال روی سایت، تنظیمات را ذخیره کنید.");
      } else {
        toast.error(json.error || "خطا در بارگذاری لوگو.");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور.");
    }
    setUploading(false);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
    // reset so picking the same file again still triggers change
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  };

  const hasLogo = !!value && value !== "/favicon.svg";

  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h4 className="font-bold text-foreground text-sm">لوگوی سایت</h4>
        <span className="text-xs text-muted-foreground">— لوگوی اصلی سایت (و فاوآیکون)</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview area */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "relative grid place-items-center cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden bg-gradient-to-br from-muted/40 to-muted/10",
            dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/40",
            hasLogo ? "h-28 w-28 sm:h-32 sm:w-32" : "h-32 w-full sm:w-72"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
          aria-label="بارگذاری لوگو"
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-primary">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-xs font-bold">در حال بارگذاری…</span>
            </div>
          ) : hasLogo ? (
            <>
              {/* Logo preview — checkerboard background to reveal transparency */}
              <div className="absolute inset-0 checker-bg opacity-30" aria-hidden />
              <img src={value} alt="پیش‌نمایش لوگو" className="relative max-h-full max-w-full object-contain p-2" />
              <button
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="absolute top-1.5 left-1.5 grid place-items-center h-7 w-7 rounded-full bg-rose-500/90 text-white hover:bg-rose-500 transition-colors shadow-md z-10"
                aria-label="حذف لوگو"
                title="حذف لوگو"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute bottom-1 right-1.5 text-[10px] font-bold text-foreground/80 bg-background/80 backdrop-blur px-2 py-0.5 rounded-md z-10">
                پیش‌نمایش
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-6 px-4 text-center">
              <Upload className="h-7 w-7" />
              <div>
                <div className="text-sm font-bold text-foreground">کلیک کنید یا فایل را بکشید</div>
                <div className="text-xs mt-1">PNG, SVG, WebP, JPG — حداکثر ۸MB</div>
                <div className="text-[11px] mt-1 text-muted-foreground/70">بهتر است تصویر مربع و شفاف باشد</div>
              </div>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
        </div>

        {/* Info / actions */}
        <div className="flex-1 min-w-0 space-y-2">
          {hasLogo && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">آدرس ذخیره‌شده:</div>
              <div className="flex items-center gap-2">
                <code dir="ltr" className="text-xs font-mono text-primary bg-primary/5 border border-primary/20 rounded-md px-2 py-1 break-all flex-1">
                  {value}
                </code>
                <button
                  onClick={() => navigator.clipboard?.writeText(value).then(() => toast.success("کپی شد."))}
                  className="grid place-items-center h-8 w-8 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-colors flex-shrink-0"
                  title="کپی آدرس"
                  aria-label="کپی آدرس"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-brand text-white shadow-glow rounded-xl"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Upload className="h-4 w-4 ml-1" />}
              {uploading ? "در حال بارگذاری..." : "انتخاب فایل"}
            </Button>
            {hasLogo && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onChange("/favicon.svg")}
                className="rounded-xl"
                title="بازگشت به لوگوی پیش‌فرض"
              >
                بازگشت به پیش‌فرض
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            این لوگو در نوار بالای سایت و به‌عنوان فاوآیکون (آیکن مرورگر) استفاده می‌شود.
            برای اعمال، روی «ذخیره تنظیمات» بزنید.
          </p>
        </div>
      </div>
    </div>
  );
}
