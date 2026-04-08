'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Verifica se a página atual é a de login
  const isLoginPage = pathname === '/admin/login';

  // Se for login, renderiza o conteúdo limpo, sem Sidebar e sem o fundo cinza
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Caso contrário, renderiza o Dashboard completo
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      {/* Sidebar única e fixa */}
      <Sidebar /> 
      
      {/* Área de conteúdo que muda conforme a página */}
      <main className="flex-1 bg-[#F4F5F7] rounded-tl-[3.5rem] my-2 ml-2 overflow-y-auto text-slate-900 shadow-2xl">
        {children}
      </main>
    </div>
  );
}