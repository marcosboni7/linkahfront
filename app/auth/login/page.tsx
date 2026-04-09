'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ChevronLeft, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

const API_URL = 'https://api-linkah.onrender.com';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', senha: '' });

  useEffect(() => { if (error) setError(''); }, [form]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), senha: form.senha }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data?.message || data?.error || 'Erro no acesso');

      const token = data?.token || data?.accessToken || data?.data?.token;
      const user = data?.user || data?.usuario || data?.data?.user || {};
      
      const completo = !!(user.perfil_completo || (user.nome && user.cpf_cnpj && user.cep));

      // Persistência Direta
      if (token) localStorage.setItem('@Linkah:Token', token);
      localStorage.setItem('@Linkah:User', JSON.stringify({ ...user, perfil_completo: completo }));
      document.cookie = `userEmail=${form.email.trim().toLowerCase()}; path=/; max-age=86400; SameSite=Lax`;

      window.location.href = completo ? '/dashboard/eventos' : '/dashboard/perfil';

    } catch (err: any) {
      setError(err.name === 'AbortError' ? 'Servidor demorou a responder.' : err.message);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      {/* LADO ESQUERDO: VISUAL */}
      <div className="hidden lg:flex w-[55%] relative bg-black sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link href="/" className="text-3xl font-black tracking-tighter text-white italic group">
            LINKAH<span className="text-[#FF4D4D]">.</span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6">
                <Sparkles className="w-4 h-4 text-[#FF4D4D]" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Sua JORNADA EXTRAORDINÁRIA</span>
            </div>
            {/* MANCHETE EM TAMANHO GRANDE (7xl) */}
          <h1 className="text-7xl font-black text-[#FF4D4D] leading-[0.95] tracking-tighter mb-6 italic uppercase text-balance">
  Transforme-se <br/>
  <span className="text-white">agora</span>
  <span className="text-[#FF4D4D]">.</span>
</h1>
            <p className="text-gray-400 text-lg font-medium max-w-sm">Entre para gerenciar seus eventos e explorar novas experiências.</p>
          </div>
          <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Linkah Protocol © 2026</div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="flex-1 flex flex-col items-center px-8 lg:px-20 py-12 lg:py-20 bg-[#FCFBFA] overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-black uppercase mb-12">
            <ChevronLeft size={16} /> Voltar para o início
          </Link>

          <header className="mb-10">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Login</h2>
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              <p className="font-bold text-xs uppercase">Bem-vindo de volta à Linkah.</p>
            </div>
            {error && (
              <div className="mt-4 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 text-rose-600">
                <span className="text-[10px] font-black uppercase italic">{error}</span>
              </div>
            )}
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="exemplo@linkah.com" className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-3xl outline-none focus:border-black transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Senha</label>
                <button type="button" className="text-[10px] font-black text-gray-300 hover:text-[#FF4D4D]">Esqueceu?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="password" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} placeholder="••••••••" className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-3xl outline-none focus:border-black transition-all font-bold" />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
              {loading ? <Loader2 className="animate-spin" /> : <>ACESSAR CONTA <ArrowRight size={18} className="text-[#FF4D4D]" /></>}
            </button>
          </form>

          <footer className="mt-10 pt-6 border-t border-gray-100 text-center">
            <p className="text-[11px] font-black uppercase text-gray-400">
              Ainda não faz parte? <Link href="/auth/registro" className="text-black hover:text-[#FF4D4D] underline underline-offset-4 ml-1">Criar Conta</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}