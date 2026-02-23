'use client';

import { 
  LayoutDashboard, Users, Ticket, MessageSquare, 
  ShieldCheck, LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // Função para verificar qual link está ativo baseada na URL
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0 min-h-screen sticky top-0">
      <div className="p-8">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff4d4d]/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-black leading-none tracking-tighter">LINKAH</p>
            <p className="text-[10px] font-bold text-[#ff4d4d] tracking-[0.2em] uppercase">Staff Panel</p>
          </div>
        </div>

        {/* NAVEGAÇÃO REAL COM LINK */}
        <nav className="space-y-3">
          <SidebarItem 
            href="/admin/dashboard"
            icon={<LayoutDashboard size={20}/>} 
            label="Dashboard" 
            active={isActive('/admin/dashboard')} 
          />
          <SidebarItem 
            href="/admin/eventos"
            icon={<Ticket size={20}/>} 
            label="Eventos" 
            active={isActive('/admin/eventos')} 
          />
          <SidebarItem 
            href="/admin/usuarios"
            icon={<Users size={20}/>} 
            label="Usuários" 
            active={isActive('/admin/usuarios')} 
          />
          <SidebarItem 
            href="/admin/comunidades"
            icon={<MessageSquare size={20}/>} 
            label="Comunidades" 
            active={isActive('/admin/comunidades')} 
          />
        </nav>
      </div>
      
      {/* BOTÃO SAIR */}
      <div className="mt-auto p-8">
        <Link 
          href="/"
          className="w-full flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors font-bold text-sm px-6 py-4"
        >
          <LogOut size={20} /> Sair do Painel
        </Link>
      </div>
    </aside>
  );
}

// Componente de Item refatorado para usar Link
function SidebarItem({ icon, label, active, href }: any) {
  return (
    <Link 
      href={href}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
        active 
          ? 'bg-[#ff4d4d] text-white shadow-lg shadow-[#ff4d4d]/20' 
          : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </Link>
  );
}