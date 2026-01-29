'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, PlusCircle, MapPin, Ticket, LogOut } from 'lucide-react';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; role?: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao ler usuário do localStorage");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@Linkah:Token');
    localStorage.removeItem('@Linkah:User');
    setUsuario(null);
    window.location.href = '/'; 
  };

  return (
    <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/90">
      
      {/* LADO ESQUERDO */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-slate-900 text-2xl font-black tracking-tighter italic hover:opacity-80 transition-opacity">
          LINKAH<span className="text-[#d6006d]">.</span>
        </Link>
        
        <button className="hidden lg:flex items-center gap-2 text-slate-400 border border-slate-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50/50 transition-colors hover:border-[#d6006d]/20">
          <MapPin size={14} className="text-[#d6006d]" /> Brasil
        </button>
      </div>

      {/* LADO DIREITO */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* LINKS PROTEGIDOS: SÓ APARECEM SE ESTIVER LOGADO */}
        {usuario && (
          <div className="flex items-center animate-in fade-in zoom-in-95 duration-300">
            <Link 
              href="/meus-ingressos" 
              className="flex items-center gap-2 text-slate-500 hover:text-[#d6006d] px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-r border-slate-100 mr-2"
            >
              <Ticket size={14} className="text-[#d6006d]" /> 
              <span className="hidden sm:inline">Meus Ingressos</span>
            </Link>

            <Link 
              href="/dashboard/eventos/novo" 
              className="bg-[#d6006d] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-6 py-3.5 rounded-2xl hover:shadow-[0_10px_25px_rgba(214,0,109,0.3)] hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <PlusCircle size={18} />
              <span className="hidden lg:inline">Criar Evento</span>
            </Link>
          </div>
        )}

        {/* ÁREA DE PERFIL OU BOTÃO ENTRAR */}
        <div className="flex items-center gap-2 ml-2">
          {usuario ? (
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100 group cursor-default">
                  <div className="w-6 h-6 rounded-full bg-[#d6006d] flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                    {usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 hidden md:block">
                    {usuario.nome.split(' ')[0]}
                  </span>
               </div>
               <button 
                 onClick={handleLogout} 
                 className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                 title="Sair"
               >
                  <LogOut size={18} />
               </button>
            </div>
          ) : (
            <Link 
              href="/site/login" 
              className="text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 px-5 py-3.5 rounded-2xl transition-all border border-slate-100 shadow-sm"
            >
              <User size={18} className="text-[#d6006d]" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}