import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get('userEmail')?.value;
  const { pathname } = request.nextUrl;

  // 1. LISTA BRANCA: Rotas que NUNCA devem ser bloqueadas
  // Adicionei 'public' e arquivos estáticos comuns
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
  // Se NÃO está logado e tenta acessar Dashboard ou Venda (e suas sub-rotas)
  const isPrivateRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/venda') || 
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/admin');

  if (!userEmail && isPrivateRoute) {
    // Adicionamos o ?from= para o usuário voltar de onde parou após logar
    const loginUrl = new URL('/auth/login', request.url);
    // loginUrl.searchParams.set('from', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 3. LOGADO TENTANDO ACESSAR LOGIN/REGISTER
  // Se já está logado, não faz sentido ver a tela de login
  if (userEmail && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// O Matcher é o segredo para não pesar o site
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