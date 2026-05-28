"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sileo";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <NuqsAdapter>
        <Toaster position="top-right" theme="dark" />
        {children}
      </NuqsAdapter>
    </ThemeProvider>
  );
}
