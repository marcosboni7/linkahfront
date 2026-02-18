'use client';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col p-6 fixed h-full">
        <h2 className="text-2xl font-black italic mb-10 text-[#ff0082]">LINKAH<span className="text-white">.</span></h2>
        
        <nav className="flex-1 space-y-2">
          <MenuLink href="/admin/control" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === '/admin/control'} />
          <MenuLink href="/admin/eventos" icon={<Calendar size={20} />} label="Eventos" active={pathname === '/admin/eventos'} />
          <MenuLink href="/admin/salas" icon={<Users size={20} />} label="Salas" active={pathname === '/admin/salas'} />
        </nav>

        <button onClick={() => window.location.href = '/admin/login'} className="flex items-center gap-3 text-slate-400 hover:text-red-500 p-3 font-bold transition-all mt-auto">
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

function MenuLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${active ? 'bg-[#ff0082] text-white shadow-lg shadow-pink-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} {label}
    </Link>
  );
}