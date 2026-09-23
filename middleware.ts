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
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
