"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Save, Search, FileCode, Eye, RotateCcw, Layers, Package } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageHeader, AdminCard, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===================================================================
// Catalog of ALL editable landing-block content, grouped + labeled in
// Persian so the admin knows exactly what each field controls on the
// public site. Adding a new key here automatically makes it editable.
// ===================================================================
type FieldDef = { key: string; label: string; type?: "text" | "textarea"; hint?: string; ltr?: boolean };
type GroupDef = { id: string; label: string; icon: any; description: string; fields: FieldDef[] };

const CATALOG: GroupDef[] = [
  {
    id: "hero",
    label: "بخش اصلی (هیرو)",
    icon: Layers,
    description: "متن‌های بالای صفحه اصلی — تیتر، زیرعنوان، دکمه‌ها، بَج تأیید",
    fields: [
      { key: "badge", label: "متن بَج تأیید", hint: "نوار کنار تیتر" },
      { key: "title_line1", label: "تیتر — خط اول" },
      { key: "title_line2", label: "تیتر — خط دوم (گرادینتی)", hint: "این خط با رنگ گرادینتی نمایش داده می‌شود" },
      { key: "title_line3", label: "تیتر — خط سوم" },
      { key: "subtitle", label: "زیرعنوان توضیحی", type: "textarea" },
      { key: "cta1", label: "متن دکمه اصلی (CTA اول)" },
      { key: "cta2", label: "متن دکمه دوم (CTA دوم)" },
      { key: "feature1", label: "قرص ویژگی ۱" },
      { key: "feature2", label: "قرص ویژگی ۲" },
      { key: "feature3", label: "قرص ویژگی ۳" },
      { key: "ministat1_value", label: "آمار کوچک ۱ — مقدار" },
      { key: "ministat1_label", label: "آمار کوچک ۱ — برچسب" },
      { key: "ministat2_value", label: "آمار کوچک ۲ — مقدار" },
      { key: "ministat2_label", label: "آمار کوچک ۲ — برچسب" },
      { key: "ministat3_value", label: "آمار کوچک ۳ — مقدار" },
      { key: "ministat3_label", label: "آمار کوچک ۳ — برچسب" },
      { key: "ministat4_value", label: "آمار کوچک ۴ — مقدار" },
      { key: "ministat4_label", label: "آمار کوچک ۴ — برچسب" },
    ],
  },
  {
    id: "hero-dashboard",
    label: "داشبورد مالی هیرو",
    icon: FileCode,
    description: "برچسب‌های داخل کارت داشبورد شناور در هیرو",
    fields: [
      { key: "dash_title", label: "عنوان کارت داشبورد" },
      { key: "dash_subtitle", label: "زیرعنوان کارت" },
      { key: "dash_status", label: "وضعیت (بَج)" },
      { key: "dash_chart_label", label: "برچسب نمودار" },
      { key: "dash_kpi1_label", label: "KPI ۱ — برچسب" },
      { key: "dash_kpi1_value", label: "KPI ۱ — مقدار", ltr: true },
      { key: "dash_kpi2_label", label: "KPI ۲ — برچسب" },
      { key: "dash_kpi2_value", label: "KPI ۲ — مقدار", ltr: true },
      { key: "dash_kpi3_label", label: "KPI ۳ — برچسب" },
      { key: "dash_kpi3_value", label: "KPI ۳ — مقدار", ltr: true },
      { key: "dash_risk_label", label: "برچسب ریسک مالیاتی" },
      { key: "dash_risk_value", label: "مقدار ریسک (کم/متوسط/زیاد)" },
      { key: "dash_health", label: "متن بَج سلامت" },
    ],
  },
  {
    id: "hero-cards",
    label: "کارت‌های شناور هیرو",
    icon: Layers,
    description: "کارت‌های شناور (مالیات/رشد/مشاوره) و لوگو شرکا",
    fields: [
      { key: "card1_label", label: "کارت شناور ۱ — برچسب" },
      { key: "card1_value", label: "کارت شناور ۱ — مقدار" },
      { key: "card2_label", label: "کارت شناور ۲ — برچسب" },
      { key: "card2_value", label: "کارت شناور ۲ — مقدار" },
      { key: "card3_label", label: "کارت شناور ۳ — برچسب" },
      { key: "card3_value", label: "کارت شناور ۳ — مقدار" },
      { key: "partners_title", label: "عنوان نوار شرکا" },
      { key: "partner1_name", label: "شریک ۱ — نام" },
      { key: "partner1_sub", label: "شریک ۱ — زیرعنوان" },
      { key: "partner2_name", label: "شریک ۲ — نام" },
      { key: "partner2_sub", label: "شریک ۲ — زیرعنوان" },
      { key: "partner3_name", label: "شریک ۳ — نام" },
      { key: "partner3_sub", label: "شریک ۳ — زیرعنوان" },
      { key: "ai_teaser_title", label: "تیزر دستیار AI — عنوان" },
      { key: "ai_teaser_sub", label: "تیزر دستیار AI — زیرعنوان" },
      { key: "scroll_hint", label: "متن راهنمای اسکرول" },
    ],
  },
  {
    id: "stats",
    label: "بخش آمار",
    icon: Layers,
    description: "۴ شمارنده آماری پایین هیرو صفحه اصلی",
    fields: [
      { key: "stat1_value", label: "آمار ۱ — مقدار" },
      { key: "stat1_label", label: "آمار ۱ — برچسب" },
      { key: "stat2_value", label: "آمار ۲ — مقدار" },
      { key: "stat2_label", label: "آمار ۲ — برچسب" },
      { key: "stat3_value", label: "آمار ۳ — مقدار" },
      { key: "stat3_label", label: "آمار ۳ — برچسب" },
      { key: "stat4_value", label: "آمار ۴ — مقدار" },
      { key: "stat4_label", label: "آمار ۴ — برچسب" },
    ],
  },
  {
    id: "about",
    label: "درباره ما",
    icon: FileCode,
    description: "متن بخش «درباره» در صفحه اصلی و صفحه /about",
    fields: [
      { key: "eyebrow", label: "عنوان کوچک بالای بخش" },
      { key: "title", label: "تیتر بخش" },
      { key: "body", label: "متن اصلی (پاراگراف اول)", type: "textarea" },
      { key: "body2", label: "متن تکمیلی (پاراگراف دوم)", type: "textarea" },
    ],
  },
  {
    id: "titles",
    label: "عناوین سایر بخش‌ها",
    icon: Layers,
    description: "تیتر بخش‌های «چرا ما»، «مسیر همکاری» و CTA نهایی",
    fields: [
      { key: "why.title", label: "تیتر «چرا صحت محاسب؟»", section: "why" },
      { key: "process.title", label: "تیتر «مسیر همکاری»", section: "process" },
      { key: "cta.title", label: "تیتر CTA نهایی", section: "cta" },
      { key: "cta.subtitle", label: "زیرعنوان CTA نهایی", type: "textarea", section: "cta" },
    ] as any,
  },
  {
    id: "sepidar",
    label: "لندینگ نرم‌افزار سپیدار",
    icon: Package,
    description: "تمام محتوای صفحه /software/sepidar",
    fields: [
      { key: "hero_eyebrow", label: "عنوان کوچک هیرو" },
      { key: "hero_title", label: "تیتر اصلی" },
      { key: "hero_subtitle", label: "زیرعنوان", type: "textarea" },
      { key: "hero_badge", label: "بَج نمایندگی" },
      { key: "hero_cta1", label: "دکمه اصلی" },
      { key: "hero_cta2", label: "دکمه دوم" },
      { key: "overview_title", label: "تیتر بخش معرفی" },
      { key: "overview_body", label: "متن معرفی", type: "textarea" },
      { key: "feat1_title", label: "ویژگی ۱ — عنوان" },
      { key: "feat1_desc", label: "ویژگی ۱ — توضیح", type: "textarea" },
      { key: "feat2_title", label: "ویژگی ۲ — عنوان" },
      { key: "feat2_desc", label: "ویژگی ۲ — توضیح", type: "textarea" },
      { key: "feat3_title", label: "ویژگی ۳ — عنوان" },
      { key: "feat3_desc", label: "ویژگی ۳ — توضیح", type: "textarea" },
      { key: "feat4_title", label: "ویژگی ۴ — عنوان" },
      { key: "feat4_desc", label: "ویژگی ۴ — توضیح", type: "textarea" },
      { key: "feat5_title", label: "ویژگی ۵ — عنوان" },
      { key: "feat5_desc", label: "ویژگی ۵ — توضیح", type: "textarea" },
      { key: "feat6_title", label: "ویژگی ۶ — عنوان" },
      { key: "feat6_desc", label: "ویژگی ۶ — توضیح", type: "textarea" },
      { key: "audience_title", label: "تیتر بخش مخاطب" },
      { key: "audience1", label: "مخاطب ۱" },
      { key: "audience2", label: "مخاطب ۲" },
      { key: "audience3", label: "مخاطب ۳" },
      { key: "audience4", label: "مخاطب ۴" },
      { key: "whyus_title", label: "تیتر «چرا ما»" },
      { key: "whyus1", label: "چرا ما ۱" },
      { key: "whyus2", label: "چرا ما ۲" },
      { key: "whyus3", label: "چرا ما ۳" },
      { key: "whyus4", label: "چرا ما ۴" },
      { key: "whyus5", label: "چرا ما ۵" },
      { key: "whyus6", label: "چرا ما ۶" },
      { key: "cta_title", label: "تیتر CTA نهایی" },
      { key: "cta_subtitle", label: "زیرعنوان CTA", type: "textarea" },
      { key: "cta_button", label: "متن دکمه CTA" },
    ],
  },
  {
    id: "dasht",
    label: "لندینگ نرم‌افزار دشت",
    icon: Package,
    description: "تمام محتوای صفحه /software/dasht",
    fields: [
      { key: "hero_eyebrow", label: "عنوان کوچک هیرو" },
      { key: "hero_title", label: "تیتر اصلی" },
      { key: "hero_subtitle", label: "زیرعنوان", type: "textarea" },
      { key: "hero_badge", label: "بَج نمایندگی" },
      { key: "hero_cta1", label: "دکمه اصلی" },
      { key: "hero_cta2", label: "دکمه دوم" },
      { key: "overview_title", label: "تیتر بخش معرفی" },
      { key: "overview_body", label: "متن معرفی", type: "textarea" },
      { key: "feat1_title", label: "ویژگی ۱ — عنوان" },
      { key: "feat1_desc", label: "ویژگی ۱ — توضیح", type: "textarea" },
      { key: "feat2_title", label: "ویژگی ۲ — عنوان" },
      { key: "feat2_desc", label: "ویژگی ۲ — توضیح", type: "textarea" },
      { key: "feat3_title", label: "ویژگی ۳ — عنوان" },
      { key: "feat3_desc", label: "ویژگی ۳ — توضیح", type: "textarea" },
      { key: "feat4_title", label: "ویژگی ۴ — عنوان" },
      { key: "feat4_desc", label: "ویژگی ۴ — توضیح", type: "textarea" },
      { key: "feat5_title", label: "ویژگی ۵ — عنوان" },
      { key: "feat5_desc", label: "ویژگی ۵ — توضیح", type: "textarea" },
      { key: "feat6_title", label: "ویژگی ۶ — عنوان" },
      { key: "feat6_desc", label: "ویژگی ۶ — توضیح", type: "textarea" },
      { key: "audience_title", label: "تیتر بخش مخاطب" },
      { key: "audience1", label: "مخاطب ۱" },
      { key: "audience2", label: "مخاطب ۲" },
      { key: "audience3", label: "مخاطب ۳" },
      { key: "audience4", label: "مخاطب ۴" },
      { key: "whyus_title", label: "تیتر «چرا ما»" },
      { key: "whyus1", label: "چرا ما ۱" },
      { key: "whyus2", label: "چرا ما ۲" },
      { key: "whyus3", label: "چرا ما ۳" },
      { key: "whyus4", label: "چرا ما ۴" },
      { key: "whyus5", label: "چرا ما ۵" },
      { key: "whyus6", label: "چرا ما ۶" },
      { key: "cta_title", label: "تیتر CTA نهایی" },
      { key: "cta_subtitle", label: "زیرعنوان CTA", type: "textarea" },
      { key: "cta_button", label: "متن دکمه CTA" },
    ],
  },
];

