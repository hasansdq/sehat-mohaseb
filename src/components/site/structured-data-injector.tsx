"use client";

import { useEffect } from "react";
import { api } from "@/lib/api-client";

// Injects Organization + WebSite structured data (JSON-LD) on the homepage
// to help search engines understand the business entity. Also inserts
// BreadcrumbList where applicable. Loaded once on mount; cleaned up on unmount.
export function StructuredDataInjector() {
  useEffect(() => {
    api<{ settings: Record<string, string> }>("/api/public/site").then((r) => {
      if (!r.ok || !r.data?.settings) return;
      const s = r.data.settings;
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const org = {
        "@context": "https://schema.org",
        "@type": "AccountingService",
        name: s["site.title"] || "موسسه حسابداری صحت محاسب",
        description: s["site.description"] || "خدمات حرفه‌ای حسابداری، مشاوره مالی و مالیاتی",
        url: origin,
        logo: s["site.logoUrl"]
          ? (s["site.logoUrl"].startsWith("http")
              ? s["site.logoUrl"]
              : origin + s["site.logoUrl"])
          : origin + "/favicon.svg",
        telephone: s["contact.phone"] || "",
        email: s["contact.email"] || "",
        address: {
          "@type": "PostalAddress",
          streetAddress: s["contact.address"] || "",
          addressCountry: "IR",
        },
        areaServed: "IR",
        knowsAbout: [
          "حسابداری", "مالیات", "حسابرسی", "نرم‌افزار سپیدار",
          "نرم‌افزار دشت", "مشاوره مالی", "حقوق و دستمرد",
        ],
        sameAs: [
          s["social.instagram"] || "",
          s["social.telegram"] || "",
          s["social.linkedin"] || "",
        ].filter(Boolean),
      };

      const website = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: s["site.title"] || "موسسه حسابداری صحت محاسب",
        url: origin,
        potentialAction: {
          "@type": "SearchAction",
          target: `${origin}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      };

      const scriptId = "site-structured-data";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify([org, website]);
    });

    return () => {
      const el = document.getElementById("site-structured-data");
      if (el) el.remove();
    };
  }, []);

  return null;
}
