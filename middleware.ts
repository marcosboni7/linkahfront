import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get('userEmail')?.value;
  const { pathname } = request.nextUrl;

  // =============================================================
  // 1. REGRA DA LANDING PAGE (RAIZ)
  // Se o usuário acessar a Home "/", mostramos a pasta /landing
  // =============================================================
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/landing', request.url));
  }

  // 2. LISTA BRANCA: Rotas que NUNCA devem ser bloqueadas
  const isPublicRoute = 
    pathname.startsWith('/landing') || // Permite carregar os recursos da pasta landing
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
  // Se NÃO está logado e tenta acessar Dashboard ou Venda
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
  // Se já está logado, redireciona para o dashboard (ou home)
  if (userEmail && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// O Matcher garante que o middleware rode em todas as rotas relevantes
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