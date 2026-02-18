'use client';

import { usePathname } from 'next/navigation';
import { SidebarAdmin } from '@/components/admin/SidebarAdmin'; // Você criará este componente

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Verifica se a página atual é a de login
  const isLoginPage = pathname === '/login';

  // Se for login, renderiza apenas o formulário sem a sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Sidebar Lateral para o Staff */}
      <aside className="w-64 bg-slate-900 hidden md:block shrink-0">
        <div className="sticky top-0 h-screen p-6 flex flex-col">
           <h2 className="text-white font-black italic text-xl mb-10">LINKAH<span className="text-[#ff0082]">.</span></h2>
           {/* Aqui entram os links do menu que fizemos antes */}
           <nav className="flex-1 space-y-2">
              <a href="/dashboard" className="flex items-center gap-3 text-slate-400 hover:text-white p-3 rounded-xl transition-all font-bold text-sm">Dashboard</a>
              <a href="/eventos" className="flex items-center gap-3 text-slate-400 hover:text-white p-3 rounded-xl transition-all font-bold text-sm">Eventos</a>
              <a href="/salas" className="flex items-center gap-3 text-slate-400 hover:text-white p-3 rounded-xl transition-all font-bold text-sm">Salas</a>
           </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}