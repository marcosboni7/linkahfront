'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Agora verifica se a página é o login dentro da pasta staff
  const isLoginPage = pathname === '/staff/login';

  // Se for login, não mostra a sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Sidebar Lateral para o Staff */}
      <aside className="w-64 bg-slate-900 hidden md:block shrink-0">
        <div className="sticky top-0 h-screen p-6 flex flex-col">
           <h2 className="text-white font-black italic text-2xl mb-10 tracking-tighter">
             LINKAH<span className="text-[#ff0082]">.</span>
             <span className="text-[10px] block not-italic font-medium text-slate-500 tracking-widest uppercase">Staff Panel</span>
           </h2>

           <nav className="flex-1 space-y-2">
              <MenuLink 
                href="/staff/painel" 
                icon={<LayoutDashboard size={18} />} 
                label="Dashboard" 
                active={pathname === '/staff/painel'} 
              />
              <MenuLink 
                href="/staff/eventos" 
                icon={<Calendar size={18} />} 
                label="Gerenciar Eventos" 
                active={pathname === '/staff/eventos'} 
              />
              <MenuLink 
                href="/staff/salas" 
                icon={<Users size={18} />} 
                label="Gerenciar Salas" 
                active={pathname === '/staff/salas'} 
              />
           </nav>

           {/* Botão de Sair */}
           <button 
             onClick={() => window.location.href = '/staff/login'}
             className="flex items-center gap-3 text-slate-500 hover:text-red-400 p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest mt-auto border border-transparent hover:border-red-900/20"
           >
             <LogOut size={18} />
             Sair
           </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

// Componente auxiliar para os links do menu ficarem bonitos
function MenuLink({ href, icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${
        active 
        ? 'bg-[#ff0082] text-white shadow-lg shadow-pink-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}