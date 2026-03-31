'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ChevronLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

// --- CONFIGURAÇÃO DA API ---
// Centralizado para evitar erros de digitação (Baseado no seu back do Render)
const API_URL = 'https://api-linkah.onrender.com';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validação básica antes de enviar ao servidor
    if (senha.length < 6) {
      setError('A senha precisa de no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          nome: nome.trim(), 
          email: email.trim().toLowerCase(), 
          senha 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se o erro for 500, provavelmente é e-mail duplicado ou erro de banco no Render
        if (response.status === 500) {
          throw new Error('Servidor instável ou e-mail já cadastrado. Tente outro.');
        }
        throw new Error(data.message || 'Erro ao criar conta. Tente novamente.');
      }

      // Registro bem sucedido -> Salva os dados e autentica
      if (data.token) {
        localStorage.setItem('@Linkah:Token', data.token);
        localStorage.setItem('@Linkah:User', JSON.stringify(data.user));
        
        // Redireciona forçando o recarregamento do estado de login
        window.location.href = '/'; 
      } else {
        // Se não vier token, manda para o login manual
        router.push('/login');
      }

    } catch (err: any) {
      setError(err.message || 'Não foi possível conectar ao servidor.');
      console.error("Erro no Registro:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] flex flex-col md:flex-row font-sans antialiased">
      
      {/* LADO ESQUERDO: VISUAL PREMIUM */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ff4d4d] opacity-10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-white opacity-5 blur-[100px] rounded-full" />
        
        <div className="relative z-10 p-12 text-center max-w-lg">
          <Link href="/" className="text-white text-3xl font-bold tracking-tighter mb-12 block group">
            LINKAH<span className="text-[#ff4d4d] group-hover:animate-ping">.</span>
          </Link>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              <Sparkles size={14} className="text-[#ff4d4d]" /> Faça parte da rede
            </div>
            <h2 className="text-white text-6xl font-bold leading-[1.1] tracking-tight">
              Crie sua conta e <br/> viva o <span className="text-[#ff4d4d]">novo</span>.
            </h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Garanta seu lugar nos melhores eventos e conecte-se com novas comunidades de forma exclusiva.
            </p>
          </div>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Atmosfera de Evento"
        />
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#FCFBFA]">
        <div className="w-full max-w-sm">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs tracking-tight mb-12 transition-all group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Já tenho uma conta
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-3 italic uppercase">Comece agora</h1>
            <p className="text-slate-500 font-medium text-sm">Preencha os campos para criar seu perfil Linkah.</p>
            
            {error && (
              <div className="mt-6 bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-in fade-in slide-in-from-top-2 flex items-center gap-2 uppercase tracking-tighter">
                 <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* NOME */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors" size={18} />
                <input 
                  required
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  className="w-full bg-white border border-slate-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-[#ff4d4d]/5 focus:border-[#ff4d4d] shadow-sm transition-all font-medium"
                />
              </div>
            </div>

            {/* E-MAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white border border-slate-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-[#ff4d4d]/5 focus:border-[#ff4d4d] shadow-sm transition-all font-medium"
                />
              </div>
            </div>

            {/* SENHA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Criar Senha</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff4d4d] transition-colors" size={18} />
                <input 
                  required
                  minLength={6}
                  type="password" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white border border-slate-100 rounded-[1.25rem] py-4 pl-14 pr-6 text-sm outline-none focus:ring-4 focus:ring-[#ff4d4d]/5 focus:border-[#ff4d4d] shadow-sm transition-all font-medium"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-slate-950 text-white py-5 mt-4 rounded-[1.25rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Criar minha conta <ArrowRight size={18} className="text-[#ff4d4d]" /></>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
             <p className="text-sm font-medium text-slate-400">
               Já faz parte da Linkah? 
               <Link href="/site/login" className="text-slate-900 font-black ml-2 hover:underline underline-offset-4 decoration-[#ff4d4d] decoration-2 transition-all">
                 Fazer Login
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}