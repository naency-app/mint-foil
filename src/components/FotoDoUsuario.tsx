import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * Foto de perfil de uma pessoa (Google, Apple ou a enviada para o R2).
 *
 * Sempre sem referrer: o lh3.googleusercontent.com recusa a foto do Google
 * quando o navegador conta de qual site ela está sendo pedida, e a imagem
 * aparecia quebrada no menu, no perfil e em Completar perfil (21/10). Toda foto
 * de usuário passa por aqui para não esquecer isso em lugar nenhum.
 */
export function FotoDoUsuario(props: Omit<ImageProps, "referrerPolicy">) {
  return <Image {...props} referrerPolicy="no-referrer" />;
}

/**
 * Avatar redondo: a foto quando a pessoa tem, senão a inicial do nome (ou do
 * e-mail). Menu do avatar e menu lateral usam este, para não divergirem.
 */
export function AvatarDoUsuario({
  user,
  tamanho,
  className,
}: {
  user: { image?: string | null; name?: string | null; email?: string | null };
  tamanho: number;
  className?: string;
}) {
  const estilo = { width: tamanho, height: tamanho };
  if (user.image) {
    return (
      <FotoDoUsuario
        src={user.image}
        alt=""
        width={tamanho}
        height={tamanho}
        style={estilo}
        className={cn(
          "shrink-0 rounded-full border border-border object-cover",
          className,
        )}
      />
    );
  }
  return (
    <div
      style={estilo}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-foreground",
        className,
      )}
    >
      {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
    </div>
  );
}
