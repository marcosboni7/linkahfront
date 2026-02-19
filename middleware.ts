import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. FORÇA A LIBERAÇÃO DA HOME E ARQUIVOS ESTÁTICOS
  if (pathname === '/' || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. LIBERA O RESTANTE (DASHBOARD, STAFF, AUTH)
  const rotasLivres = ['/dashboard', '/staff', '/auth', '/vitrine'];
  const isRotaLivre = rotasLivres.some(rota => pathname.startsWith(rota));

  if (isRotaLivre) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Pega tudo exceto o que for estático ou API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};