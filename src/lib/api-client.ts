"use client";

// Lightweight frontend API client with typed helpers.
export async function api<T = any>(path: string, opts?: RequestInit): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
      ...opts,
    });
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { return { ok: false, error: "پاسخ نامعتبر از سرور." }; }
    if (!res.ok || !json.ok) return { ok: false, error: json.error || "خطای ناشناخته." };
    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false, error: "ارتباط با سرور برقرار نشد." };
  }
}

export function toman(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("fa-IR");
}
