"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User as UserIcon, Wand2, PhoneCall, Trash2, ChevronLeft } from "lucide-react";
import { useUI } from "@/lib/ui-store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

type Msg = { id: string; role: "user" | "assistant"; content: string; actions?: string[] };

const QUICK = [
  "چه خدماتی دارید؟",
  "کدام نرم‌افزار برای من مناسب است؟",
  "هزینه حسابداری چقدر است؟",
  "می‌خواهم پک اختصاصی بسازم",
];

const GREETING = "سلام! من «صحت» هستم، دستیار مالی موسسه صحت محاسب. چطور می‌تونم در حسابداری، مالیات یا انتخاب نرم‌افزار مناسب بهت کمک کنم؟";

export function ChatBot() {
  const { chatOpen, openChat, closeChat, openPkg, openConsult, setChatPrefill, chatPrefill } = useUI();
  const [messages, setMessages] = useState<Msg[]>([{ id: "greet", role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestId] = useState(() => `g_${Math.random().toString(36).slice(2, 12)}`);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, chatOpen, loading]);

  useEffect(() => {
    if (chatOpen && chatPrefill) {
      setInput(chatPrefill);
      setChatPrefill(undefined);
    }
  }, [chatOpen, chatPrefill, setChatPrefill]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: Msg = { id: `u_${Date.now()}`, role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    const r = await api<{ conversationId: string; message: string; actions: string[] }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: content, guestId, conversationId }),
    });
    setLoading(false);
    if (r.ok && r.data) {
      setConversationId(r.data.conversationId);
      setMessages((m) => [...m, { id: `a_${Date.now()}`, role: "assistant", content: r.data!.message, actions: r.data!.actions }]);
    } else {
      setMessages((m) => [...m, { id: `a_${Date.now()}`, role: "assistant", content: "در حال حاضر ارتباط با سرور با مشکل مواجه است. لطفاً بعداً تلاش کنید." }]);
      toast.error(r.error || "خطا در ارتباط با دستیار.");
    }
  };

  const reset = () => {
    setMessages([{ id: "greet", role: "assistant", content: GREETING }]);
    setConversationId(null);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={openChat}
            className="fixed bottom-5 left-5 z-50 h-16 w-16 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow text-white pulse-ring"
            aria-label="دستیار هوش مصنوعی"
          >
            <Sparkles className="h-7 w-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-5 left-5 z-[80] w-[calc(100vw-2.5rem)] sm:w-[26rem] h-[min(36rem,calc(100vh-3rem))] flex flex-col rounded-3xl glass-strong border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* header */}
            <div className="relative p-4 bg-gradient-to-r from-primary/15 via-primary/5 to-amber-400/5 border-b border-border">
              <div className="absolute inset-0 opacity-20 animate-shimmer" />
              <div className="relative flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow">
                  <Bot className="h-6 w-6 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div className="flex-1">
                  <div className="font-display font-extrabold text-foreground flex items-center gap-1.5">صحت <Sparkles className="h-3.5 w-3.5 text-amber-400" /></div>
                  <div className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> آنلاین
                  </div>
                </div>
                <button onClick={reset} className="grid place-items-center h-9 w-9 rounded-full bg-background/60 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="شروع مجدد">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={closeChat} className="grid place-items-center h-9 w-9 rounded-full bg-background/60 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors" aria-label="بستن">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-gradient-to-b from-background/30 to-background/10">
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} onAction={(a) => {
                  if (a === "custom_package") { closeChat(); openPkg({ suggestedPlan: m.content.slice(0, 500) }); }
                  else if (a === "consultation") { closeChat(); openConsult("مشاوره از طریق دستیار هوش مصنوعی"); }
                }} />
              ))}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-brand grid place-items-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tr-sm bg-card border border-border px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                          className="h-2 w-2 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* quick chips */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <div className="p-3 border-t border-border bg-card/40">
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-brand text-white shadow-glow disabled:opacity-50 transition-all hover:-translate-y-0.5"
                  aria-label="ارسال"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-1.5 text-center text-[10px] text-muted-foreground">
                قدرت گرفته از هوش مصنوعی • صحت محاسب
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg, onAction }: { msg: Msg; onAction: (a: string) => void }) {
  const isUser = msg.role === "user";
  // basic markdown-ish rendering: **bold**, bullet lines
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={line.trim().startsWith("- ") || line.trim().startsWith("•") ? "pr-2 my-0.5" : "my-0.5"}>
          {parts.map((p, j) => p.startsWith("**") && p.endsWith("**")
            ? <strong key={j} className="font-bold text-foreground">{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
          )}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 ${isUser ? "bg-amber-400/20 text-amber-600" : "bg-gradient-brand text-white"}`}>
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? "bg-gradient-brand text-white rounded-tl-sm" : "bg-card border border-border text-foreground rounded-tr-sm"}`}>
          {renderContent(msg.content)}
        </div>
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.actions.includes("custom_package") && (
              <button
                onClick={() => onAction("custom_package")}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold text-amber-950 px-3 py-1.5 text-xs font-bold shadow-glow-gold hover:-translate-y-0.5 transition-all"
              >
                <Wand2 className="h-3.5 w-3.5" /> ساخت پک اختصاصی
              </button>
            )}
            {msg.actions.includes("consultation") && (
              <button
                onClick={() => onAction("consultation")}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand text-white px-3 py-1.5 text-xs font-bold shadow-glow hover:-translate-y-0.5 transition-all"
              >
                <PhoneCall className="h-3.5 w-3.5" /> رزرو مشاوره
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
