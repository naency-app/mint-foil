import Image, { type ImageProps } from "next/image";

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
