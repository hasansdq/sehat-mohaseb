"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminShell } from "@/components/admin/admin-shell";
import { api } from "@/lib/api-client";

export default function SehatAdLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const r = await api<{ admin: any | null }>("/api/admin/me");
    setAdmin(r.ok ? r.data?.admin : null);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-semibold">در حال بارگذاری پنل...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onSuccess={(a) => setAdmin(a)} />;
  }

  return (
    <AdminShell admin={admin} onLogout={() => { setAdmin(null); window.location.reload(); }}>
      {children}
    </AdminShell>
  );
}
