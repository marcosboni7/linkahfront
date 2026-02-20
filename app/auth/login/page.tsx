'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://linkah-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Limpa resíduos
        localStorage.clear();
        
        // 2. Salva novos dados (padrão que seu dashboard já usa)
        localStorage.setItem('@Linkah:User', JSON.stringify(data.user));
        localStorage.setItem('userEmail', email.toLowerCase());
        
        // 3. Cookie para o Middleware
        document.cookie = `userEmail=${email.toLowerCase()}; path=/; max-age=86400; SameSite=Lax; Secure`;

        // 4. Redirecionamento de "força bruta" para matar o cache/loop
        window.location.href = '/dashboard/eventos';
      } else {
        alert(data.message || "Erro ao entrar. Verifique suas credenciais.");
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic text-[#C22973] tracking-tighter">LİNKAH</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
            <input
              type="email"
              placeholder="Seu e-mail"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-[#C22973] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
            <input
              type="password"
              placeholder="Sua senha"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-[#C22973] transition-all"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C22973] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-[#a12260] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C22973]/20"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Entrar no Dashboard"}
          </button>
        </form>

        <p className="text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Não tem conta? <Link href="/auth/cadastro" className="text-[#C22973] hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}