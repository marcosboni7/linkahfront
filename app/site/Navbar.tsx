'use client';

import Link from 'next/link';
import { User, PlusCircle, MapPin, Ticket, Search } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/90">
      
      {/* LADO ESQUERDO: LOGO E LOCALIZAÇÃO */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-slate-900 text-2xl font-black tracking-tighter italic hover:opacity-80 transition-opacity">
          LINKAH<span className="text-[#d6006d]">.</span>
        </Link>
        
        <button className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-[#d6006d] transition-all border border-slate-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-slate-50/50">
          <MapPin size={14} className="text-[#d6006d]" /> 
          Brasil
        </button>
      </div>

      {/* LADO DIREITO: LINKS E AÇÕES */}
      <div className="flex items-center gap-1 md:gap-4">
        
        {/* LINKS DISCRETOS (ESCONDEM NO MOBILE) */}
        <div className="hidden sm:flex items-center border-r border-slate-100 pr-4 mr-2">
          <Link href="/ajuda" className="text-slate-400 hover:text-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors">
            Ajuda
          </Link>
          <Link href="/meus-ingressos" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors">
            <Ticket size={14} /> Meus Ingressos
          </Link>
        </div>

        {/* BOTÃO ENTRAR (CLIENTE) */}
        <Link 
          href="/auth/login" 
          className="text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 px-4 py-3 rounded-2xl transition-all border border-transparent hover:border-slate-100"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white">
            <User size={16} className="text-[#d6006d]" />
          </div>
          <span className="hidden md:inline">Entrar</span>
        </Link>

        {/* BOTÃO CRIAR EVENTO (PRODUTOR) */}
        <Link 
          href="/dashboard/eventos/novo" 
          className="bg-[#d6006d] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-6 py-3.5 rounded-2xl hover:shadow-[0_10px_30px_rgba(214,0,109,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 shadow-lg shadow-pink-500/10"
        >
          <PlusCircle size={18} />
          <span className="hidden lg:inline">Criar Evento</span>
        </Link>
      </div>
    </nav>
  );
}