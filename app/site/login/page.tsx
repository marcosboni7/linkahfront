'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, ChevronLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

type Usuario = {
  nome: string;
  email?: string;
  role?: string;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    if (error) setError('');
  }, [email, senha]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const url = `${API_URL}/api/auth/login`;

      console.log('='.repeat(70));
      console.log('🚀 Tentando login em:', url);
      console.log('🌍 Origin atual:', window.location.origin);
      console.log('📨 Payload:', { email, senha: '********' });

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, senha }),
        signal: controller.signal,
      });

      console.log('📡 Status:', response.status);
      console.log('📡 OK:', response.ok);
      console.log('📡 Type:', response.type);
      console.log('📡 Content-Type:', response.headers.get('content-type'));

      const rawText = await response.text();
      console.log('📄 Resposta bruta:', rawText);

      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        throw new Error('A API respondeu, mas não retornou JSON válido.');
      }

      console.log('📦 Resposta da API:', data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.mensagem ||
            data?.error ||
            `Erro HTTP ${response.status}`
        );
      }

      const token =
        data?.token ||
        data?.accessToken ||
        data?.access_token ||
        data?.jwt ||
        data?.data?.token ||
        null;

      const usuarioParaSalvar: Usuario =
        data?.user ||
        data?.usuario ||
        data?.data?.user ||
        data?.data?.usuario || {
          nome: email.split('@')[0],
          email,
          role: 'membro',
        };

      if (!usuarioParaSalvar || (!usuarioParaSalvar.nome && !usuarioParaSalvar.email)) {
        throw new Error('Login respondeu sem dados válidos do usuário.');
      }

      if (token) {
        localStorage.setItem('@Linkah:Token', token);
        console.log('🔑 Token salvo');
      } else {
        console.log('ℹ️ Login sem token. Seguindo com user/cookie.');
      }

      localStorage.setItem('@Linkah:User', JSON.stringify(usuarioParaSalvar));

      if (usuarioParaSalvar.email) {
        localStorage.setItem('userEmail', usuarioParaSalvar.email);
      }

      localStorage.setItem('perfil_completo', JSON.stringify(usuarioParaSalvar));

      console.log('✅ @Linkah:User:', localStorage.getItem('@Linkah:User'));
      console.log('✅ userEmail:', localStorage.getItem('userEmail'));
      console.log('✅ perfil_completo:', localStorage.getItem('perfil_completo'));
      console.log('✅ @Linkah:Token:', localStorage.getItem('@Linkah:Token'));

      alert('Logado com sucesso!');

      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      console.error('❌ Erro no Login:', err);

      if (err?.name === 'AbortError') {
        setError('A API demorou demais para responder. O backend pode estar dormindo ou fora do ar.');
      } else if (err?.message === 'Failed to fetch') {
        setError('Não foi possível conectar com a API. Normalmente isso é CORS, preflight, backend offline ou erro de certificado.');
      } else {
        setError(err?.message || 'Erro ao conectar com o servidor');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      console.log('🏁 Fim do login');
      console.log('='.repeat(70));
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] flex flex-col lg:flex-row font-sans antialiased">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ff4d4d] opacity-10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-white opacity-5 blur-[100px] rounded-full" />

        <div className="relative z-10 p-12 text-center max-w-lg">
          <Link href="/" className="text-white text-3xl font-bold tracking-tighter mb-12 block group">
            LINKAH<span className="text-[#ff4d4d] group-hover:animate-pulse">.</span>
          </Link>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              <Sparkles size={14} className="text-[#ff4d4d]" /> Acesso Exclusivo
            </div>
            <h2 className="text-white text-6xl font-bold leading-[1.1] tracking-tight">
              Sua jornada <br /> para o <span className="text-[#ff4d4d]">extraordinário</span>.
            </h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Entre para gerenciar seus ingressos e explorar novas experiências.
            </p>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Evento"
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#FCFBFA]">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs tracking-tight mb-12 transition-all group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para o início
          </Link>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-3 italic uppercase">
              Login
            </h1>
            <p className="text-slate-500 font-medium">Bem-vindo de volta à Linkah.</p>

            {error && (
              <div className="mt-6 bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-semibold border border-rose-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                E-mail
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors"
                  size={18}
                />
                <input
                  required
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-white border border-slate-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-[#ff4d4d]/5 focus:border-[#ff4d4d] shadow-sm transition-all placeholder:text-slate-300 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-[11px] font-bold text-slate-400 hover:text-[#ff4d4d] transition-colors"
                >
                  Esqueceu?
                </button>
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors"
                  size={18}
                />
                <input
                  required
                  autoComplete="current-password"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-white border border-slate-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-[#ff4d4d]/5 focus:border-[#ff4d4d] shadow-sm transition-all placeholder:text-slate-300 font-medium text-slate-900"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-950 text-white py-5 mt-4 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Acessar Conta <ArrowRight size={18} className="text-[#ff4d4d]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm font-medium text-slate-400">
              Ainda não faz parte?
              <Link
                href="/site/register"
                className="text-slate-900 font-black ml-2 hover:underline underline-offset-4 decoration-[#ff4d4d] decoration-2"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}