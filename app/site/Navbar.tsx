'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Ticket,
  LogOut,
  X,
  Loader2,
  MessagesSquare,
  User,
  ChevronDown,
  Users,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

type Usuario = {
  nome: string;
  email?: string;
  role?: string;
};

export function Navbar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buscandoTickets, setBuscandoTickets] = useState(false);
  const [meusIngressos, setMeusIngressos] = useState<any[]>([]);

  const { language, setLanguage, t, isMounted } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem('@Linkah:User');
        const savedToken = localStorage.getItem('@Linkah:Token');
        const perfilCompleto = localStorage.getItem('perfil_completo');
        const userEmail = localStorage.getItem('userEmail');

        let usuarioEncontrado: any = null;

        if (savedUser) {
          usuarioEncontrado = JSON.parse(savedUser);
        } else if (perfilCompleto) {
          usuarioEncontrado = JSON.parse(perfilCompleto);
        }

        if (!usuarioEncontrado && userEmail) {
          usuarioEncontrado = {
            nome: userEmail.split('@')[0],
            email: userEmail,
            role: 'membro',
          };
        }

        if (usuarioEncontrado && (usuarioEncontrado.nome || usuarioEncontrado.email)) {
          const usuarioNormalizado: Usuario = {
            nome:
              usuarioEncontrado.nome ||
              usuarioEncontrado.name ||
              (usuarioEncontrado.email ? usuarioEncontrado.email.split('@')[0] : 'Membro'),
            email: usuarioEncontrado.email || userEmail || '',
            role: usuarioEncontrado.role || 'membro',
          };

          setUsuario(usuarioNormalizado);
          localStorage.setItem('@Linkah:User', JSON.stringify(usuarioNormalizado));
          return;
        }

        setUsuario(null);
      } catch (e) {
        console.error('❌ Erro ao ler/parsear usuário', e);
        setUsuario(null);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === '@Linkah:User' ||
        event.key === '@Linkah:Token' ||
        event.key === 'perfil_completo' ||
        event.key === 'userEmail'
      ) {
        checkUser();
      }
    };

    const handleFocus = () => checkUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    checkUser();
    const timeout = setTimeout(checkUser, 800);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@Linkah:Token');
    localStorage.removeItem('@Linkah:User');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('perfil_completo');
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';

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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/pagamento/meus-ingressos?email=${encodeURIComponent(usuario.email)}`,
        {
          method: 'GET',
          headers,
          credentials: 'include',
        }
      );

      if (response.ok) {
        const dados = await response.json();
        setMeusIngressos(Array.isArray(dados) ? dados : []);
      } else {
        setMeusIngressos([]);
      }
    } catch (err) {
      setMeusIngressos([]);
    } finally {
      setBuscandoTickets(false);
    }
  };

  if (!isMounted) {
    return <div className="h-16 bg-white border-b border-slate-200" />;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
                <span className="text-white text-sm font-bold tracking-tight">L</span>
              </div>

              <div className="leading-none">
                <span className="text-lg font-semibold tracking-tight text-slate-900 block">
                  LINKAH
                </span>
                <span className="text-[10px] font-bold text-violet-500 tracking-[0.22em] uppercase">
                  Live Events
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/comunidades"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-violet-700 hover:bg-violet-50 transition-all text-sm font-medium"
              >
                <MessagesSquare size={17} strokeWidth={2} />
                {t.community || 'Comunidade'}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* BOTÃO DE DESTAQUE PARA CONEXÕES */}
            {usuario && (
              <Link
                href="/matches"
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-all text-sm font-semibold shadow-sm"
              >
                <Users size={17} className="text-violet-600" />
                Conexões
              </Link>
            )}

            <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
              {['PT', 'EN'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as any)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    language === lang
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {usuario ? (
              <div className="relative flex items-center gap-3" ref={menuRef}>
                <button
                  onClick={carregarMeusIngressos}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-violet-700 hover:bg-violet-50 transition-all text-sm font-medium"
                >
                  <Ticket size={17} />
                  {t.myTickets || 'Meus Ingressos'}
                </button>

                <div className="w-px h-6 bg-slate-200 hidden md:block" />

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-3 border border-slate-200 rounded-full hover:shadow-md transition-all bg-white"
                >
                  <div className="flex flex-col items-end hidden sm:block text-right">
                    <span className="text-[12px] font-semibold text-slate-900 leading-none block">
                      {usuario.nome?.split(' ')[0] || 'Membro'}
                    </span>
                    <span className="text-[10px] text-violet-500 font-medium">
                      {t.member || 'Membro'}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center border border-violet-200 shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {usuario.nome?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${
                      isMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.18em]">
                        Conta
                      </p>
                      <p className="text-xs font-semibold text-slate-900 truncate mt-1">
                        {usuario.email}
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      {/* ATALHO PARA CONEXÕES NO MENU MOBILE/DROPDOWN */}
                      <Link
                        href="/matches"
                        className="flex sm:hidden items-center gap-3 px-3 py-2.5 text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors"
                      >
                        <Users size={16} className="text-violet-600" />
                        Conexões
                      </Link>

                      <button
                        onClick={carregarMeusIngressos}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors group"
                      >
                        <Ticket size={16} className="text-slate-400 group-hover:text-violet-600" />
                        {t.myTickets || 'Meus Ingressos'}
                      </button>

                      <Link
                        href="/dashboard/perfil"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors group"
                      >
                        <User size={16} className="text-slate-400 group-hover:text-violet-600" />
                        Perfil
                      </Link>
                    </div>

                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
                href="/site/login"
                className="bg-violet-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-violet-700 transition-all active:scale-95 shadow-sm shadow-violet-200"
              >
                {t.login || 'Entrar'}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-violet-500 font-bold mb-1">
                  Tickets
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Meus Ingressos
                </h2>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8 text-center">
              {buscandoTickets ? (
                <div className="py-6">
                  <Loader2 className="animate-spin mx-auto text-violet-600" />
                  <p className="text-sm text-slate-400 mt-4 font-medium">
                    Carregando ingressos...
                  </p>
                </div>
              ) : meusIngressos.length > 0 ? (
                <div className="space-y-3 text-left">
                  {meusIngressos.map((ingresso, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40"
                    >
                      <p className="font-semibold text-slate-900">
                        {ingresso?.evento || ingresso?.titulo || 'Ingresso'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {ingresso?.data || ingresso?.date || 'Sem data'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4 border border-violet-100">
                    <Ticket size={24} />
                  </div>
                  <p className="text-slate-500 font-medium">
                    Nenhum ingresso encontrado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
}