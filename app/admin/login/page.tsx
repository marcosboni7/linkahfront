'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL_BASE}/api/usuarios/login-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Falha na autenticação');

      // Salva o token ou status de admin (pode usar cookies ou localStorage)
      localStorage.setItem('admin_token', data.token);
      
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-slate-900 text-white rounded-3xl mb-4 shadow-lg shadow-slate-200">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
            Admin <span className="text-[#C22973]">Core</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Acesso Restrito à Infraestrutura</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Identificação</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email"
                required
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 focus:border-[#C22973] focus:bg-white transition-all font-medium text-slate-900 outline-none"
                placeholder="admin@linkah.eu"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Chave de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password"
                required
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 focus:border-[#C22973] focus:bg-white transition-all font-medium text-slate-900 outline-none"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-500 uppercase tracking-tight text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 hover:bg-[#C22973] transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>Entrar no Console <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="text-center text-slate-300 font-bold text-[9px] uppercase tracking-widest">
          Linkah Infrastructure v2.0
        </p>
      </div>
    </div>
  );
}