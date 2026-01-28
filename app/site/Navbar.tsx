// components/site/Navbar.tsx
import Link from 'next/link';
import { Search, User, PlusCircle } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-[#0B0121] border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-8 flex-1">
        {/* Logo */}
        <Link href="/" className="text-white text-2xl font-black tracking-tighter italic">
          buyticket<span className="text-pink-500">.</span>
        </Link>

        {/* Barra de Pesquisa Centralizada */}
        <div className="hidden md:flex flex-1 max-w-md relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar eventos" 
            className="w-full bg-white rounded-lg py-2.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/auth/login" className="text-white text-sm font-bold flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-all">
          <User size={18} /> Entrar
        </Link>
        <Link href="/dashboard/eventos/novo" className="bg-[#6336FF] text-white text-sm font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-[#5229E0] transition-all shadow-lg shadow-purple-500/20">
          <PlusCircle size={18} /> Anunciar
        </Link>
      </div>
    </nav>
  );
}