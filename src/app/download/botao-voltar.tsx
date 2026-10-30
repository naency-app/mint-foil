"use client";

import { useRouter } from "next/navigation";
import { veioDeDentroDoSite } from "@/lib/navegacao-interna";

export function BotaoVoltarDownload({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (veioDeDentroDoSite()) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "#F856A7",
        fontWeight: 700,
        fontSize: 13,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ← Voltar
    </button>
  );
}
