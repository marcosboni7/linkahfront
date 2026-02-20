'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  // Validação de E-mail em tempo real
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'E-mail inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [email]);

  // Validação de Senha em tempo real
  useEffect(() => {
    if (senha && senha.length < 6) {
      setErrors(prev => ({ ...prev, senha: 'Mínimo 6 caracteres' }));
    } else {
      setErrors(prev => ({ ...prev, senha: undefined }));
    }
  }, [senha]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (errors.email || errors.senha || !email || !senha) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        const emailUsuario = user?.email || email.trim().toLowerCase();
        
        // 1. SALVAMENTO LOCAL
        const objetoUsuario = {
          email: emailUsuario,
          nome: user?.nome || 'Produtor',
          id: user?.id || data.userId
        };
        window.localStorage.setItem('@Linkah:User', JSON.stringify(objetoUsuario));
        window.localStorage.setItem('userEmail', emailUsuario);

        // 2. SALVAMENTO EM COOKIE (CORRIGIDO PARA HTTPS/VERCEL)
        // O '; Secure' é o que impede o loop de redirecionamento na Vercel
        document.cookie = `userEmail=${emailUsuario}; path=/; max-age=86400; SameSite=Lax; Secure`;

        // Pausa para o navegador registrar o cookie
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. REDIRECIONAMENTO FORÇADO (Refresh de cabeçalhos)
        // Isso garante que o Middleware leia o cookie novo
        window.location.href = '/dashboard/eventos';
        
      } else {
        setErrors({ email: ' ', senha: data.message || "Credenciais incorretas" });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      setErrors({ email: 'Erro de conexão', senha: 'Não foi possível conectar ao servidor' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      
      {/* LADO ESQUERDO */}
      <div className="hidden lg:flex w-[40%] bg-[#C22973] flex-col justify-between p-16 relative overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-black/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.2)] transform rotate-6">
              <Globe className="text-[#C22973] w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-black tracking-tighter text-white block leading-none italic">LINKAH</span>
              <span className="text-[10px] font-bold text-pink-200 uppercase tracking-[0.4em] ml-1">Producer Hub</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10">
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

      {/* LADO DIREITO */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-24 bg-[#F8FAFC]">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Bem-vindo</h1>
            <p className="text-slate-400 font-medium">Insira suas credenciais para acessar.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-[11px] font-black uppercase tracking-widest ml-2 ${errors.email ? 'text-red-500' : 'text-slate-400'}`}>
                E-mail Corporativo <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className={`w-full px-6 py-4 bg-slate-50 border ${errors.email && email ? 'border-red-400' : 'border-slate-100'} rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all font-bold`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className={`text-[11px] font-black uppercase tracking-widest ${errors.senha ? 'text-red-500' : 'text-slate-400'}`}>
                  Senha de Acesso <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-slate-50 border ${errors.senha && senha ? 'border-red-400' : 'border-slate-100'} rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-pink-50 transition-all font-bold`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.senha && senha && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase italic">{errors.senha}</p>}
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-[#C22973] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#a62262] transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Acessar Painel <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-bold text-slate-400">
              Não tem conta? <Link href="/auth/registro" className="text-[#C22973] hover:underline">Criar uma conta</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}