import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get('userEmail')?.value;
  const { pathname } = request.nextUrl;
  const searchParams = request.nextUrl.searchParams;

  // =============================================================
  // 1. REGRA DA LANDING PAGE (RAIZ)
  // Se acessar "/", checamos se quer a Landing ou a página original
  // =============================================================
  if (pathname === '/') {
    // Se você acessar seu-site.com.br/?old=true, ele carrega o app/page.tsx
    if (searchParams.get('old') === 'true') {
      return NextResponse.next();
    }
    
    // Caso contrário, mostra a nova Landing Page (app/landing/page.tsx)
    return NextResponse.rewrite(new URL('/landing', request.url));
  }

  // 2. LISTA BRANCA: Rotas que NUNCA devem ser bloqueadas
  const isPublicRoute = 
    pathname.startsWith('/landing') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/site') || 
    pathname.startsWith('/evento') ||
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || 
    pathname === '/favicon.ico';

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. PROTEÇÃO DE ROTAS PRIVADAS
  const isPrivateRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/venda') || 
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/admin');

  if (!userEmail && isPrivateRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. LOGADO TENTANDO ACESSAR LOGIN/REGISTER
  if (userEmail && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};