// Map each catalog group to a landing-block section (default = group id).
function groupSection(group: GroupDef): string {
  // For the "titles" group, fields have explicit `section` overrides.
  // For others, the section equals the group id (hero, stats, about, sepidar, dasht).
  // Note: hero-dashboard and hero-cards both use section "hero".
  if (group.id === "hero-dashboard" || group.id === "hero-cards") return "hero";
  return group.id;
}

export default function CMSPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState(CATALOG[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api<{ items: { id: string; section: string; key: string; value: string }[] }>("/api/admin/landing").then((r) => {
      if (r.ok && r.data) {
        const map: Record<string, string> = {};
        for (const it of r.data.items) map[`${it.section}.${it.key}`] = it.value;
        setValues(map);
        setOriginal(map);
      }
      setLoading(false);
    });
  }, []);

  const activeCatalog = CATALOG.find((g) => g.id === activeGroup)!;
  const filteredFields = useMemo(() => {
    if (!search.trim()) return activeCatalog.fields;
    const q = search.trim();
    return activeCatalog.fields.filter((f) => f.label.includes(q) || f.key.includes(q));
  }, [activeCatalog, search]);

  // dirty check — fields changed since last save/load
  const dirtyCount = useMemo(() => {
    const section = groupSection(activeCatalog);
    return activeCatalog.fields.filter((f) => {
      const k = `${section}.${f.key}`;
      return (values[k] || "") !== (original[k] || "");
    }).length;
  }, [activeCatalog, values, original]);

  const setField = (section: string, key: string, value: string) => {
    setValues((v) => ({ ...v, [`${section}.${key}`]: value }));
  };

  const saveGroup = async () => {
    const section = groupSection(activeCatalog);
    const items = activeCatalog.fields.map((f) => ({
      section,
      key: f.key,
      value: values[`${section}.${f.key}`] || "",
    }));
    setSaving(true);
    const r = await api("/api/admin/landing", { method: "PUT", body: JSON.stringify({ items }) });
    setSaving(false);
    if (r.ok) {
      toast.success("محتوای این بخش ذخیره شد.");
      // update original so dirtyCount resets
      setOriginal((o) => {
        const next = { ...o };
        for (const f of activeCatalog.fields) next[`${section}.${f.key}`] = values[`${section}.${f.key}`] || "";
        return next;
      });
    } else toast.error(r.error || "خطا در ذخیره.");
  };

  const resetGroup = () => {
    const section = groupSection(activeCatalog);
    setValues((v) => {
      const next = { ...v };
      for (const f of activeCatalog.fields) next[`${section}.${f.key}`] = original[`${section}.${f.key}`] || "";
      return next;
    });
    toast.info("تغییرات این بخش بازگردانده شد.");
  };

  if (loading) {
    return <div className="grid place-items-center h-64 text-muted-foreground text-sm flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /> در حال بارگذاری...</div>;
  }

  const section = groupSection(activeCatalog);

  return (
    <div>
      <PageHeader
        title="مدیریت محتوای لندینگ‌ها"
        desc="ویرایش کامل و دقیق تمام متون صفحات سایت — هر بخش قابل ویرایش به‌صورت دسته‌بندی‌شده"
        action={
          <div className="flex items-center gap-2">
            {dirtyCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                {dirtyCount.toLocaleString("fa-IR")} تغییر ذخیره‌نشده
              </span>
            )}
            <Button onClick={saveGroup} disabled={saving || dirtyCount === 0} className="bg-gradient-brand text-white shadow-glow rounded-xl gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "در حال ذخیره..." : "ذخیره این بخش"}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Group tabs / sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto scrollbar-thin pb-2 lg:pb-0">
            {CATALOG.map((g) => {
              const active = activeGroup === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-right transition-all flex-shrink-0 lg:w-full",
                    active
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "border border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <g.icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-white" : "text-primary")} />
                  <div className="min-w-0">
                    <div className="text-sm font-bold whitespace-nowrap">{g.label}</div>
                    <div className={cn("text-[10px] mt-0.5 line-clamp-1", active ? "text-white/80" : "text-muted-foreground/70")}>{g.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 min-w-0">
          <AdminCard className="!p-0 overflow-hidden">
            {/* group header */}
            <div className="p-5 border-b border-border bg-card/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-11 w-11 rounded-2xl bg-gradient-brand text-white shadow-glow">
                  <activeCatalog.icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-extrabold text-foreground">{activeCatalog.label}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeCatalog.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dirtyCount > 0 && (
                  <Button variant="outline" size="sm" onClick={resetGroup} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    بازگردانی
                  </Button>
                )}
                <a
                  href={section === "hero" || section === "stats" || section === "about" || section === "why" || section === "process" || section === "cta" ? "/" : section === "sepidar" ? "/software/sepidar" : section === "dasht" ? "/software/dasht" : "/"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-primary/5 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" /> مشاهده
                </a>
              </div>
            </div>

            {/* search */}
            <div className="p-4 border-b border-border/60">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در فیلدهای این بخش..."
                  className="w-full rounded-xl border border-border bg-background/60 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* fields */}
            <div className="p-5 space-y-4">
              {filteredFields.length === 0 ? (
                <EmptyState icon={Search} title="فیلدی یافت نشد" desc="عبارت دیگری را جستجو کنید." />
              ) : (
                filteredFields.map((f) => {
                  const fSection = (f as any).section || section;
                  const k = `${fSection}.${f.key}`;
                  return (
                    <div key={f.key} className="grid sm:grid-cols-12 gap-3 items-start">
                      <div className="sm:col-span-4">
                        <label className="text-sm font-bold text-foreground block">{f.label}</label>
                        {f.hint && <p className="text-xs text-muted-foreground mt-1">{f.hint}</p>}
                        <code className="text-[10px] text-muted-foreground/60 block mt-1" dir="ltr">{f.key}</code>
                      </div>
                      <div className="sm:col-span-8">
                        {f.type === "textarea" ? (
                          <textarea
                            value={values[k] || ""}
                            onChange={(e) => setField(fSection, f.key, e.target.value)}
                            rows={3}
                            dir={f.ltr ? "ltr" : "rtl"}
                            className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
                          />
                        ) : (
                          <input
                            value={values[k] || ""}
                            onChange={(e) => setField(fSection, f.key, e.target.value)}
                            dir={f.ltr ? "ltr" : "rtl"}
                            className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* sticky bottom save bar */}
            <div className="sticky bottom-0 p-4 border-t border-border bg-background/80 backdrop-blur-md flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {filteredFields.length.toLocaleString("fa-IR")} فیلد در این بخش
                {dirtyCount > 0 && <span className="text-amber-600 dark:text-amber-400 font-bold mr-2">• {dirtyCount.toLocaleString("fa-IR")} تغییر ذخیره‌نشده</span>}
              </div>
              <div className="flex items-center gap-2">
                {dirtyCount > 0 && (
                  <Button variant="outline" size="sm" onClick={resetGroup} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" /> بازگردانی
                  </Button>
                )}
                <Button onClick={saveGroup} disabled={saving || dirtyCount === 0} size="sm" className="bg-gradient-brand text-white shadow-glow gap-1.5">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "ذخیره..." : "ذخیره"}
                </Button>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
