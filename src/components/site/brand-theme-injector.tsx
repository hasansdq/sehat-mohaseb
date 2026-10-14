"use client";

import { useEffect } from "react";
import { api } from "@/lib/api-client";

// Fetches brand colors from the admin settings API and injects them as CSS
// variable overrides on :root and .dark. This lets the admin change the
// site's color scheme from the settings panel without redeploying.
export function BrandThemeInjector() {
  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/public/site").then((r) => {
      if (!r.ok || !r.data?.settings) return;
      const brand = r.data.settings["site.brandColor"];
      const accent = r.data.settings["site.accentColor"];
      if (!brand && !accent) return;

      const root = document.documentElement;
      // Convert hex to oklch is complex — instead, we override the
      // --brand / --gold / --primary variables directly with hex-based
      // values by creating a <style> tag.
      const styleId = "brand-theme-override";
      let style = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        document.head.appendChild(style);
      }

      const lines: string[] = [];
      if (brand) {
        // For light mode
        lines.push(`:root { --brand: ${brand}; --brand-2: ${brand}; --primary: ${brand}; --ring: ${brand}; --sidebar-primary: ${brand}; --sidebar-ring: ${brand}; }`);
        // For dark mode — slightly lighten for visibility
        lines.push(`.dark { --brand: ${brand}; --brand-2: ${brand}; --primary: ${brand}; --ring: ${brand}; --sidebar-primary: ${brand}; --sidebar-ring: ${brand}; }`);
      }
      if (accent) {
        lines.push(`:root { --gold: ${accent}; --accent: ${accent}; }`);
        lines.push(`.dark { --gold: ${accent}; --accent: ${accent}; }`);
      }
      style.textContent = lines.join("\n");
    });
  }, []);
  return null;
}
