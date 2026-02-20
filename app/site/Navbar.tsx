'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AvisoCadastro from '../eventos/AvisoCadastro';
import TabelaEventos from '../eventos/TabelaEventos';
import { UserCircle, LogOut, Settings, ChevronDown, Loader2 } from 'lucide-react';

export default function DashboardEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Produtor');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Função auxiliar para ler cookies no lado do cliente
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const checkAuth = () => {
      const userJSON = localStorage.getItem('@Linkah:User');
      const userEmailCookie = getCookie('userEmail');

      // SÓ redireciona se REALMENTE não houver nada nos dois lugares
      if (!userJSON && !userEmailCookie) {
        console.log("🚫 Autenticação não encontrada. Redirecionando...");
        router.replace('/auth/login');
        return;
      }

      try {
        if (userJSON && userJSON !== "undefined") {
          const user = JSON.parse(userJSON);
          
          // Pegando o e-mail para validar se o objeto é real
          const userEmail = user.email || (user.user && user.user.email);
          
          if (!userEmail && !userEmailCookie) {
            router.replace('/auth/login');
            return;
          }

          // Ajuste do nome para exibição
          const nomeCompleto = user.nome || (user.user && user.user.nome) || 'Produtor';
          const firstName = nomeCompleto.split(' ')[0];
          setUserName(firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase());
        }
      } catch (e) {
        console.error("Erro ao validar acesso:", e);
        router.replace('/auth/login');
        return;
      }
      
      setLoading(false);
    };

    // O "Pulo do Gato": Pequeno delay para a Vercel estabilizar os tokens no navegador
    const timer = setTimeout(checkAuth, 150);
    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    // Limpeza total para evitar resíduos de sessão
    localStorage.removeItem('@Linkah:User');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('perfil_completo');
    
    // Mata o cookie também
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    window.location.href = '/auth/login';
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F1F5F9]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#C22973]" size={40} />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Sincronizando ambiente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* NAVBAR */}
      <nav className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#C22973] tracking-tighter italic">LİNKAH</span>
          <span className="hidden md:block text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2 border-l border-slate-100 pl-4">Dashboard</span>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-2xl transition-all group"
          >
            <div className="text-right mr-1 hidden sm:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Produtor</p>
              <p className="text-xs font-bold text-slate-700">{userName}</p>
            </div>

            <div className="relative">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <UserCircle className="text-slate-400" size={28} />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute bottom-0 right-0"></div>
            </div>
            
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-3xl border border-slate-100 shadow-2xl z-20 py-2 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-black text-slate-300 uppercase">Gerenciamento</p>
                </div>
                
                <button 
                  onClick={() => router.push('/dashboard/perfil')} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Settings size={16} className="text-slate-400" /> Minha Conta
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-all border-t border-slate-50"
                >
                  <LogOut size={16} /> Sair com segurança
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-[1400px] mx-auto p-4 md:p-10 space-y-6">
        <AvisoCadastro />
        
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
           <TabelaEventos />
        </div>
      </main>
    </div>
  );
}