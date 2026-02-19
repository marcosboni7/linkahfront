import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Defina quais rotas precisam de proteção
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  // 2. Tenta pegar o e-mail ou token dos COOKIES 
  // (Middleware não lê localStorage, por isso usamos cookies como reforço)
  const userEmail = request.cookies.get('userEmail')?.value;

  // 3. LÓGICA DE REDIRECIONAMENTO:

  // Se o usuário tentar entrar no Dashboard e não tiver o cookie de email...
  if (isDashboardRoute && !userEmail) {
    // IMPORTANTE: Só redireciona se não for uma tentativa de carregamento de arquivo estático
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se o usuário JÁ ESTÁ LOGADO e tenta ir para a tela de login...
  if (isAuthRoute && userEmail) {
    // Manda direto para os eventos
    return NextResponse.redirect(new URL('/dashboard/eventos', request.url));
  }

  return NextResponse.next();
}

// 4. Configuração de quais páginas o Middleware deve vigiar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (pasta pública)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};