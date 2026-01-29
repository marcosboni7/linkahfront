'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ChevronLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados dos inputs
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://linkah-api.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Trata erros comuns como "E-mail já cadastrado"
        throw new Error(data.message || 'Erro ao criar conta. Tente outro e-mail.');
      }

      // Se sua API já logar o usuário no registro, salve os dados:
      if (data.token) {
        localStorage.setItem('@Linkah:Token', data.token);
        localStorage.setItem('@Linkah:User', JSON.stringify(data.user));
      }

      // Sucesso! Manda para a Home ou para uma tela de "Bem-vindo"
      router.push('/');

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
        <div className="relative z-10 p-12 text-center">
          <Link href="/" className="text-white text-4xl font-black tracking-tighter italic mb-8 block">
            LINKAH<span className="text-[#d6006d]">.</span>
          </Link>
          <h2 className="text-white text-5xl font-black uppercase italic leading-none tracking-tighter mb-6">
            Crie sua conta <br/> e garanta sua <br/> <span className="text-[#d6006d]">Diversão</span>.
          </h2>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          alt="Festival"
        />
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#FCFCFD]">
        <div className="w-full max-w-md">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#d6006d] font-black uppercase text-[10px] tracking-widest mb-12 transition-colors">
            <ChevronLeft size={16} /> Já tenho uma conta
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Comece agora</h1>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 mb-4">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* INPUT NOME */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#d6006d] shadow-sm transition-all"
                />
              </div>
            </div>

            {/* INPUT E-MAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#d6006d] shadow-sm transition-all"
                />
              </div>
            </div>

            {/* INPUT SENHA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Criar Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  minLength={6}
                  type="password" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#d6006d] shadow-sm transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#d6006d] text-white py-4 mt-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-pink-500/20 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Criar minha conta'} <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-400">
            Já faz parte da Linkah? <Link href="/auth/login" className="text-[#d6006d] font-black uppercase text-xs tracking-widest ml-1 hover:underline">Fazer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}