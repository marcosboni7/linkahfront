'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Globe, ArrowRight, Sparkles, Loader2, ShieldCheck, Cpu } from 'lucide-react';

// --- CONFIGURAÇÃO DA API DA AWS ATUALIZADA ---
const API_URL_BASE = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  // Validação em Tempo Real: E-mail
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'E-mail inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [email]);

  // Validação em Tempo Real: Senha
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
      const response = await fetch(`${API_URL_BASE}/api/auth/login`, {
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
        
        // 1. PERSISTÊNCIA DE SEGURANÇA NO LOCALSTORAGE
        window.localStorage.setItem('@Linkah:Token', data.token);
        window.localStorage.setItem('userEmail', emailUsuario);
        window.localStorage.setItem('userName', user?.nome || 'Produtor');

        // 2. COOKIE PARA MIDDLEWARE (Sessão 24h)
        document.cookie = `userEmail=${emailUsuario}; path=/; max-age=86400; SameSite=Lax`;

        // 3. REDIRECIONAMENTO INTELIGENTE
        if (user?.perfil_completo) {
          window.localStorage.setItem('perfil_completo', 'true');
          window.location.href = '/dashboard/eventos'; 
        } else {
          window.localStorage.removeItem('perfil_completo');
          window.location.href = '/dashboard/perfil';
        }
        
      } else {
        setErrors({ email: ' ', senha: data.message || "Credenciais inválidas" });
      }
    } catch (error) {
      setErrors({ email: 'Erro de conexão', senha: 'Servidor AWS indisponível' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900 overflow-hidden">
      
      {/* LADO ESQUERDO: BRANDING & INFRAESTRUTURA AWS */}
      <div className="hidden lg:flex w-[45%] bg-[#C22973] flex-col justify-between p-20 relative overflow-hidden">
        {/* ELEMENTOS DE DESIGN DE FUNDO */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-white/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-black/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-[1.8rem] flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-all duration-500 cursor-pointer">
              <Globe className="text-[#C22973] w-9 h-9" />
            </div>
            <div>
              <span className="text-4xl font-black tracking-tighter text-white italic block leading-none">LINKAH</span>
              <span className="text-[11px] font-black text-pink-200 uppercase tracking-[0.5em] ml-1 opacity-80">Producer Hub</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md border border-white/10">
            <Cpu size={14} className="text-pink-300" /> Powered by AWS Cloud
          </div>
          <h2 className="text-7xl font-black leading-[0.9] mb-10 tracking-tighter italic uppercase">
            Transforme <br />
            seus <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-pink-400">eventos.</span>
          </h2>
          <p className="text-pink-100/70 text-xl font-medium leading-relaxed max-w-md">
            A infraestrutura definitiva para produtores que buscam escala, segurança e performance em tempo real.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8">
          <div className="flex items-center gap-6 text-pink-200/40 text-[10px] font-black uppercase tracking-[0.25em]">
            <span>v2.2.0 stable</span>
            <span className="w-1.5 h-1.5 bg-pink-200/20 rounded-full" />
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              <span>AES-256 Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO DE ACESSO */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-20 bg-white relative">
        {/* Círculo decorativo mobile */}
        <div className="lg:hidden absolute top-[-100px] right-[-100px] w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-50" />

        <div className="w-full max-w-[460px] relative z-10">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4 uppercase italic">Acessar</h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center lg:justify-start gap-2">
              <span className="w-8 h-[2px] bg-slate-100 hidden sm:block" /> 
              Painel de Gerenciamento
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-7">
            {/* CAMPO: E-MAIL */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest ml-2 text-slate-500">Credencial de Acesso</label>
              <div className="relative group">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`w-full px-7 py-5 bg-slate-50 border-2 ${errors.email && email ? 'border-red-200 ring-4 ring-red-50' : 'border-transparent focus:border-[#C22973] focus:bg-white'} rounded-[1.8rem] outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-inner group-hover:bg-slate-100/50`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-black uppercase italic ml-4 flex items-center gap-1">! {errors.email}</p>}
            </div>

            {/* CAMPO: SENHA */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Senha Privada</label>
                <Link href="#" className="text-[9px] font-black uppercase tracking-tighter text-slate-400 hover:text-[#C22973] transition-colors">Esqueci a senha</Link>
              </div>
              <div className="relative group">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-7 py-5 bg-slate-50 border-2 ${errors.senha && senha ? 'border-red-200 ring-4 ring-red-50' : 'border-transparent focus:border-[#C22973] focus:bg-white'} rounded-[1.8rem] outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-inner group-hover:bg-slate-100/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#C22973] transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* ALERTA DE ERRO DE CREDENCIAIS (Backend) */}
            {errors.senha && !senha.length && (
              <div className="p-5 bg-red-50 rounded-3xl border border-red-100 animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] text-red-500 font-black text-center uppercase tracking-wider">{errors.senha}</p>
              </div>
            )}

            {/* BOTÃO DE AÇÃO */}
            <button
              disabled={isLoading}
              className="w-full bg-[#C22973] text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.25em] shadow-2xl shadow-pink-100 hover:bg-[#a62262] hover:shadow-pink-200 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Entrar no Hub <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* FOOTER DO FORMULÁRIO */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Novo por aqui? 
              </p>
              <Link href="/auth/registro" className="text-[11px] font-black uppercase tracking-widest text-[#C22973] hover:underline decoration-2 underline-offset-4">Criar Conta</Link>
            </div>
          </div>
        </div>

        {/* COPYRIGHT & SYSTEM STATUS */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Systems Online</span>
           </div>
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
             Linkah Cloud Systems &copy; 2026
           </p>
        </div>
      </div>
    </div>
  );
}