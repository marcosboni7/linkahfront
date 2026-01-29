'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, PlusCircle, MapPin, Ticket, LogOut, X, Calendar, Hash, Loader2 } from 'lucide-react';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; email?: string; role?: string } | null>(null);
  
  // ESTADOS DO MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);

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

  // FUNÇÃO QUE BUSCA SÓ OS INGRESSOS DO USUÁRIO LOGADO
  const carregarMeusIngressos = async () => {
    if (!usuario?.email) return; // Segurança: se não tem email, não busca.

    setIsModalOpen(true);
    setBuscandoTickets(true);

    try {
      // Faz o fetch passando o email do usuário logado como filtro
      const response = await fetch(`https://linkah-api.onrender.com/api/compras?email=${usuario.email}`);
      
      if (response.ok) {
        const dados = await response.json();
        // A API deve retornar apenas o array de compras desse e-mail
        setMeusIngressos(dados);
      } else {
        console.error("Erro ao buscar ingressos");
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
    } finally {
      setBuscandoTickets(false);
    }
  };

  return (
    <>
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
          
          {usuario && (
            <div className="flex items-center animate-in fade-in zoom-in-95 duration-300">
              <button 
                onClick={carregarMeusIngressos}
                className="flex items-center gap-2 text-slate-500 hover:text-[#d6006d] px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-r border-slate-100 mr-2"
              >
                <Ticket size={14} className="text-[#d6006d]" /> 
                <span className="hidden sm:inline">Meus Ingressos</span>
              </button>

              <Link 
                href="/dashboard/eventos/novo" 
                className="bg-[#d6006d] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-6 py-3.5 rounded-2xl hover:shadow-[0_10px_25px_rgba(214,0,109,0.3)] hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <PlusCircle size={18} />
                <span className="hidden lg:inline">Criar Evento</span>
              </Link>
            </div>
          )}

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

      {/* MODAL DE INGRESSOS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">🎟️ Meus Ingressos</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{usuario?.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {buscandoTickets ? (
                  <div className="flex flex-col items-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#d6006d]" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buscando seus ingressos...</p>
                  </div>
                ) : meusIngressos.length > 0 ? (
                  meusIngressos.map((ticket) => (
                    <div key={ticket.id} className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-[#d6006d]/20 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-black text-sm uppercase leading-tight text-slate-900">{ticket.evento}</h4>
                          <div className="flex items-center gap-2 text-slate-400 text-[10px] mt-1 font-bold">
                            <Calendar size={12} /> {ticket.data}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          ticket.status === 'Aprovado' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-100">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-slate-300" />
                          <span className="text-xs font-mono font-bold text-slate-500">{ticket.id}</span>
                        </div>
                        <div className="text-xs font-black uppercase tracking-tighter">
                          {ticket.qtd} {ticket.qtd > 1 ? 'INGRESSOS' : 'INGRESSO'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30">
                    <Ticket size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum ingresso encontrado para este perfil</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}