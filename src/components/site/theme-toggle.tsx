"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? resolvedTheme : theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="تغییر تم"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="relative rounded-full border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
    >
      {mounted ? (
        current === "dark" ? (
          <Sun className="h-[1.1rem] w-[1.1rem] text-amber-400" />
        ) : (
          <Moon className="h-[1.1rem] w-[1.1rem] text-primary" />
        )
      ) : (
        <div className="h-[1.1rem] w-[1.1rem]" />
      )}
    </Button>
  );
}
