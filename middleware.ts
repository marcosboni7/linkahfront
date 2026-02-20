import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Tenta pegar o cookie de e-mail
  const userEmail = request.cookies.get('userEmail')?.value;

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  // SE TENTAR ACESSAR DASHBOARD
  if (isDashboardRoute) {
    // Se não tem cookie, mas tem um cabeçalho de 'referencia' do login, deixa passar
    const referer = request.headers.get('referer') || '';
    if (!userEmail && !referer.includes('/auth/login')) {
       return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // SE JÁ ESTÁ LOGADO E TENTA IR PRO LOGIN
  if (isAuthRoute && userEmail) {
    return NextResponse.redirect(new URL('/dashboard/eventos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};