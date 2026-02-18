import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // LIBERAÇÃO: Se o link começar com /staff, ignora qualquer trava de login do site
  if (pathname.startsWith('/staff')) {
    return NextResponse.next();
  }

  // Se você tiver uma lógica que manda para /auth/login, 
  // ela não vai mais afetar a pasta staff.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas, exceto arquivos estáticos e APIs
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};