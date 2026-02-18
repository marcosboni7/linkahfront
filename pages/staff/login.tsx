import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function StaffLogin() {
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
        localStorage.setItem('staff_token', data.token);
        router.push('/staff'); // Manda para a index.tsx da pasta staff
      } else {
        alert("Acesso exclusivo para Staff do Linkah.");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <Head><title>Staff Login | Linkah</title></Head>

      <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 shadow-2xl relative border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-[#ff0082] rounded-2xl mb-6 shadow-xl shadow-pink-500/10">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
            Staff <span className="text-[#ff0082]">Login</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest italic opacity-60">
            Acesso Restrito Administrativo
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border-0 rounded-[1.5rem] py-5 pl-16 pr-6 outline-none focus:ring-2 ring-[#ff0082]/20 transition-all font-bold text-slate-700"
                placeholder="adm@linkah.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">Senha</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border-0 rounded-[1.5rem] py-5 pl-16 pr-6 outline-none focus:ring-2 ring-[#ff0082]/20 transition-all font-bold text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-[#ff0082] hover:shadow-lg hover:shadow-pink-500/30 active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Entrando...' : 'Autenticar'}
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center mt-10 text-slate-300 text-[9px] font-black uppercase tracking-[0.4em]">
          Linkah Admin &copy; 2026
        </p>
      </div>
    </div>
  );
}