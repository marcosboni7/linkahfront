'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Para redirecionar após logar
import Link from 'next/link';
import { Mail, Lock, ChevronLeft, ArrowRight, Github, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para os inputs
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

      // SALVAR TOKEN (Pode usar localStorage ou Cookies)
      localStorage.setItem('@Linkah:Token', data.token);
      localStorage.setItem('@Linkah:User', JSON.stringify(data.user));

      // REDIRECIONAR (Se for admin vai pra dashboard, se for user vai pra home)
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
      {/* ... (LADO ESQUERDO IGUAL AO ANTERIOR) ... */}

      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#FCFCFD]">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#d6006d] font-black uppercase text-[10px] tracking-widest mb-12 transition-colors">
            <ChevronLeft size={16} /> Voltar para a Home
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Bem-vindo!</h1>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 mb-4 animate-shake">
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
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
              </div>
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
              className="w-full bg-[#d6006d] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-pink-500/20 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar na conta'} <ArrowRight size={18} />
            </button>
          </form>
          {/* ... (LINKS DE REDE SOCIAL E CADASTRO IGUAL AO ANTERIOR) ... */}
        </div>
      </div>
    </div>
  );
}