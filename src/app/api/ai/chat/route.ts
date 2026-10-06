import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, getAuthContext } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { buildSystemPrompt, runChat, parseActions, type AIMessage } from "@/lib/ai";
import { rateLimit, rlKey, reqIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const settings = await getSettings(["ai.enabled"]);
    if (settings["ai.enabled"] !== "true") return fail("دستیار هوش مصنوعی موقتاً غیرفعال است.", 503);

    // ---- Rate limit: 30 chat messages per IP per 10 minutes ----
    const ip = reqIp(req);
    const rl = rateLimit({ key: rlKey(ip, "ai:chat"), maxRequests: 30, windowMs: 10 * 60 * 1000 });
    if (!rl.allowed) {
      const mins = Math.ceil((rl.resetAt - Date.now()) / 60000);
      return fail(`تلاش‌های مکرر. ${mins} دقیقه بعد تلاش کنید.`, 429);
    }

    const body = await req.json().catch(() => ({}));
    const message = (body.message ?? "").toString().trim();
    if (!message) return fail("پیام خالی است.", 422);
    if (message.length > 2000) return fail("پیام خیلی طولانی است.", 422);

    const ctx = await getAuthContext(req);
    const guestId = (body.guestId ?? "").toString();
    const conversationId = (body.conversationId ?? "").toString();

    // load or create conversation
    let conversation = conversationId
      ? await db.aiConversation.findUnique({ where: { id: conversationId } })
      : null;

    // ---- Ownership check (strict): if conversation exists, the requesting
    // party MUST be the owner. No cross-access allowed:
    //   - Logged-in user → conversation.userId must match exactly
    //   - Guest → conversation must be a guest conversation AND conversation.guestId
    //     must be non-null and match the requester's guestId
    // This blocks: logged-in users continuing guest conversations, guests
    // hijacking conversations with null guestId, and any IDOR.
    if (conversation) {
      if (ctx.user) {
        if (conversation.userId !== ctx.user.id) {
          return fail("این گفت‌وگو متعلق به شما نیست.", 403);
        }
      } else {
        if (conversation.userId) {
          return fail("این گفت‌وگو متعلق به کاربر دیگری است.", 403);
        }
        if (!conversation.guestId || conversation.guestId !== guestId) {
          return fail("این گفت‌وگو متعلق به شما نیست.", 403);
        }
      }
    }

    if (!conversation) {
      conversation = await db.aiConversation.create({
        data: {
          userId: ctx.user?.id ?? null,
          guestId: ctx.user ? null : (guestId || null),
          title: message.slice(0, 60),
        },
      });
    }

    // save user message
    await db.aiMessage.create({
      data: {
        conversationId: conversation.id,
        userId: ctx.user?.id ?? null,
        role: "user",
        content: message,
      },
    });

    // build history (last 12 messages + system prompt)
    const dbMessages = await db.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: { role: true, content: true },
    });
    const systemPrompt = await buildSystemPrompt();
    const history: AIMessage[] = [
      { role: "system" as any, content: systemPrompt },
      ...dbMessages.reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    let aiText: string;
    try {
      aiText = await runChat(history);
    } catch (e: any) {
      aiText = "در حال حاضر ارتباط با هوش مصنوعی با مشکل مواجه است. لطفاً چند لحظه بعد تلاش کنید یا با کارشناسان ما تماس بگیرید.";
    }

    const { content, actions } = parseActions(aiText);

    await db.aiMessage.create({
      data: {
        conversationId: conversation.id,
        userId: ctx.user?.id ?? null,
        role: "assistant",
        content,
        meta: actions.length ? JSON.stringify({ actions }) : null,
      },
    });

    return ok({ conversationId: conversation.id, message: content, actions });
  } catch (e: any) {
    return fail("خطا در پردازش پیام.", 500, { detail: e?.message });
  }
}
