'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ChevronLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const API_URL_BASE = 'https://linkah-back.onrender.com';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const emailFormatado = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_URL_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFormatado, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- PERSISTÊNCIA DE DADOS (Protocolo Linkah) ---
        
        // 1. Token de Sessão
        window.localStorage.setItem('@Linkah:Token', data.token);
        
        // 2. Email para referência rápida (usado nos filtros das tabelas)
        window.localStorage.setItem('userEmail', emailFormatado);
        
        // 3. Objeto de Usuário Completo
        const userData = {
           email: emailFormatado,
           id: data.user?.id,
           perfil: data.user?.perfil || 'produtor',
           nome: data.user?.nome
        };
        window.localStorage.setItem('@Linkah:User', JSON.stringify(userData));

        // 4. Cookie para Middleware/SSR
        document.cookie = `userEmail=${emailFormatado}; path=/; max-age=86400; SameSite=Lax`;

        // Redirecionamento Inteligente
        // Se o perfil não estiver completo, manda para o perfil, senão, para o dashboard de eventos
        const targetPath = data.user?.perfil_completo ? '/dashboard/eventos' : '/dashboard/perfil';
        
        router.push(targetPath);
      } else {
        setErrors({ senha: data.message || "Credenciais não autorizadas pelo sistema." });
      }
    } catch (error) {
      setErrors({ senha: 'Falha crítica na conexão com o servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      
      {/* LADO ESQUERDO: VISUAL IDENTITY */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-110 animate-pulse duration-[10s]"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-20 w-full">
          <div className="flex items-center gap-2">
             <span className="text-3xl font-black tracking-tighter text-white italic">LINKAH<span className="text-[#FF4D4D]">.</span></span>
          </div>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
               <span className="w-2 h-2 bg-[#FF4D4D] rounded-full animate-ping" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ambiente de Produção v2.6</span>
            </div>
            <h1 className="text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 italic uppercase">
              Transforme <br/>o <span className="text-[#FF4D4D]">Agora.</span>
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-md">
              Acesse sua central de inteligência para gestão de eventos, vendas e audiência.
            </p>
          </div>

          <div className="flex items-center gap-8 text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
            <span>Linkah Ecosystem © 2026</span>
            <div className="h-px w-12 bg-white/10" />
            <span>Secure Access</span>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: LOGIN ENGINE */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-24 bg-white">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-8 duration-700">
          
          <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-16">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Início
          </Link>

          <header className="mb-12">
            <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter mb-3">Login</h2>
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              <p className="font-bold text-sm uppercase tracking-tight">Portal do Produtor Autorizado</p>
            </div>
          </header>

          <form onSubmit={handleLogin} className="space-y-7">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Credencial de E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@linkah.com"
                  className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] outline-none focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 transition-all font-bold text-black"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Chave de Acesso</label>
                <button type="button" className="text-[10px] font-black text-gray-300 hover:text-[#FF4D4D] uppercase tracking-widest transition-colors">Esqueceu?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                <input
                  required
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] outline-none focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 transition-all font-bold text-black"
                />
              </div>
            </div>

            {errors.senha && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest italic">{errors.senha}</p>
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-[#030712] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Entrar no Sistema <ArrowRight size={20} className="text-[#FF4D4D]" /></>
              )}
            </button>
          </form>

          <footer className="mt-16 pt-8 border-t border-gray-50 text-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Não possui acesso? <Link href="/auth/registro" className="text-black hover:text-[#FF4D4D] transition-colors ml-2 underline decoration-gray-200 underline-offset-4">Solicitar Conta</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}