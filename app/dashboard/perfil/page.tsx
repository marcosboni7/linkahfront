'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  UserCircle,
} from 'lucide-react';

const API_URL = 'https://api-linkah.onrender.com';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const token = localStorage.getItem('@Linkah:Token');

      if (userStorage && token) {
        const user = JSON.parse(userStorage);

        const perfilCompleto =
          localStorage.getItem('perfil_completo') === 'true' ||
          user?.perfil_completo === true ||
          Boolean(user?.nome?.trim() && user?.cpf_cnpj?.trim() && user?.cep?.trim());

        if (perfilCompleto) {
          router.replace('/dashboard/eventos');
        } else {
          router.replace('/dashboard/perfil');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
    }
  }, [router]);

  const perfilJaCompleto = (user: any) => {
    return Boolean(
      user?.nome?.trim() &&
      user?.cpf_cnpj?.trim() &&
      user?.cep?.trim()
    );
  };

  const finalizarLogin = (user: any, token: string) => {
    const userFinal = user || {};

    localStorage.setItem('@Linkah:User', JSON.stringify(userFinal));
    localStorage.setItem('@Linkah:Token', token);

    if (userFinal?.email) {
      localStorage.setItem('userEmail', userFinal.email);
    }

    const perfilCompleto =
      userFinal?.perfil_completo === true || perfilJaCompleto(userFinal);

    localStorage.setItem('perfil_completo', perfilCompleto ? 'true' : 'false');

    localStorage.setItem(
      '@Linkah:User',
      JSON.stringify({
        ...userFinal,
        perfil_completo: perfilCompleto,
      })
    );

    if (perfilCompleto) {
      window.location.href = '/dashboard/eventos';
    } else {
      window.location.href = '/dashboard/perfil';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 Tentando login em:', `${API_URL}/api/auth/login`);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha,
        }),
      });

      const data = await response.json().catch(() => null);

      console.log('✅ Resposta login:', data);

      if (!response.ok) {
        throw new Error(data?.message || 'Erro no login');
      }

      const user = data?.user || {};
      const token = data?.token || '';

      if (!token) {
        throw new Error('Token não recebido do servidor.');
      }

      finalizarLogin(user, token);
    } catch (error: any) {
      console.error('❌ Erro no Login:', error);

      Swal.fire({
        icon: 'error',
        title: 'Erro ao entrar',
        text: error.message || 'Falha no login',
        confirmButtonColor: '#FF4D4D',
        customClass: {
          popup: 'rounded-[2rem]',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-8 pt-10 pb-6 md:px-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center shadow-xl">
              <UserCircle className="text-white" size={34} />
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
                Entrar
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] mt-2">
                Acesse sua conta Linkah
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-2">
                E-mail
              </label>

              <div className="relative group">
                <Mail
                  size={20}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@email.com"
                  className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all outline-none"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-2">
                Senha
              </label>

              <div className="relative group">
                <Lock
                  size={20}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors"
                />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-16 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all outline-none"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF4D4D] transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF4D4D] text-white rounded-[2rem] py-6 font-black uppercase tracking-[0.35em] italic text-xs shadow-2xl shadow-[#FF4D4D]/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Entrando...
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} />
                    Entrar
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href="/site/esqueci-senha"
              className="text-sm font-bold text-slate-400 hover:text-[#FF4D4D] transition-colors"
            >
              Esqueceu sua senha?
            </Link>

            <p className="text-sm text-slate-400 font-bold">
              Não tem conta?{' '}
              <Link
                href="/site/cadastro"
                className="text-[#FF4D4D] hover:opacity-80 transition-opacity"
              >
                Criar agora
              </Link>
            </p>
          </div>
        </div>

        <div className="px-8 py-5 md:px-12 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-center">
            Linkah • acesso seguro
          </p>
        </div>
      </div>
    </div>
  );
}