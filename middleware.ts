import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vamos apenas deixar passar tudo para matar o loop.
  // O redirecionamento só vai acontecer se o cara já estiver logado e tentar ir pro login.
  const userEmail = request.cookies.get('userEmail')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/auth') && userEmail) {
    return NextResponse.redirect(new URL('/dashboard/eventos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};