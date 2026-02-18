'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://linkah-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('linkah_token', data.token); // Salva o JWT
        router.push('/dashboard');
      } else {
        alert("Acesso negado. Verifique suas credenciais.");
      }
    } catch (err) {
      console.error("Erro ao logar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-white">
        <div className="text-center mb-10">
          <span className="bg-[#ff0082] text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">Staff Linkah</span>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic mt-4">Painel de <span className="text-[#ff0082]">Acesso</span></h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-[#ff0082]" placeholder="E-mail" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-[#ff0082]" placeholder="Senha" />
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-[#ff0082] transition-all">
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}