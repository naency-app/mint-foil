/**
 * Fonte única dos endereços do app nativo.
 *
 * Antes cada lugar (ProUpgradeModal, /download) repetia as URLs das lojas — e
 * as duas cópias estavam com o package errado (`app.mintfoil`; o de verdade é
 * `com.mintfoil.app`), o que levava a uma página de "app não encontrado".
 */

/** Bundle/package do app — o mesmo nas duas plataformas. */
export const APP_ID = "com.mintfoil.app";

/** ID do app na App Store Connect (`ascAppId` do eas.json). */
export const APP_STORE_ID = "6794972867";

export const APP_STORE_URL = `https://apps.apple.com/br/app/id${APP_STORE_ID}`;
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${APP_ID}`;
export const DOWNLOAD_URL = "https://mintfoil.com/download";

/**
 * Esquema privado do app (`expo.scheme` do app.json).
 *
 * Serve para o caso em que o Universal Link NÃO dispara: navegador in-app do
 * WhatsApp/Instagram, que abre o link dentro dele mesmo e ignora o
 * apple-app-site-association. Aí só um toque em "Abrir no app" resolve.
 *
 * Três barras de propósito: `mobileapp:///caminho` deixa o host vazio e o
 * caminho inteiro é o caminho da rota, igual ao que o `Linking.createURL` do
 * Expo gera. Com duas barras o primeiro segmento vira host.
 */
export const APP_SCHEME = "mobileapp";

export type Plataforma = "ios" | "android" | "outra";

export function detectarPlataforma(userAgent: string): Plataforma {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "outra";
}

/** Loja certa para a plataforma; no desktop, a página que mostra as duas. */
export function lojaPara(plataforma: Plataforma): string {
  if (plataforma === "ios") return APP_STORE_URL;
  if (plataforma === "android") return PLAY_STORE_URL;
  return "/download";
}

/** `mobileapp:///showcase/profile/@fulano` a partir do caminho da web. */
export function linkDeApp(caminho: string): string {
  return `${APP_SCHEME}://${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}
