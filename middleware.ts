import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. LISTA BRANCA: Rotas que NUNCA devem ser bloqueadas
  const isPublicRoute = 
    pathname === '/' || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/site') || 
    pathname.startsWith('/evento') ||
    pathname.startsWith('/api/') || // Geralmente APIs internas têm sua própria trava
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // Pega favicon.ico, logo.png, etc.
    pathname === '/favicon.ico';

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. PROTEÇÃO DE ROTAS PRIVADAS
  const isPrivateRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/venda') || 
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/admin');

  if (!token && isPrivateRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    // loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. LOGADO TENTANDO ACESSAR LOGIN/REGISTER
  if (token && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};