import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userEmail = request.cookies.get('userEmail')?.value;

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  // Proteção do Dashboard
  if (isDashboardRoute && !userEmail) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Se já logado, não deixa voltar pro login
  if (isAuthRoute && userEmail) {
    return NextResponse.redirect(new URL('/dashboard/eventos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public|site).*)'],
};