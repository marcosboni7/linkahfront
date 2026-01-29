'use client';

import Link from 'next/link';
import { User, PlusCircle, HelpCircle, Ticket, MapPin } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      
      {/* LADO ESQUERDO: LOGO E LOCALIZAÇÃO */}
      <div className="flex items-center gap-10">
        <Link href="/" className="text-slate-900 text-2xl font-black tracking-tighter italic">
          LINKAH<span className="text-[#ff0082]">.</span>
        </Link>

        {/* Localização Sutil (Estilo Marketplace) */}
        <button className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-[#ff0082] transition-colors">
          <MapPin size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Brasil</span>
        </button>
      </div>

      {/* LADO DIREITO: LINKS E AÇÕES */}
      <div className="flex items-center gap-2">
        
        {/* Link de Ajuda */}
        <Link href="/ajuda" className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all">
          <HelpCircle size={18} /> Ajuda
        </Link>

        {/* Meus Ingressos (Aumenta retenção) */}
        <Link href="/meus-ingressos" className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all">
          <Ticket size={18} /> Meus Ingressos
        </Link>

        <div className="h-6 w-px bg-slate-100 mx-2 hidden sm:block" />

        {/* Login */}
        <Link href="/auth/login" className="text-slate-900 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all">
          <User size={18} className="text-[#ff0082]" /> Entrar
        </Link>

        {/* Botão de Destaque (Anunciar) */}
        <Link 
          href="/dashboard/eventos/novo" 
          className="bg-[#ff0082] text-white text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 px-6 py-3 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#ff0082]/20 active:scale-95 ml-2"
        >
          <PlusCircle size={16} /> Criar Evento
        </Link>
      </div>
    </nav>
  );
}