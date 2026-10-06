import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "موسسه حسابداری صحت محاسب | نماینده رسمی نرم‌افزار سپیدار و دشت",
  description:
    "موسسه حسابداری صحت محاسب، نماینده رسمی نرم‌افزار سپیدار و دشت؛ خدمات حرفه‌ای حسابداری، مشاوره مالی و مالیاتی، آموزش و فروش نرم‌افزارهای همکاران سیستم.",
  keywords: [
    "صحت محاسب",
    "حسابداری",
    "نرم افزار سپیدار",
    "نرم افزار دشت",
    "مشاوره مالیاتی",
    "همکاران سیستم",
    "حسابداری تهران",
  ],
  authors: [{ name: "موسسه حسابداری صحت محاسب" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "موسسه حسابداری صحت محاسب",
    description: "نماینده رسمی نرم‌افزار سپیدار و دشت | مشاوره مالی و مالیاتی",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // viewport-fit=cover enables safe-area-inset on notched devices (iOS)
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10a37f" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1f1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/YekanBakhFaNum-VF.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster />
          <SonnerToaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
