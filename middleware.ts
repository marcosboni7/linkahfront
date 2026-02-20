import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userEmail = request.cookies.get('userEmail')?.value;

  // Verificamos de onde o usuário está vindo (Referer)
  const referer = request.headers.get('referer');
  const isComingFromLogin = referer?.includes('/auth/login');

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  // LÓGICA DE EMERGÊNCIA: 
  // Se ele está indo pro Dashboard e não tem cookie, mas ACABOU de logar,
  // damos uma chance dele entrar para o Client-side assumir.
  if (isDashboardRoute && !userEmail && !isComingFromLogin) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthRoute && userEmail) {
    return NextResponse.redirect(new URL('/dashboard/eventos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public|site).*)'],
};