import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. LIBERA A HOME
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. LIBERA DASHBOARD (Nova rota padrão do produtor)
  // Agora o middleware entende que a rota /dashboard é permitida
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // 3. LIBERA O STAFF (Mantido para caso você ainda use algo lá)
  if (pathname.startsWith('/staff')) {
    return NextResponse.next();
  }

  // 4. LIBERA AUTH: Login e Registro
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};