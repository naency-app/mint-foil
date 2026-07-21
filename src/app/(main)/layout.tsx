import { Navbar } from "@/app/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Nav é fixed (padrão landing): o conteúdo precisa nascer abaixo dela */}
      <div className="relative pt-14 md:pt-16">{children}</div>

      <footer className="relative border-t border-border  mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-xs text-muted-foreground">
            Mint Foil © 2026 — Gerencie sua coleção de TCG com inteligência.
          </p>
        </div>
      </footer>
    </div>
  );
}
