import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userEmail = request.cookies.get('userEmail')?.value;

  const isAuthRoute = pathname.startsWith('/auth');

  // Se o usuário já tem o cookie e tenta ir pro login, manda pro dashboard
  if (isAuthRoute && userEmail) {
    return NextResponse.redirect(new URL('/dashboard/eventos', request.url));
  }

  // Removido o bloqueio do Dashboard. Deixamos o Dashboard carregar
  // e o próprio código da página verifica se o usuário está logado.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};