'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AvisoCadastro from '../eventos/AvisoCadastro';
import TabelaEventos from '../eventos/TabelaEventos';
import { UserCircle, LogOut, Settings, ChevronDown } from 'lucide-react';

export default function DashboardEventos() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Produtor');
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const perfilCompleto = localStorage.getItem('perfil_completo');

      if (perfilCompleto !== 'true') {
        setMostrarAviso(true);
      }

      const userStorage = localStorage.getItem('@Linkah:User');
      const parsedUser = userStorage ? JSON.parse(userStorage) : null;

      const storedName =
        parsedUser?.nome ||
        localStorage.getItem('userName') ||
        'Produtor';

      if (storedName && storedName !== 'undefined') {
        const firstName = storedName.split(' ')[0];
        setUserName(
          firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
        );
      }
    } catch (error) {
      console.error('Erro ao carregar nome do usuário:', error);
      setUserName('Produtor');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  const handleAbrirPerfil = () => {
    setIsOpen(false);
    router.push('/dashboard/perfil');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <nav className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#4B0082] tracking-tighter">
            LİNKAH
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-2xl transition-all group"
          >
            <div className="text-right mr-1 hidden sm:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Olá, bem-vindo
              </p>
              <p className="text-xs font-bold text-slate-700">{userName}</p>
            </div>

            <div className="relative">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <UserCircle className="text-slate-400" size={28} />
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute bottom-0 right-0"></div>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-52 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-indigo-100/50 z-20 py-2">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-black text-slate-300 uppercase">
                    Minha Conta
                  </p>
                </div>

                <button
                  onClick={handleAbrirPerfil}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Settings size={16} /> Configurações
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={16} /> Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 md:p-10">
        {mostrarAviso && (
          <AvisoCadastro onClose={() => setMostrarAviso(false)} />
        )}

        <TabelaEventos />
      </main>
    </div>
  );
}