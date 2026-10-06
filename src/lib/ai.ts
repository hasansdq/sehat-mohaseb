import "server-only";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export type AIMessage = { role: "user" | "assistant"; content: string };

// Build the final system prompt (admin base + dynamic context + behavior rules)
export async function buildSystemPrompt(): Promise<string> {
  const settings = await getSettings([
    "site.title", "site.tagline", "contact.phone", "contact.email",
    "ai.systemPrompt", "ai.enablePackageBuilder", "ai.enableConsultation",
  ]);

  const [services, packages] = await Promise.all([
    db.service.findMany({ orderBy: { order: "asc" }, select: { title: true, shortDesc: true, priceLabel: true } }),
    db.businessPackage.findMany({ orderBy: { order: "asc" }, select: { name: true, software: true, category: true, shortDesc: true, price: true, popular: true } }),
  ]);

  const base = settings["ai.systemPrompt"] || "تو دستیار هوشمند موسسه صحت محاسب هستی.";
  const institute = settings["site.title"] || "موسسه حسابداری صحت محاسب";
  const tagline = settings["site.tagline"] || "";
  const phone = settings["contact.phone"] || "";
  const email = settings["contact.email"] || "";

  const servicesText = services.map((s) => `- ${s.title}${s.priceLabel ? ` (${s.priceLabel})` : ""}: ${s.shortDesc ?? ""}`).join("\n");
  const packagesText = packages
    .map((p) => `- ${p.name}${p.popular ? " (پرفروش‌ترین)" : ""}${p.software ? ` | ${p.software}` : ""}${p.price ? ` | قیمت: ${p.price.toLocaleString("fa-IR")} تومان` : ""}: ${p.shortDesc ?? ""}`)
    .join("\n");

  const finalPrompt = `${base}

# درباره موسسه
نام موسسه: ${institute}
شعار: ${tagline}
تلفن تماس: ${phone}
ایمیل: ${email}

# خدمات موسسه
${servicesText}

# بسته‌های کسب‌وکار موجود
${packagesText}

# دستورالعمل‌های رفتاری (حیاتی)
۱. همیشه به زبان فارسی روان و با لحن دوستانه، حرفه‌ای و قابل اعتماد پاسخ بده. خودت را «صحت» معرفی کن.
۲. همیشه به دنبال بهترین و اجرایی‌ترین راهکار باش؛ از پاسخ‌های کلیشه‌ای و طولانی پرهیز کن و توصیه‌های مشخص، عملیاتی و گام‌به‌گام بده.
۳. اگر کاربر درباره خدمات یا نرم‌افزارها سوال کرد، از اطلاعات بالا استفاده کن و در صورت نبود اطلاعات دقیق، پیشنهاد مشاوره بده.
۴. پاسخ‌ها را کوتاه، ساختاریافته و خوانا نگه دار (از بولت‌پوینت و عنوان استفاده کن). از ایموجی به‌جای زیاده‌روی استفاده نکن؛ نهایتاً یکی دو ایموجی مرتبط.
۵. به هیچ‌وجه اطلاعات غلط یا قیمت دقیق نسخه‌های نرم‌افزار را جا نزن؛ اگر مطمئن نیستی بگو «برای قیمت دقیق با کارشناسان ما تماس بگیرید: ${phone}».
۶. اگر کاربر درخواست پک اختصاصی کرد (عباراتی مثل «پک اختصاصی»، «پیشنهاد پک»، «بسته مناسب من»، «کدام پک»): یک فرم مفهومی با پرسش‌های زیر طی چند پیام جمع‌آوری کن:
   - نوع کسب‌وکار (خدماتی/تولیدی/تجاری/فروشگاهی)
   - تعداد کارکنان
   - حجم تراکنش ماهانه (تقریبی)
   - نیازمندی‌ها (نرم‌افزار/آموزش/مالیات/حقوق و دستمزد)
   - بودجه تقریبی
   بعد از جمع‌آوری، یک «پیشنهاد پک» مبتنی بر خدمات/بسته‌های موجود ارائه بده و بگو برای ثبت نهایی پک، کاربر می‌تواند روی دکمه «ثبت پک اختصاصی» بزند. در پاسخ نهایی، عبارت [ACTION:custom_package] را در انتهای متن قرار بده تا سیستم دکمه را نمایش دهد.
۷. اگر کاربر درخواست مشاوره کرد یا آماده صحبت با کارشناس بود، عبارت [ACTION:consultation] را در انتهای پاسخ قرار بده تا دکمه «رزرو مشاوره» نمایش داده شود.
۸. هرگز لینک یا شماره‌ای جز اطلاعات بالا ارائه نده و هرگز اطلاعات شخصی کاربر را جویا نشو مگر در مسیر ساخت پک.
۹. اگر سوال خارج از حوزه مالی/حسابداری/مالیاتی/نرم‌افزار بود، مودبانه اعلام کن تخصصت در حوزه مالی موسسه است اما تلاش کن کمکی کنی.

# خروجی
فقط متن پاسخ را بنویس. در صورت نیاز، اکشن‌ها را دقیقاً با فرمت [ACTION:custom_package] یا [ACTION:consultation] در انتهای متن اضافه کن.`;

  return finalPrompt;
}

export async function runChat(history: AIMessage[], opts?: { temperature?: number; maxTokens?: number }): Promise<string> {
  const settings = await getSettings(["ai.model", "ai.temperature", "ai.maxTokens"]);
  const temperature = Number(opts?.temperature ?? settings["ai.temperature"] ?? 0.6);
  const maxTokens = Number(opts?.maxTokens ?? settings["ai.maxTokens"] ?? 1200);

  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    model: settings["ai.model"] || "glm-4.6",
    messages: history as any,
    thinking: { type: "disabled" },
    temperature,
    max_tokens: maxTokens,
  } as any);

  return completion.choices?.[0]?.message?.content?.trim() || "متاسفم، پاسخی دریافت نشد. لطفاً دوباره تلاش کنید.";
}

export function parseActions(text: string): { content: string; actions: string[] } {
  const actions: string[] = [];
  let content = text;
  const re = /\[ACTION:([a-z_]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    actions.push(m[1]);
  }
  content = content.replace(re, "").trim();
  return { content, actions };
}

// Extract structured package builder data from the conversation (heuristic, used to pre-fill the form)
export function extractPackageHints(history: AIMessage[]): Record<string, any> {
  const text = history.map((h) => h.content).join("\n");
  const hints: Record<string, any> = {};
  const bizMatch = text.match(/(?:کسب‌وکار|فعالیت)[^。.!]*?(خدماتی|تولیدی|تجاری|فروشگاهی|خرده‌فروشی)/);
  if (bizMatch) hints.businessType = bizMatch[1];
  const empMatch = text.match(/(?:کارمند|کارکنان|پرسنل)[^。\d]*(\d{1,3})/);
  if (empMatch) hints.employeeCount = Number(empMatch[1]);
  const txMatch = text.match(/(?:تراکنش|فاکتور)[^。\d]*(\d{1,4})/);
  if (txMatch) hints.monthlyTransactions = Number(txMatch[1]);
  if (/حقوق\s*و\s*دستمزد|تولید/.test(text)) hints.needsPayroll = true;
  if (/مالیات/.test(text)) hints.needsTax = true;
  if (/آموزش/.test(text)) hints.needsTraining = true;
  if (/نرم‌?افزار/.test(text)) hints.needsSoftware = true;
  return hints;
}
