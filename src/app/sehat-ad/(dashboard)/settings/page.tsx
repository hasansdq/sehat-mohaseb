"use client";

import { useEffect, useState } from "react";
import { Settings, Loader2, Save, Globe, Phone, Share2, Search as SeoIcon, Sparkles, Shield, UserCog, Database } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, Input, Textarea } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "عمومی", icon: Globe },
  { id: "contact", label: "تماس", icon: Phone },
  { id: "social", label: "شبکه‌های اجتماعی", icon: Share2 },
  { id: "seo", label: "سئو", icon: SeoIcon },
  { id: "ai", label: "هوش مصنوعی", icon: Sparkles },
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
  "site.logoUrl": { label: "آدرس لوگو", group: "general", ltr: true },
  "site.brandColor": { label: "رنگ برند (HEX)", group: "general", ltr: true },
  "site.announcement": { label: "پیام اعلان", group: "general", hint: "نوار اعلان بالای سایت" },
  "site.announcementActive": { label: "فعال‌سازی اعلان", group: "general", type: "boolean" },
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
    if (newPw.length < 6) { toast.error("رمز جدید کوتاه است."); return; }
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
          <Input label="رمز عبور جدید" value={newPw} onChange={(v) => setNewPw(v)} type="password" ltr hint="حداقل ۶ کاراکتر" />
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
