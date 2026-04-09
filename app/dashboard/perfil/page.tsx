'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const API_URL = 'https://api-linkah.onrender.com';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const perfilJaCompleto = (user: any) => {
    return Boolean(
      user?.nome?.trim() &&
      user?.cpf_cnpj?.trim() &&
      user?.cep?.trim()
    );
  };

  const finalizarLogin = (user: any, token: string) => {
    localStorage.setItem('@Linkah:User', JSON.stringify(user));
    localStorage.setItem('@Linkah:Token', token);

    if (user?.email) {
      localStorage.setItem('userEmail', user.email);
    }

    const perfilCompletoSalvo =
      localStorage.getItem('perfil_completo') === 'true' ||
      user?.perfil_completo === true;

    const perfilCompleto = perfilCompletoSalvo || perfilJaCompleto(user);

    localStorage.setItem('perfil_completo', perfilCompleto ? 'true' : 'false');

    localStorage.setItem(
      '@Linkah:User',
      JSON.stringify({
        ...user,
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
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            Entrar
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] mt-3">
            Acesse sua conta Linkah
          </p>
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
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF4D4D] text-white rounded-[2rem] py-6 font-black uppercase tracking-[0.35em] italic text-xs shadow-2xl shadow-[#FF4D4D]/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
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
        </form>

        <div className="mt-8 text-center">
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
    </div>
  );
}