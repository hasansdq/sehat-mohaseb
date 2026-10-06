"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, Home } from "lucide-react";
import { Reveal } from "@/components/site/reveal";

type Crumb = { label: string; href?: string };

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs = [],
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative pt-32 md:pt-36 pb-12 md:pb-16 overflow-hidden">
      {/* decorative background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/6 via-background to-background" />
        <div className="absolute -top-10 right-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[100px] animate-float-slow" />
        <div className="absolute top-10 left-0 h-64 w-64 rounded-full bg-amber-400/12 blur-[100px] animate-float" />
        <div className="absolute inset-0 dot-pattern dot-grid-fade opacity-[0.4] dark:opacity-[0.6]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* breadcrumb */}
        <Reveal>
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 flex-wrap">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
              <Home className="h-3.5 w-3.5" />
              خانه
            </Link>
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/50" />
                {c.href ? (
                  <Link href={c.href} className="hover:text-primary transition-colors">{c.label}</Link>
                ) : (
                  <span className="text-foreground font-semibold">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </Reveal>

        <Reveal delay={0.06}>
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold text-primary mb-4">
              {eyebrow}
            </div>
          )}
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-foreground">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.16}>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.22}>
            <div className="mt-7">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
