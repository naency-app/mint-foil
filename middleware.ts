import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/explore",
  "/sets",
  "/card",
  // Página de download: é pra onde o /scan manda quem não tem o app, então
  // não pode exigir login — seria pedir conta pra quem só quer baixar.
  "/download",
  // /scan não existe mais na web (é exclusivo do app); continua público só
  // para o redirect de next.config levar ao /download sem passar pelo login.
  "/scan",
  "/showcase", // perfil público compartilhável — não pode exigir login
  // Páginas legais e de suporte: a App Store e a Play Console exigem que a
  // Privacy Policy URL e a Support URL abram sem autenticação. Atrás do login,
  // o revisor cai na tela de entrar e a submissão é rejeitada.
  "/privacidade",
  "/termos",
  "/suporte",
  "/privacy",
  "/terms",
  "/loja",
  // Guia de raridades é conteúdo educativo, como no app: abre sem conta
  "/raridades",
  // A própria página manda para o login quem não tem sessão, guardando o
  // destino (?volta=) — aqui o redirect perdia a query e podia virar ciclo
  "/completar-perfil",
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    // Com a query junto: "/portfolio?tab=x" voltava como "/portfolio"
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
