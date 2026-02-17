import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Se o usuário acessar a raiz "/"
  if (request.nextUrl.pathname === '/') {
    // Redireciona ele para a página "about"
    return NextResponse.redirect(new URL('/about', request.url));
  }
}

// Configura para o middleware rodar apenas na página inicial
export const config = {
  matcher: '/',
};