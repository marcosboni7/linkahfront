'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ChevronLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://r8amtavirp.us-east-1.awsapprunner.com';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'E-mail ou senha incorretos');
      }

      // Salvando credenciais de forma segura
      localStorage.setItem('@Linkah:Token', data.token);
      localStorage.setItem('@Linkah:User', JSON.stringify(data.user));

      // Lógica de redirecionamento inteligente
      if (data.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] flex flex-col md:flex-row font-sans antialiased">
      
      {/* LADO ESQUERDO: VISUAL PREMIUM (VISÍVEL EM DESKTOP) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        {/* Efeitos de luz de fundo */}
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
              Sua jornada <br/> para o <span className="text-[#ff4d4d]">extraordinário</span>.
            </h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Entre para gerenciar seus ingressos e explorar novas experiências.
            </p>
          </div>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Evento Contextual"
        />
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#FCFBFA]">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs tracking-tight mb-12 transition-all group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para o início
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-3 italic uppercase">Login</h1>
            <p className="text-slate-500 font-medium">Bem-vindo de volta à Linkah.</p>
            
            {error && (
              <div className="mt-6 bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-semibold border border-rose-100 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-white border border-slate-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-[#ff4d4d]/5 focus:border-[#ff4d4d] shadow-sm transition-all placeholder:text-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senha</label>
                <button type="button" className="text-[11px] font-bold text-slate-400 hover:text-[#ff4d4d] transition-colors">Esqueceu?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors" size={18} />
                <input 
                  required
                  type="password" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-white border border-slate-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-[#ff4d4d]/5 focus:border-[#ff4d4d] shadow-sm transition-all placeholder:text-slate-300 font-medium"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-slate-950 text-white py-5 mt-4 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Acessar Conta <ArrowRight size={18} className="text-[#ff4d4d]" /></>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
             <p className="text-sm font-medium text-slate-400">
               Ainda não faz parte?
               <Link href="/register" className="text-slate-900 font-black ml-2 hover:underline underline-offset-4 decoration-[#ff4d4d] decoration-2">
                 Criar conta
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}