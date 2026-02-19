'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://linkah-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // SALVANDO EXATAMENTE COMO O PAINEL VAI PEDIR
        localStorage.setItem('@Linkah:Token', data.token);
        localStorage.setItem('@Linkah:User', JSON.stringify(data.user));
        
        router.push('/dashboard/eventos');
      } else {
        setError(data.message || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <div className="hidden lg:flex w-[40%] bg-[#C22973] items-center justify-center p-12">
        <div className="text-white">
          <Globe className="w-16 h-16 mb-8" />
          <h1 className="text-6xl font-black italic tracking-tighter uppercase">LINKAH</h1>
          <p className="text-pink-200 mt-4 text-lg">Acesse sua conta de produtor.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Bem-vindo!</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">Insira seus dados para acessar o painel.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type="email" 
                placeholder="E-mail" 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] transition-all" 
                required 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type="password" 
                placeholder="Senha" 
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] transition-all" 
                required 
              />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center">{error}</div>}

            <button type="submit" disabled={isLoading} className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all">
              {isLoading ? <Loader2 className="animate-spin" /> : <>Entrar no Painel <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Não tem uma conta? <Link href="/auth/register" className="text-[#C22973] font-black underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}