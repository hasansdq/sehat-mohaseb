"use client";

import { useEffect } from "react";
import { api } from "@/lib/api-client";

// Fetches brand colors + site logo from the admin settings API and injects
// them as CSS variable overrides (colors) + dynamic favicon/logo (favicon
// link tags in <head>). This lets the admin change the site's color scheme
// AND logo from the settings panel without redeploying.
export function BrandThemeInjector() {
  useEffect(() => {
    const refresh = () => api<{ settings: Record<string, string> }>("/api/public/site", { cache: "no-store" }).then((r) => {
      if (!r.ok || !r.data?.settings) return;
      const s = r.data.settings;
      const brand = s["site.brandColor"];
      const accent = s["site.accentColor"];
      const logoUrl = s["site.logoUrl"] || "/favicon.svg";

      const root = document.documentElement;

      // ===== 1. Brand color overrides =====
      if (brand || accent) {
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
      }

      // ===== 2. Favicon injection (uses uploaded logo, if present) =====
      // We update (or create) <link rel="icon"> tags so the browser tab
      // shows the admin-uploaded logo. We use a key attribute to identify
      // our injected links and avoid duplicates on re-renders.
      if (logoUrl) {
        const KEY = "data-sm-favicon";
        // remove any previously-injected favicon links
        document.querySelectorAll(`link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]`).forEach((el) => el.remove());
        // build the absolute URL (favicon needs an absolute URL)
        let abs = logoUrl;
        if (logoUrl.startsWith("/")) {
          abs = window.location.origin + logoUrl;
        }
        // Standard icon (32x32 fallback)
        const ico = document.createElement("link");
        ico.setAttribute("rel", "icon");
        // Let the browser use the actual image MIME type (PNG/JPEG/WebP/SVG).
        ico.setAttribute("href", abs);
        ico.setAttribute(KEY, "1");
        document.head.appendChild(ico);
        // Apple touch icon (higher-res for iOS)
        const apple = document.createElement("link");
        apple.setAttribute("rel", "apple-touch-icon");
        apple.setAttribute("href", abs);
        apple.setAttribute(KEY, "1");
        document.head.appendChild(apple);
        // msapplication TileColor — keep as-is from layout viewport
      }
    });
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
  return null;
}

