'use client';

import {
  LayoutDashboard,
  Users,
  Ticket,
  MessageSquare,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen sticky top-0">
      <div className="p-8">
        {/* LOGO */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-11 h-11 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
            <ShieldCheck size={22} className="text-white" />
          </div>

          <div>
            <p className="text-lg font-semibold leading-none tracking-tight text-slate-900">
              LINKAH
            </p>
            <p className="text-[10px] font-bold text-violet-500 tracking-[0.22em] uppercase mt-1">
              Staff Panel
            </p>
          </div>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          <SidebarItem
            href="/admin/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={isActive('/admin/dashboard')}
          />

          <SidebarItem
            href="/admin/eventos"
            icon={<Ticket size={18} />}
            label="Eventos"
            active={isActive('/admin/eventos')}
          />

          <SidebarItem
            href="/admin/usuarios"
            icon={<Users size={18} />}
            label="Usuários"
            active={isActive('/admin/usuarios')}
          />

          <SidebarItem
            href="/admin/comunidades"
            icon={<MessageSquare size={18} />}
            label="Comunidades"
            active={isActive('/admin/comunidades')}
          />
        </nav>
      </div>

      {/* FOOTER */}
      <div className="mt-auto p-8 border-t border-slate-100">
        <Link
          href="/"
          className="w-full flex items-center gap-3 text-slate-400 hover:text-red-500 transition-colors font-medium text-sm px-4 py-3 rounded-2xl hover:bg-red-50"
        >
          <LogOut size={18} />
          Sair do Painel
        </Link>
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
        active
          ? 'bg-violet-50 text-violet-700 border border-violet-100 shadow-sm'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
      }`}
    >
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
          active
            ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}