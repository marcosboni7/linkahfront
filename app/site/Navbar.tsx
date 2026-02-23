'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, MapPin, Ticket, LogOut, X, Calendar, Hash, Loader2, MessagesSquare, ChevronRight } from 'lucide-react';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; email?: string; role?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao ler usuário");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@Linkah:Token');
    localStorage.removeItem('@Linkah:User');
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
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 md:px-10 py-3 flex items-center justify-between sticky top-0 z-50">

        {/* LOGO & NAVEGAÇÃO ESQUERDA */}
        <div className="flex items-center gap-10">
          <Link href="/" className="text-slate-900 text-xl font-bold tracking-tight hover:opacity-70 transition-all flex items-center gap-1">
            LINKAH<span className="text-[#ff4d4d] text-2xl leading-none">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/comunidades" 
              className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <MessagesSquare size={16} className="text-slate-400 group-hover:text-[#ff4d4d] transition-colors" />
              Comunidade
            </Link>
          </div>
        </div>

        {/* LADO DIREITO (PERFIL) */}
        <div className="flex items-center gap-3">
          {usuario ? (
            <div className="flex items-center gap-2">
              <button
                onClick={carregarMeusIngressos}
                className="hidden sm:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-100"
              >
                <Ticket size={14} />
                Ingressos
              </button>

              <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block" />

              <div className="flex items-center gap-3 pl-2">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-[11px] font-bold text-slate-900 leading-none">{usuario.nome.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Membro</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-[11px] text-white font-bold hover:scale-105 transition-transform"
                >
                  {usuario.nome.charAt(0).toUpperCase()}
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/site/login"
              className="bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>

      {/* MODAL DE INGRESSOS (ESTILO SIDEBAR/LUMA) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-[#FCFBFA] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Meus Ingressos</h2>
                <p className="text-xs text-slate-400 font-medium">{usuario?.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 max-h-[450px] overflow-y-auto space-y-4">
              {buscandoTickets ? (
                <div className="flex flex-col items-center py-20 gap-3">
                  <Loader2 className="animate-spin text-slate-300" size={28} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando...</p>
                </div>
              ) : meusIngressos.length > 0 ? (
                meusIngressos.map((ticket) => (
                  <div key={ticket.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:border-[#ff4d4d]/30 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 leading-tight">{ticket.evento}</h4>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                          <Calendar size={12} /> {ticket.data}
                        </div>
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold ${
                        ticket.status === 'Aprovado' || ticket.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-orange-50 text-orange-600'
                      }`}>
                        {ticket.status === 'completed' ? 'Aprovado' : ticket.status || 'Pendente'}
                      </span>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-[10px] font-mono text-slate-300 uppercase tracking-tighter">
                        ID: {ticket.id.toString().substring(0, 8)}
                      </div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                         {ticket.qtd} {ticket.qtd > 1 ? 'lugares' : 'lugar'}
                         <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <Ticket size={40} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-sm font-medium text-slate-400 italic">Você ainda não possui ingressos.</p>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white border-t border-slate-100">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-slate-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}