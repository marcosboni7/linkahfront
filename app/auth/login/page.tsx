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
        
        // 1. LOCAL STORAGE
        window.localStorage.setItem('userEmail', emailUsuario);
        window.localStorage.setItem('@Linkah:User', JSON.stringify({
          email: emailUsuario,
          nome: user?.nome || 'Produtor',
          id: user?.id || data.userId
        }));

        // 2. COOKIE (FORÇADO)
        // Tentamos gravar sem especificar domínio para o navegador decidir o melhor
        document.cookie = `userEmail=${emailUsuario}; path=/; max-age=86400; SameSite=Lax; Secure`;

        // 3. REDIRECIONAMENTO COM DELAY
        // O delay maior ajuda a Vercel a "entender" que o cookie existe
        setTimeout(() => {
          window.location.href = '/dashboard/eventos';
        }, 800);
        
      } else {
        setErrors({ email: ' ', senha: data.message || "Credenciais incorretas" });
        setIsLoading(false);
      }
    } catch (error) {
      setErrors({ email: 'Erro de conexão', senha: 'Não foi possível conectar ao servidor' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <div className="hidden lg:flex w-[40%] bg-[#C22973] flex-col justify-between p-16 relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
                    <Globe className="text-[#C22973] w-8 h-8" />
                </div>
                <span className="text-3xl font-black text-white italic">LINKAH</span>
            </div>
        </div>
        <div className="relative z-10 text-white">
            <h2 className="text-6xl font-black leading-[1] mb-8">Escale sua produção.</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-8 bg-[#F8FAFC]">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-3">Bem-vindo</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold"
            />
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] font-bold"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              disabled={isLoading}
              className="w-full bg-[#C22973] text-white py-5 rounded-[1.5rem] font-black uppercase shadow-xl hover:bg-[#a62262] transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Acessar Painel <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}