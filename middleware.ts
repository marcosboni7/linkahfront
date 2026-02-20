import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Tenta pegar o cookie
  const userEmail = request.cookies.get('userEmail')?.value;

  // 2. Verifica de onde o usuário está vindo
  const referer = request.headers.get('referer');
  const isComingFromLogin = referer?.includes('/auth/login');

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/auth');

  // LÓGICA DE PROTEÇÃO:
  // Se tentar acessar o Dashboard sem cookie...
  if (isDashboardRoute && !userEmail) {
    // Se ele NÃO vem da página de login, redireciona (usuário tentando entrar direto)
    if (!isComingFromLogin) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // Se ele VEM do login, deixamos o Next.js carregar a página para o 
    // LocalStorage e o Cookie Client-side assumirem o controle.
  }

  // Se já está logado e tenta ir pro Login, manda pro Dashboard
  if (isAuthRoute && userEmail) {
    return NextResponse.redirect(new URL('/dashboard/eventos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protege tudo, exceto o que não deve ser vigiado
    '/((?!api|_next/static|_next/image|favicon.ico|public|site).*)',
  ],
};