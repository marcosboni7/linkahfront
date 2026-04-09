'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  ChevronLeft, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

const API_URL_BASE = 'https://api-linkah.onrender.com';

type Usuario = {
  id?: string;
  nome: string;
  email?: string;
  perfil?: string;
  perfil_completo?: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  // Limpa o erro ao digitar
  useEffect(() => {
    if (error) setError('');
  }, [email, senha]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const emailFormatado = email.trim().toLowerCase();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      console.log('='.repeat(50));
      console.log('🚀 INICIANDO AUTH ENGINE');
      
      const response = await fetch(`${API_URL_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: emailFormatado, senha }),
        signal: controller.signal,
      });

      const rawText = await response.text();
      let data: any = {};
      
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        throw new Error('Resposta do servidor inválida (JSON Parse Error).');
      }

      console.log('📡 STATUS:', response.status);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Erro de autenticação (${response.status})`);
      }

      // --- PROTOCOLO DE PERSISTÊNCIA LINKAH ---
      const token = data?.token || data?.accessToken || data?.access_token;
      
      const userData: Usuario = {
        id: data.user?.id || data.usuario?.id,
        email: emailFormatado,
        nome: data.user?.nome || data.usuario?.nome || emailFormatado.split('@')[0],
        perfil: data.user?.perfil || data.usuario?.perfil || 'produtor',
        perfil_completo: data.user?.perfil_completo ?? data.usuario?.perfil_completo ?? false
      };

      // 1. Gravação em LocalStorage
      localStorage.setItem('@Linkah:Token', token);
      localStorage.setItem('@Linkah:User', JSON.stringify(userData));
      localStorage.setItem('userEmail', emailFormatado);
      localStorage.setItem('perfil_completo', JSON.stringify(userData));

      // 2. Cookie para suporte a SSR/Middleware
      document.cookie = `userEmail=${emailFormatado}; path=/; max-age=86400; SameSite=Lax`;

      console.log('✅ SESSSÃO ESTABELECIDA:', userData.nome);

      // Redirecionamento Inteligente
      const targetPath = userData.perfil_completo ? '/dashboard/eventos' : '/dashboard/perfil';
      
      setTimeout(() => {
        router.push(targetPath);
      }, 100);

    } catch (err: any) {
      console.error('❌ AUTH_ERROR:', err);
      if (err?.name === 'AbortError') {
        setError('Tempo limite esgotado. O servidor demorou a responder.');
      } else {
        setError(err?.message || 'Falha crítica na conexão com o sistema.');
      }
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
      console.log('='.repeat(50));
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      
      {/* LADO ESQUERDO: VISUAL IDENTITY (DARK MODE OVERLAY) */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-black sticky top-0 h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 animate-in zoom-in duration-[20s]"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/60 to-transparent" />
        
        {/* Efeito de Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF4D4D] opacity-10 blur-[120px] rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-20 w-full">
          <div>
            <Link href="/" className="text-3xl font-black tracking-tighter text-white italic group">
              LINKAH<span className="text-[#FF4D4D] group-hover:animate-pulse">.</span>
            </Link>
          </div>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
               <span className="w-2 h-2 bg-[#FF4D4D] rounded-full animate-pulse shadow-[0_0_10px_#FF4D4D]" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ambiente Seguro v2.6</span>
            </div>
            <h1 className="text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 italic uppercase">
              Transforme <br/>o <span className="text-[#FF4D4D]">Agora.</span>
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-md">
              Acesse sua central de inteligência para gestão de eventos, vendas e audiência.
            </p>
          </div>

          <div className="flex items-center gap-8 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
            <span>Linkah Protocol © 2026</span>
            <div className="h-px w-12 bg-white/10" />
            <span>Secure Access Point</span>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: LOGIN ENGINE */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-24 bg-[#FCFBFA]">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-16">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
          </Link>

          <header className="mb-12">
            <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter mb-3">Login</h2>
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              <p className="font-bold text-sm uppercase tracking-tight">Portal de Acesso Autorizado</p>
            </div>

            {error && (
              <div className="mt-8 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest italic">{error}</p>
              </div>
            )}
          </header>

          <form onSubmit={handleLogin} className="space-y-7">
            {/* E-MAIL */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Credencial de E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@linkah.com"
                  className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2rem] outline-none focus:border-black focus:ring-8 focus:ring-gray-50 transition-all font-bold text-black shadow-sm"
                />
              </div>
            </div>

            {/* SENHA */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Chave de Acesso</label>
                <button type="button" className="text-[10px] font-black text-gray-300 hover:text-[#FF4D4D] uppercase tracking-widest transition-colors">Esqueceu?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                <input
                  required
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2rem] outline-none focus:border-black focus:ring-8 focus:ring-gray-50 transition-all font-bold text-black shadow-sm"
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              disabled={isLoading}
              className="w-full bg-[#030712] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-[#FF4D4D]" />
              ) : (
                <>
                  Acessar Sistema <ArrowRight size={20} className="text-[#FF4D4D]" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Ainda não possui conta? 
              <Link href="/site/register" className="text-black hover:text-[#FF4D4D] transition-colors ml-2 underline decoration-gray-200 underline-offset-4">
                Criar Agora
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}