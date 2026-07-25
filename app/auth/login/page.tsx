'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight, Sparkles } from 'lucide-react';

const API_URL = 'https://api-linkah.onrender.com';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    senha: '',
  });

  useEffect(() => {
    if (error) setError('');
  }, [form]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          senha: form.senha,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Erro ao acessar');
      }

      const token = data?.token || data?.accessToken;
      const user = data?.user || {};

      // Garante que sempre temos um e-mail confiável, com fallback pro
      // e-mail digitado no formulário caso a API não devolva `user.email`.
      const emailFinal =
        user?.email || user?.Email || form.email.trim().toLowerCase();

      const usuarioNormalizado = {
        ...user,
        email: emailFinal,
        nome: user?.nome || user?.name || emailFinal.split('@')[0],
      };

      if (token) {
        localStorage.setItem('@Linkah:Token', token);
        // Salva o token também em cookie para evitar bloqueio de layout/rotas
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }

      localStorage.setItem('@Linkah:User', JSON.stringify(usuarioNormalizado));
      // Chave usada como fallback em outras telas (Navbar, Perfil)
      localStorage.setItem('userEmail', emailFinal);

      window.location.href = '/dashboard/eventos';
    } catch (err: any) {
      setError(err.message || 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f2]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT */}
        <section className="relative hidden overflow-hidden bg-black lg:flex">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/60 to-black/20" />

          <div className="relative z-10 flex h-full flex-col justify-between p-14">
            <Link
              href="/"
              className="w-fit text-3xl font-black tracking-[-0.08em] text-white"
            >
              LINKAH<span className="text-[#ff4d4d]">.</span>
            </Link>

            <div className="max-w-[520px]">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-[#ff4d4d]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Plataforma de eventos
                </span>
              </div>

              <h1 className="text-[90px] font-black uppercase leading-[0.88] tracking-[-0.08em] text-white">
                Entre e
                <br />
                continue.
              </h1>

              <p className="mt-7 max-w-md text-[16px] leading-8 text-white/55">
                Gerencie eventos, ingressos e experiências em uma plataforma
                moderna e minimalista.
              </p>
            </div>

            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/25">
              Linkah © 2026
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[440px]">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-black/50 transition hover:text-black"
            >
              Voltar
            </Link>

            <div className="mb-10">
              <div className="mb-4 inline-flex rounded-full bg-black px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Login
              </div>

              <h2 className="text-[58px] font-black leading-[0.9] tracking-[-0.08em] text-black">
                Bem-vindo de volta.
              </h2>

              <p className="mt-4 text-[15px] leading-7 text-black/45">
                Faça login para acessar sua conta.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="rounded-[32px] border border-black/10 bg-white p-5 shadow-[0_20px_80px_rgba(0,0,0,0.06)]"
            >
              {error && (
                <div className="mb-5 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label className="mb-2 block px-1 text-[11px] font-black uppercase tracking-[0.16em] text-black/40">
                    E-mail
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-black/25"
                    />

                    <input
                      type="email"
                      required
                      placeholder="voce@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      className="h-[62px] w-full rounded-[20px] border border-black/10 bg-[#f7f7f5] pl-14 pr-5 text-[15px] font-semibold text-black outline-none transition-all placeholder:text-black/25 focus:border-black focus:bg-white"
                    />
                  </div>
                </div>

                {/* SENHA */}
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase tracking-[0.16em] text-black/40">
                      Senha
                    </label>

                    <button
                      type="button"
                      className="text-[11px] font-bold text-black/30 transition hover:text-[#ff4d4d]"
                    >
                      Esqueceu?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-black/25"
                    />

                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={form.senha}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          senha: e.target.value,
                        })
                      }
                      className="h-[62px] w-full rounded-[20px] border border-black/10 bg-[#f7f7f5] pl-14 pr-5 text-[15px] font-semibold text-black outline-none transition-all placeholder:text-black/25 focus:border-black focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex h-[64px] w-full items-center justify-center gap-3 rounded-[22px] bg-black text-[12px] font-black uppercase tracking-[0.22em] text-white shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#111] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-[#ff4d4d]" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight size={18} className="text-[#ff4d4d]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-[24px] border border-black/10 bg-white px-5 py-5 text-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-black/35">
                Não possui conta?{' '}
                <Link
                  href="/auth/registro"
                  className="text-black underline underline-offset-4 transition hover:text-[#ff4d4d]"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}