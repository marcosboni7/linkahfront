'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ChevronLeft, ArrowRight, Github, Loader2 } from 'lucide-react';

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
      const response = await fetch('https://linkah-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'E-mail ou senha incorretos');
      }

      localStorage.setItem('@Linkah:Token', data.token);
      localStorage.setItem('@Linkah:User', JSON.stringify(data.user));

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
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      
      {/* LADO ESQUERDO: VISUAL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B0121] relative items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d6006d] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 opacity-10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 p-12 text-center">
          <Link href="/" className="text-white text-4xl font-black tracking-tighter italic mb-8 block">
            LINKAH<span className="text-[#d6006d]">.</span>
          </Link>
          <h2 className="text-white text-5xl font-black uppercase italic leading-none tracking-tighter mb-6">
            Sua próxima <br/> <span className="text-[#d6006d]">Experiência</span> <br/> começa aqui.
          </h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">
            Acesse seus ingressos e favorite os melhores eventos.
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          alt="Evento"
        />
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#FCFCFD]">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#d6006d] font-black uppercase text-[10px] tracking-widest mb-12 transition-colors">
            <ChevronLeft size={16} /> Voltar para a Home
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Bem-vindo!</h1>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 mb-4 animate-bounce">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#d6006d] shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="password" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#d6006d] shadow-sm transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#d6006d] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-pink-500/20 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar na conta'} <ArrowRight size={18} />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-300 bg-[#FCFCFD] px-4">Ou entrar com</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 bg-white border border-slate-100 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 bg-white border border-slate-100 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs">
                <Github size={18} /> Github
              </button>
            </div>
          </form>

          {/* RODAPÉ DO FORMULÁRIO: NÃO TEM CONTA? */}
          <div className="mt-10 text-center">
             <p className="text-sm font-medium text-slate-400">
               Não tem uma conta? 
               <Link href="/site/register" className="text-[#d6006d] font-black uppercase text-xs tracking-widest ml-2 hover:underline decoration-2 underline-offset-4 transition-all">
                 Cadastre-se agora
               </Link>
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}