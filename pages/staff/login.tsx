import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Conexão direta com seu backend no Render
      const res = await fetch('https://linkah-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Salvamos o token para usar nas outras páginas do staff
        localStorage.setItem('staff_token', data.token);
        router.push('/staff/painel');
      } else {
        alert("Acesso negado. Verifique se você é um administrador.");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor do Linkah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <Head>
        <title>Linkah Staff | Login</title>
      </Head>

      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Detalhe estético no topo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#ff0082]"></div>

        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Acesso Restrito
          </span>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic mt-2">
            Linkah <span className="text-[#ff0082]">Staff</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-[#ff0082] transition-all font-medium text-slate-700"
                placeholder="nome@linkah.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Senha</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-[#ff0082] transition-all font-medium text-slate-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-[#ff0082] text-white font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Entrar no Painel'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-[10px] font-medium uppercase tracking-tighter">
          Linkah Ecosystem &copy; 2026
        </p>
      </div>
    </div>
  );
}