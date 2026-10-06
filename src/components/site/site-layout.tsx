"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { GlobalBackground } from "@/components/site/global-background";
import { useUI } from "@/lib/ui-store";
import { api } from "@/lib/api-client";

// Lazy-load overlays (modals + chatbot) so they don't bloat the page bundle.
const AuthModal = dynamic(() => import("@/components/site/auth-modal").then((m) => m.AuthModal), { ssr: false });
const UserPanel = dynamic(() => import("@/components/site/user-panel").then((m) => m.UserPanel), { ssr: false });
const ConsultationModal = dynamic(() => import("@/components/site/consultation-modal").then((m) => m.ConsultationModal), { ssr: false });
const CustomPackageModal = dynamic(() => import("@/components/site/custom-package-modal").then((m) => m.CustomPackageModal), { ssr: false });
const ChatBot = dynamic(() => import("@/components/site/chatbot/chatbot").then((m) => m.ChatBot), { ssr: false });

// Shared layout for all inner/site pages. Provides the Navbar, sticky Footer,
// the global decorative background, and the global overlays (auth modal, user
// panel, consultation modal, custom package modal, floating chatbot) so every
// page is consistent. Pages just render their content inside SiteLayout.
export function SiteLayout({ children }: { children: ReactNode }) {
  const { setUser } = useUI();

  useEffect(() => {
    api<{ user: any | null }>("/api/auth/me").then((r) => {
      if (r.ok && r.data?.user) setUser(r.data.user);
    });
  }, [setUser]);

  return (
    // `overflow-x-clip` would force overflow-y to `clip` (per CSS spec) and
    // break vertical scroll, so we use `overflow-x-hidden` instead which
    // computes overflow-y to `auto` (scrollable). `isolate` keeps the
    // GlobalBackground (-z-10) behind content but above base bg.
    <div className="site-shell relative isolate min-h-screen flex flex-col bg-background overflow-x-hidden">
      <GlobalBackground />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      {/* Global overlays */}
      <AuthModal />
      <UserPanel />
      <ConsultationModal />
      <CustomPackageModal />
      <ChatBot />
    </div>
  );
}
