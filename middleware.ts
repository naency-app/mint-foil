import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/explore", "/sets", "/card", "/scan"];

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
