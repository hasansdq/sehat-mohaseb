import "server-only";
import { db } from "@/lib/db";

// In-memory cache for settings (fast reads, invalidated on write)
const cache = new Map<string, { value: string; ts: number }>();
const TTL = 60_000; // 60s

const DEFAULTS: Record<string, string> = {
  // general
  "site.title": "موسسه حسابداری صحت محاسب",
  "site.tagline": "نماینده رسمی نرم‌افزار سپیدار و دشت",
  "site.description": "خدمات حرفه‌ای حسابداری، مشاوره مالی و مالیاتی",
  "site.logoUrl": "/favicon.svg",
  "site.brandColor": "#10a37f",
  "site.announcement": "",
  "site.announcementActive": "false",
  // contact
  "contact.phone": "۰۲۱-۹۱۰۱۰۰۱۰",
  "contact.phone2": "۰۹۱۲-۳۴۵۶۷۸۹",
  "contact.email": "info@sehatmohaseb.ir",
  "contact.address": "تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج آرمیتا، طبه ۸، واحد ۸۰۲",
  "contact.workingHours": "شنبه تا چهارشنبه ۹ تا ۱۸، پنجشنبه ۹ تا ۱۳",
  "contact.mapEmbed": "",
  // social
  "social.instagram": "https://instagram.com/sehatmohaseb",
  "social.telegram": "https://t.me/sehatmohaseb",
  "social.bale": "https://ble.ir/sehatmohaseb",
  "social.linkedin": "",
  "social.whatsapp": "",
  "social.aparat": "",
  // ai
  "ai.enabled": "true",
  "ai.model": "glm-4.6",
  "ai.temperature": "0.6",
  "ai.maxTokens": "1200",
  "ai.systemPrompt": "تو «صحت» هستی، دستیار هوشمند موسسه حسابداری صحت محاسب. با لحنی دوستانه، حرفه‌ای و قابل اعتماد به فارسی پاسخ می‌دهی. همیشه به دنبال بهترین و اجرایی‌ترین راهکار مالی، حسابداری و مالیاتی برای مشتری هستی. اگر کاربر درخواست پک اختصاصی کرد، با پرسش سوالات کلیدی (نوع کسب‌وکار، تعداد کارکنان، حجم تراکنش ماهانه، بودجه) اطلاعات را جمع‌آوری کن و پیشنهاد پک مناسب را ارائه بده.",
  "ai.greeting": "سلام! من «صحت» هستم، دستیار مالی موسسه صحت محاسب. چطور می‌تونم در حسابداری، مالیات یا انتخاب نرم‌افزار مناسب بهت کمک کنم؟",
  "ai.enablePackageBuilder": "true",
  "ai.enableConsultation": "true",
  // security
  "security.maxLoginAttempts": "5",
  "security.lockMinutes": "15",
  "security.rateLimit": "true",
  "security.twoFactor": "false",
  // seo
  "seo.metaTitle": "موسسه حسابداری صحت محاسب | نماینده رسمی سپیدار و دشت",
  "seo.metaDescription": "نماینده رسمی نرم‌افزار سپیدار و دشت؛ خدمات حسابداری، مشاوره مالی و مالیاتی، آموزش و فروش نرم‌افزار.",
  // admin panel credentials (username/password based, separate from user mobile auth)
  "admin.username": "rayantech",
  "admin.passwordHash": "",
  "admin.displayName": "مدیر سیستم صحت محاسب",
  "admin.lastLoginAt": "",
  "admin.lastLoginIp": "",
  "admin.loginAttempts": "0",
  "admin.lockedUntil": "",
  // backup
  "backup.autoEnabled": "false",
  "backup.lastRun": "",
};

export async function getSetting(key: string): Promise<string> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) return cached.value;
  const row = await db.setting.findUnique({ where: { key } });
  const value = row?.value ?? DEFAULTS[key] ?? "";
  cache.set(key, { value, ts: Date.now() });
  return value;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const missing: string[] = [];
  for (const k of keys) {
    const c = cache.get(k);
    if (c && Date.now() - c.ts < TTL) result[k] = c.value;
    else missing.push(k);
  }
  if (missing.length) {
    const rows = await db.setting.findMany({ where: { key: { in: missing } } });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    for (const k of missing) {
      const v = map.get(k) ?? DEFAULTS[k] ?? "";
      result[k] = v;
      cache.set(k, { value: v, ts: Date.now() });
    }
  }
  return result;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany();
  const merged: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) merged[r.key] = r.value;
  return merged;
}

export async function setSetting(key: string, value: string, group = "general"): Promise<void> {
  await db.setting.upsert({
    where: { key },
    update: { value, group },
    create: { key, value, group },
  });
  cache.set(key, { value, ts: Date.now() });
}

export async function setSettings(items: Record<string, { value: string; group?: string }>): Promise<void> {
  const ops = Object.entries(items).map(([key, { value, group }]) =>
    db.setting.upsert({
      where: { key },
      update: { value, group: group ?? "general" },
      create: { key, value, group: group ?? "general" },
    })
  );
  await db.$transaction(ops);
  for (const [key, { value }] of Object.entries(items)) cache.set(key, { value, ts: Date.now() });
}

export async function getSettingsByGroup(group: string): Promise<Record<string, string>> {
  const rows = await db.setting.findMany({ where: { group } });
  const merged: Record<string, string> = {};
  for (const k of Object.keys(DEFAULTS)) {
    // crude group inference from prefix; only return matching group
    const inferred = inferGroup(k);
    if (inferred === group) merged[k] = DEFAULTS[k];
  }
  for (const r of rows) merged[r.key] = r.value;
  return merged;
}

function inferGroup(key: string): string {
  if (key.startsWith("contact.")) return "contact";
  if (key.startsWith("social.")) return "social";
  if (key.startsWith("ai.")) return "ai";
  if (key.startsWith("security.")) return "security";
  if (key.startsWith("seo.")) return "seo";
  if (key.startsWith("backup.")) return "backup";
  return "general";
}
