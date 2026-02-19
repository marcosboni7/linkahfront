'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (res.ok) {
        // AQUI ESTÁ O SEGREDO: Sincronizando com o Dashboard
        // Salvamos o objeto do usuário exatamente como o Dashboard espera ler
        localStorage.setItem('@Linkah:User', JSON.stringify(data.user || data));
        
        router.push('/dashboard/eventos');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro no login',
          text: data.message || 'E-mail ou senha incorretos.',
          confirmButtonColor: '#4B0082'
        });
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao conectar com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#4B0082] tracking-tighter mb-2">LİNKAH</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Área do Produtor</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#4B0082] transition-all outline-none"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                required type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#4B0082] transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#4B0082] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-[#3b0066] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}