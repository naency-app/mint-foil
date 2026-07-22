"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState garante um QueryClient por montagem (não compartilhado entre
  // requests no SSR). Mesmos defaults do mobile (lib/query-client.ts):
  // preços mudam poucas vezes por dia — 1 min de frescor evita refetch em
  // cascata ao navegar entre páginas que pedem o mesmo dado.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <NuqsAdapter>
          <Toaster position="top-right" richColors />
          {children}
        </NuqsAdapter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
