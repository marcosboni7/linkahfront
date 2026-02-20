'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  User, MapPin, Ticket, LogOut, X, 
  Calendar, Hash, Loader2, MessagesSquare 
} from 'lucide-react';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; email?: string; role?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('@Linkah:User');
      if (savedUser && savedUser !== "undefined") {
        try {
          setUsuario(JSON.parse(savedUser));
        } catch (e) {
          console.error("Erro ao ler usuário do localStorage");
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@Linkah:Token');
    localStorage.removeItem('@Linkah:User');
    localStorage.removeItem('userEmail');
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUsuario(null);
    window.location.href = '/';
  };

  const carregarMeusIngressos = async () => {
    if (!usuario?.email) return;
    setIsModalOpen(true);
    setBuscandoTickets(true);

    try {
      const response = await fetch(`https://linkah-api.onrender.com/api/compras/meus-ingressos?email=${usuario.email}`);
      if (response.ok) {
        const dados = await response.json();
        setMeusIngressos(dados);
      }
    } catch (err) {
      console.error("Erro ao buscar ingressos:", err);
    } finally {
      setBuscandoTickets(false);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="text-slate-900 text-2xl font-black tracking-tighter italic hover:opacity-80 transition-opacity">
            LINKAH<span className="text-[#d6006d]">.</span>
          </Link>

          <Link 
            href="/comunidades" 
            className="group relative flex items-center gap-2 bg-[#d6006d]/5 border border-[#d6006d]/10 px-4 py-2.5 rounded-2xl hover:bg-[#d6006d] transition-all duration-500 shadow-sm"
          >
            <MessagesSquare size={16} className="text-[#d6006d] group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d6006d] group-hover:text-white">
              Comunidade
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {usuario ? (
            <div className="flex items-center gap-3">
              <button
                onClick={carregarMeusIngressos}
                className="flex items-center gap-2 text-slate-500 hover:text-[#d6006d] px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                <Ticket size={14} className="text-[#d6006d]" />
                <span className="hidden sm:inline">Meus Ingressos</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#d6006d] flex items-center justify-center text-[10px] text-white font-bold">
                  {usuario.nome?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-700 hidden md:block">
                  {usuario.nome?.split(' ')[0]}
                </span>
                <button onClick={handleLogout} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-slate-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 px-5 py-3.5 rounded-2xl transition-all border border-slate-100 shadow-sm"
            >
              <User size={18} className="text-[#d6006d]" />
              Entrar
            </Link>
          )}
        </div>
      </nav>

      {/* MODAL DE INGRESSOS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Meus Ingressos</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[400px] overflow-y-auto">
              {buscandoTickets ? (
                <div className="flex flex-col items-center py-10 gap-4">
                  <Loader2 className="animate-spin text-[#d6006d]" size={32} />
                  <p className="text-[10px] font-black uppercase text-slate-400">Buscando...</p>
                </div>
              ) : meusIngressos.length > 0 ? (
                meusIngressos.map((ticket) => (
                  <div key={ticket.id} className="bg-white border-2 border-slate-100 rounded-2xl p-5 mb-4">
                    <h4 className="font-black text-sm uppercase text-slate-900">{ticket.evento}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{ticket.data}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs font-bold uppercase text-slate-400">Nenhum ingresso encontrado</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}