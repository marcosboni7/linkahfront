'use client';

import Link from 'next/link';
import { User, PlusCircle, HelpCircle, Ticket, MapPin } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-slate-900 text-2xl font-black tracking-tighter italic">
          LINKAH<span className="text-[#ff0082]">.</span>
        </Link>
        <button className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-[#ff0082] transition-colors border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <MapPin size={14} className="text-[#ff0082]" /> Brasil
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/ajuda" className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest">
          Ajuda
        </Link>
        <Link href="/meus-ingressos" className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest">
          Meus Ingressos
        </Link>
        <Link href="/auth/login" className="text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all">
          <User size={18} className="text-[#ff0082]" /> Entrar
        </Link>
        <Link 
          href="/dashboard/eventos/novo" 
          className="bg-gradient-to-r from-[#ff0082] to-[#d6006d] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
        >
          <PlusCircle size={16} /> Criar Evento
        </Link>
      </div>
    </nav>
  );
}