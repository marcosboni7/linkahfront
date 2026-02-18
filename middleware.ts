import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PERMITIR: Se a URL começar com /staff, ignora qualquer trava e deixa passar
  if (pathname.startsWith('/staff')) {
    return NextResponse.next();
  }

  // 2. PROTEÇÃO (Opcional): Se você quiser que o resto do site continue 
  // mandando para /auth/login caso não esteja logado, a lógica ficaria aqui.
  // Por enquanto, vamos apenas liberar o staff para você parar de levar 404.
  
  return NextResponse.next();
}

// O Config define em quais páginas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do navegador)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};