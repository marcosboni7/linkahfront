'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Globe, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
      });

      const data = await response.json();

      if (response.ok) {
        const emailUsuario = data.user?.email || email.trim().toLowerCase();
        
        // 1. BACKUP LOCAL
        window.localStorage.setItem('userEmail', emailUsuario);
        window.localStorage.setItem('@Linkah:User', JSON.stringify(data.user));

        // 2. COOKIE COM "FORCE DOMAIN"
        // Pegamos o hostname atual (linkah-frontend-ivory.vercel.app)
        const host = window.location.hostname;
        document.cookie = `userEmail=${emailUsuario}; path=/; max-age=86400; SameSite=Lax; Secure; domain=${host}`;

        // 3. REDIRECIONAMENTO COM REFRESH TOTAL
        window.location.assign('/dashboard/eventos');
        
      } else {
        setError(data.message || "E-mail ou senha incorretos");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <Globe className="text-[#C22973] w-12 h-12 mb-2" />
          <h1 className="text-2xl font-black text-slate-900 italic">LINKAH</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#C22973] font-bold"
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#C22973] font-bold"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <button
            disabled={isLoading}
            className="w-full bg-[#C22973] text-white py-4 rounded-xl font-bold uppercase shadow-lg hover:bg-[#a62262] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Entrar <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}