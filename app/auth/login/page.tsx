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

const API_URL = 'https://api-linkah.onrender.com';

type Usuario = {
  id?: string;
  nome: string;
  email?: string;
  role?: string;
  perfil?: string;
  perfil_completo?: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Limpa o erro ao digitar
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
      console.log('🌍 Origin atual:', typeof window !== 'undefined' ? window.location.origin : 'SSR');
      console.log('📨 Payload:', { email, senha: '********' });

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
        signal: controller.signal,
      });

      console.log('📡 Status:', response.status);
      
      const rawText = await response.text();
      console.log('📄 Resposta bruta:', rawText);

      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        throw new Error('A API respondeu, mas não retornou JSON válido.');
      }

      if (!response.ok) {
        throw new Error(
          data?.message || data?.mensagem || data?.error || `Erro HTTP ${response.status}`
        );
      }

      // --- CAPTURA DE TOKEN (TODAS AS VARIANTES) ---
      const token = data?.token || data?.accessToken || data?.access_token || data?.jwt || data?.data?.token;

      // --- CONSTRUÇÃO DO OBJETO DE USUÁRIO (TODAS AS VARIANTES) ---
      const usuarioParaSalvar: Usuario = data?.user || data?.usuario || data?.data?.user || data?.data?.usuario || {
        id: data.user?.id || data.id,
        nome: data.user?.nome || email.split('@')[0],
        email: email,
        perfil: data.user?.perfil || 'produtor',
        perfil_completo: data.user?.perfil_completo || false
      };

      // --- PERSISTÊNCIA COMPLETA ---
      if (token) {
        localStorage.setItem('@Linkah:Token', token);
        console.log('🔑 Token salvo com sucesso');
      }

      localStorage.setItem('@Linkah:User', JSON.stringify(usuarioParaSalvar));
      localStorage.setItem('userEmail', email.trim().toLowerCase());
      localStorage.setItem('perfil_completo', JSON.stringify(usuarioParaSalvar));
      
      // Cookie para o Middleware
      document.cookie = `userEmail=${email.trim().toLowerCase()}; path=/; max-age=86400; SameSite=Lax`;

      console.log('✅ Sessão salva no LocalStorage');

      // Redirecionamento Inteligente
      const targetPath = usuarioParaSalvar.perfil_completo ? '/dashboard/eventos' : '/dashboard/perfil';
      
      setTimeout(() => {
        window.location.href = targetPath;
      }, 100);

    } catch (err: any) {
      console.error('❌ Erro no Login:', err);
      if (err?.name === 'AbortError') {
        setError('A API demorou demais. O backend pode estar "acordando" ou fora do ar.');
      } else if (err?.message === 'Failed to fetch') {
        setError('Erro de conexão (CORS ou Backend Offline).');
      } else {
        setError(err?.message || 'Erro ao conectar com o servidor');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      console.log('🏁 Processo finalizado');
      console.log('='.repeat(70));
    }
  }

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      
      {/* SEÇÃO VISUAL ESQUERDA */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-black sticky top-0 h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF4D4D] opacity-10 blur-[120px] rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-20 w-full">
          <Link href="/" className="text-3xl font-black tracking-tighter text-white italic group">
            LINKAH<span className="text-[#FF4D4D] group-hover:animate-pulse">.</span>
          </Link>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
               <span className="w-2 h-2 bg-[#FF4D4D] rounded-full animate-pulse shadow-[0_0_10px_#FF4D4D]" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ambiente Seguro v2.6</span>
            </div>
            <h1 className="text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 italic uppercase text-balance">
              Transforme <br/>o <span className="text-[#FF4D4D]">Agora.</span>
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-md">
              Acesse sua central de inteligência para gestão de eventos e audiência.
            </p>
          </div>

          <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
            Linkah Protocol © 2026
          </div>
        </div>
      </div>

      {/* SEÇÃO FORMULÁRIO DIREITA */}
      <div className="flex-1 flex flex-col items-center px-8 lg:px-24 bg-[#FCFBFA] py-12 lg:py-20 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-12">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
          </Link>

          <header className="mb-10">
            <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter mb-3">Login</h2>
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              <p className="font-bold text-sm uppercase tracking-tight">Portal de Acesso Autorizado</p>
            </div>

            {error && (
              <div className="mt-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest italic">{error}</p>
              </div>
            )}
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">E-mail</label>
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

            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Senha</label>
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

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#030712] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin text-[#FF4D4D]" size={20} />
              ) : (
                <>
                  Acessar Sistema <ArrowRight size={20} className="text-[#FF4D4D]" />
                </>
              )}
            </button>
          </form>

          {/* RODAPÉ COLADO */}
          <footer className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Ainda não possui conta? 
              <Link href="/auth/register" className="text-black hover:text-[#FF4D4D] transition-colors ml-2 underline decoration-gray-200 underline-offset-4">
                Criar Agora
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}