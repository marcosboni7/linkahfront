'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Ticket, LogOut, X, Calendar, 
  Loader2, MessagesSquare, ChevronRight,
  User, ChevronDown, MapPin
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

export function Navbar() {
  const [usuario, setUsuario] = useState<{ nome: string; email?: string; role?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);
  
  const { language, setLanguage, t, isMounted } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  // --- BUSCA USUÁRIO NO STORAGE ---
  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem('@Linkah:User');
      console.log("🔍 Navbar verificando Storage:", savedUser);

      if (savedUser) {
        try { 
          const parsed = JSON.parse(savedUser);
          if (parsed && (parsed.nome || parsed.email)) {
            console.log("✅ Usuário carregado na Navbar:", parsed.nome);
            setUsuario(parsed);
          }
        } catch (e) { 
          console.error("❌ Erro ao parsear usuário do localStorage", e); 
        }
      } else {
        console.log("ℹ️ Nenhum usuário encontrado no LocalStorage.");
        setUsuario(null);
      }
    };

    checkUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log("🚪 Realizando logout...");
    localStorage.removeItem('@Linkah:Token');
    localStorage.removeItem('@Linkah:User');
    setUsuario(null);
    window.location.href = '/';
  };

  const carregarMeusIngressos = async () => {
    if (!usuario?.email) return;
    const token = localStorage.getItem('@Linkah:Token');

    setIsModalOpen(true);
    setIsMenuOpen(false);
    setBuscandoTickets(true);

    try {
      const response = await fetch(`${API_URL}/api/pagamento/meus-ingressos?email=${usuario.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const dados = await response.json();
        setMeusIngressos(dados);
      } else {
        console.error("Erro na resposta da API:", response.status);
      }
    } catch (err) {
      console.error("Erro ao carregar ingressos:", err);
    } finally {
      setBuscandoTickets(false);
    }
  };

  // Previne erros de hidratação
  if (!isMounted) return <div className="h-16 bg-white border-b border-gray-200" />;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* ESQUERDA: LOGO */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black tracking-tighter text-blue-600">
                LINKAH
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link 
                href="/comunidades" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                <MessagesSquare size={18} strokeWidth={2} />
                {t.community || 'Comunidade'}
              </Link>
            </div>
          </div>

          {/* DIREITA: ACTIONS */}
          <div className="flex items-center gap-4">
            
            {/* SELETOR DE IDIOMA */}
            <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg mr-2">
              {['PT', 'EN'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                    language === lang 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {usuario ? (
              <div className="relative flex items-center gap-4" ref={menuRef}>
                <button 
                  onClick={carregarMeusIngressos}
                  className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  <Ticket size={18} />
                  {t.myTickets || 'Meus Ingressos'}
                </button>

                <div className="w-[1px] h-6 bg-gray-200 hidden md:block" />

                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-3 border border-gray-200 rounded-full hover:shadow-md transition-all bg-white"
                >
                  <div className="flex flex-col items-end hidden sm:block text-right">
                    <span className="text-[12px] font-bold text-gray-900 leading-none block">
                      {usuario.nome?.split(' ')[0] || 'Membro'}
                    </span>
                    <span className="text-[10px] text-blue-500 font-medium">{t.member || 'Membro'}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border border-blue-200">
                    <span className="text-white text-xs font-bold">{usuario.nome?.charAt(0).toUpperCase()}</span>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Conta</p>
                      <p className="text-xs font-bold text-gray-900 truncate mt-1">{usuario.email}</p>
                    </div>
                    
                    <div className="p-1">
                      <button 
                        onClick={carregarMeusIngressos}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <Ticket size={16} className="text-gray-400 group-hover:text-blue-600" />
                        {t.myTickets || 'Meus Ingressos'}
                      </button>
                      
                      <Link href="/perfil" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group">
                        <User size={16} className="text-gray-400 group-hover:text-blue-600" />
                        Perfil
                      </Link>
                    </div>

                    <div className="p-1 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        {t.logout || 'Sair'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
              >
                {t.login || 'Entrar'}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL DE INGRESSOS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
             {/* Conteúdo do modal omitido para brevidade, mas mantido no seu código original */}
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
               <h2 className="text-xl font-bold">Meus Ingressos</h2>
               <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
             </div>
             <div className="p-10 text-center">
                {buscandoTickets ? <Loader2 className="animate-spin mx-auto" /> : <p>Lista de ingressos aqui...</p>}
             </div>
          </div>
        </div>
      )}
      
      <div className="h-16" />
    </>
  );
}