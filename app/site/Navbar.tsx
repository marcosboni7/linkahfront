'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Verifique se os ícones estão instalados: npm install lucide-react
import { User, MapPin, Ticket, LogOut, X, Calendar, Hash, Loader2, MessagesSquare } from 'lucide-react';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; email?: string; role?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('@Linkah:User');
    if (savedUser && savedUser !== "undefined") {
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
      console.error(err);
    } finally {
      setBuscandoTickets(false);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-900 text-2xl font-black tracking-tighter italic hover:opacity-80">
            LINKAH<span className="text-[#d6006d]">.</span>
          </Link>
          <Link href="/comunidades" className="flex items-center gap-2 bg-[#d6006d]/5 border border-[#d6006d]/10 px-4 py-2.5 rounded-2xl">
            <MessagesSquare size={16} className="text-[#d6006d]" />
            <span className="text-[10px] font-black uppercase text-[#d6006d]">Nossa Comunidade</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {usuario ? (
            <div className="flex items-center gap-3">
              <button onClick={carregarMeusIngressos} className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                <Ticket size={14} className="text-[#d6006d]" /> Ingressos
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#d6006d] flex items-center justify-center text-[10px] text-white font-bold">
                  {usuario.nome?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-700 hidden md:block">{usuario.nome?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-slate-300 hover:text-red-500 ml-2">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/site/login" className="text-slate-900 text-[10px] font-black uppercase border border-slate-100 px-5 py-3.5 rounded-2xl flex items-center gap-2">
              <User size={18} className="text-[#d6006d]" /> Entrar
            </Link>
          )}
        </div>
      </nav>

      {/* Modal Simplificado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8">
             <div className="flex justify-between mb-4">
                <h2 className="font-black uppercase">Meus Ingressos</h2>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
             </div>
             {buscandoTickets ? <Loader2 className="animate-spin mx-auto" /> : 
                meusIngressos.map(t => <div key={t.id} className="p-4 border mb-2 rounded-xl">{t.evento}</div>)
             }
          </div>
        </div>
      )}
    </>
  );
}