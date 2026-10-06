"use client";

import dynamic from "next/dynamic";
import { SiteLayout } from "@/components/site/site-layout";

// Lazy-load below-the-fold sections (code-splitting): reduces initial compile
// memory and improves first-paint. Each section compiles on demand.
const Hero = dynamic(() => import("@/components/site/sections/hero").then((m) => m.Hero), { ssr: false });
const StatsSection = dynamic(() => import("@/components/site/sections/stats").then((m) => m.StatsSection), { ssr: false, loading: () => <SectionSkeleton /> });
const ServicesSection = dynamic(() => import("@/components/site/sections/services").then((m) => m.ServicesSection), { ssr: false, loading: () => <SectionSkeleton /> });
const PackagesSection = dynamic(() => import("@/components/site/sections/packages").then((m) => m.PackagesSection), { ssr: false, loading: () => <SectionSkeleton /> });
const AboutSection = dynamic(() => import("@/components/site/sections/about").then((m) => m.AboutSection), { ssr: false, loading: () => <SectionSkeleton /> });
const ProcessSection = dynamic(() => import("@/components/site/sections/process").then((m) => m.ProcessSection), { ssr: false, loading: () => <SectionSkeleton /> });
const ArticlesSection = dynamic(() => import("@/components/site/sections/articles").then((m) => m.ArticlesSection), { ssr: false, loading: () => <SectionSkeleton /> });
const TestimonialsSection = dynamic(() => import("@/components/site/sections/testimonials").then((m) => m.TestimonialsSection), { ssr: false, loading: () => <SectionSkeleton /> });
const FaqSection = dynamic(() => import("@/components/site/sections/faq").then((m) => m.FaqSection), { ssr: false, loading: () => <SectionSkeleton /> });
const ContactSection = dynamic(() => import("@/components/site/sections/contact").then((m) => m.ContactSection), { ssr: false, loading: () => <SectionSkeleton /> });

function SectionSkeleton() {
  return <div className="py-20 animate-pulse"><div className="container mx-auto px-4"><div className="h-40 rounded-2xl bg-muted/40" /></div></div>;
}

export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <StatsSection />
      <ServicesSection />
      <PackagesSection />
      <AboutSection />
      <ProcessSection />
      <ArticlesSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
    </SiteLayout>
  );
}
