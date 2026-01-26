'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const apiBaseUrl = 'https://linkah-api.onrender.com';

      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        const nomeUsuario = data?.user?.nome || 'Produtor';
        const emailUsuario = data?.user?.email || email;

        localStorage.setItem('userName', nomeUsuario);
        localStorage.setItem('userEmail', emailUsuario);

        console.log("Login realizado com sucesso para:", emailUsuario);
        router.push('/dashboard/eventos');
      } else {
        alert(data.message || "E-mail ou senha incorretos.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      alert("Não foi possível conectar ao servidor. Verifique a API na AWS.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">

      {/* LADO ESQUERDO - Visual */}
      <div className="hidden lg:flex w-[40%] bg-[#C22973] flex-col justify-between p-16 relative overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-black/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.2)] transform rotate-6 hover:rotate-0 transition-all duration-500">
              <Globe className="text-[#C22973] w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-black tracking-tighter text-white italic block leading-none">LINKAH</span>
              <span className="text-[10px] font-bold text-pink-200 uppercase tracking-[0.4em] ml-1">Producer Hub</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md border border-white/10">
            <Sparkles size={12} className="text-pink-300" /> Inteligência para Eventos
          </div>
          <h2 className="text-6xl font-black leading-[1] mb-8 tracking-tighter">
            Escale sua <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-white">produção.</span>
          </h2>
          <p className="text-pink-100/80 text-lg font-light leading-relaxed max-w-sm">
            A plataforma definitiva para quem transforma ideias em experiências inesquecíveis.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-pink-200/40 text-[10px] font-black uppercase tracking-[0.2em]">
          <span>v2.0.4</span>
          <span className="w-1 h-1 bg-pink-200/20 rounded-full" />
          <span>Suporte 24h</span>
        </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-24 bg-[#F8FAFC]">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100">

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Bem-vindo</h1>
            <p className="text-slate-400 font-medium">Insira suas credenciais de produtor.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail Corporativo</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 transition-all"
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                <Link href="#" className="text-[10px] font-bold text-[#C22973]">Esqueceu?</Link>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#C22973]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-[#C22973] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-pink-200 hover:bg-[#a62262] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Acessar Painel <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="flex items-center gap-4 mb-8 text-slate-300">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ou</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <p className="mt-10 text-center text-sm font-bold text-slate-400">
              Não tem conta? <Link href="/auth/registro" className="text-[#C22973] hover:underline decoration-2 underline-offset-4">Cadastre sua produtora</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}