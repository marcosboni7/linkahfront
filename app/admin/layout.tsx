'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Busca o token que você salvou no login
    const token = localStorage.getItem('admin_token');

    if (!isLoginPage && !token) {
      // Se tentar acessar qualquer coisa sem token, vai pro login
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, isLoginPage, router]);

  // Se for login, mostra direto
  if (isLoginPage) return <>{children}</>;

  // Enquanto verifica o token, não mostra nada (evita o "flash" do dashboard)
  if (!authorized) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="flex min-h-screen  text-white font-sans">
      <Sidebar /> 
      <main className="flex-1 bg-[#F4F5F7] rounded-tl-[3.5rem] my-2 ml-2 overflow-y-auto text-slate-900 shadow-2xl">
        {children}
      </main>
    </div>
  );
}