'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        const emailUsuario = user?.email || email.trim().toLowerCase();
        
        // 1. GRAVA NO LOCALSTORAGE (Backup garantido)
        window.localStorage.setItem('userEmail', emailUsuario);
        window.localStorage.setItem('@Linkah:User', JSON.stringify({
          email: emailUsuario,
          nome: user?.nome || 'Produtor',
          id: user?.id || data.userId
        }));

        // 2. GRAVA O COOKIE (Mínimo possível para não bugar na Vercel)
        // Sem especificar domínio, ele assume o domínio atual da Vercel automaticamente.
        document.cookie = `userEmail=${emailUsuario}; path=/; max-age=86400; SameSite=Lax; Secure`;

        // 3. REDIRECIONAMENTO LIMPO
        // O timeout dá tempo pro navegador terminar de escrever no disco.
        setTimeout(() => {
          window.location.href = '/dashboard/eventos';
        }, 600);
        
      } else {
        setErrors({ email: ' ', senha: data.message || "E-mail ou senha incorretos" });
        setIsLoading(false);
      }
    } catch (error) {
      setErrors({ email: 'Erro de conexão', senha: 'Verifique sua internet' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <div className="hidden lg:flex w-[40%] bg-[#C22973] flex-col justify-between p-16 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Globe className="text-white w-10 h-10" />
            <span className="text-3xl font-black text-white italic tracking-tighter">LINKAH</span>
          </div>
        </div>
        <div className="relative z-10 text-white">
          <h2 className="text-6xl font-black leading-tight mb-4">Escale sua produção.</h2>
          <p className="text-pink-100 text-lg">Acesse sua conta para gerenciar seus eventos.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-8 bg-white lg:bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] bg-white p-10 rounded-[2rem] shadow-xl lg:shadow-sm border border-slate-100">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-slate-900">Bem-vindo de volta</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#C22973] font-semibold transition-all"
              />
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#C22973] font-semibold transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {errors.senha && <p className="text-red-500 text-xs font-bold text-center">{errors.senha}</p>}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-[#C22973] text-white py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg hover:bg-[#a62262] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Entrar agora <ArrowRight size={18} /></>}
            </button>
          </form>
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400 font-medium">Ainda não tem conta?</span>{' '}
            <Link href="/auth/registro" className="text-[#C22973] font-bold hover:underline">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
}