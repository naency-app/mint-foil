"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sileo";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Toaster position="top-right" theme="dark" />
      {children}
    </ThemeProvider>
  );
}
