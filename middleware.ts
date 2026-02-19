import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. LIBERA A HOME: Permite que qualquer um veja a página inicial
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. LIBERA O STAFF: Ignora travas de login para a pasta staff (como combinamos)
  if (pathname.startsWith('/staff')) {
    return NextResponse.next();
  }

  // 3. LIBERA AUTH: Permite acessar login e registro
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Se você quiser proteger outras rotas futuras, a lógica viria aqui.
  // Por enquanto, vamos deixar passar tudo para você não ter mais bloqueios.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};