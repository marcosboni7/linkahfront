import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. LIBERAÇÃO TOTAL
  // Não importa a rota, ele vai deixar passar. 
  // Isso elimina o middleware como culpado pelo redirecionamento.
  const response = NextResponse.next();

  // 2. TENTAR LIMPAR O CACHE DE REDIRECT DA VERCEL
  // Esses headers dizem ao navegador para não guardar cache desta resposta
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  
  return response;
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