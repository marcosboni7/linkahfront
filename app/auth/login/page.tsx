'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  // Validação em tempo real
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'E-mail inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.email || !email || !senha) return;

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
        // 1. PADRONIZAÇÃO DE CHAVES (Sincronizado com Navbar)
        const userObj = {
          nome: data.user?.nome || 'Produtor',
          email: data.user?.email || email.trim().toLowerCase(),
          role: data.user?.role || 'produtor'
        };

        localStorage.setItem('@Linkah:User', JSON.stringify(userObj));
        if (data.token) localStorage.setItem('@Linkah:Token', data.token);

        // 2. CHECAGEM DE PERFIL E REDIRECIONAMENTO
        try {
          const perfilRes = await fetch(`${apiBaseUrl}/api/auth/perfil?email=${userObj.email}`);
          const perfilData = await perfilRes.json();

          if (perfilRes.ok && (perfilData.cpf_cnpj || perfilData.cep)) {
            router.push('/dashboard/painel'); 
          } else {
            router.push('/dashboard/perfil'); 
          }
        } catch {
          router.push('/dashboard/painel'); 
        }
      } else {
        setErrors({ email: ' ', senha: data.message || "Credenciais incorretas" });
        setIsLoading(false);
      }
    } catch (error) {
      setErrors({ email: 'Erro de conexão', senha: 'Não foi possível conectar ao servidor' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* LADO ESQUERDO - Visual */}
      <div className="hidden lg:flex w-[40%] bg-[#C22973] flex-col justify-between p-16 relative overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl rotate-6">
              <Globe className="text-[#C22973] w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-black tracking-tighter text-white italic block leading-none">LINKAH</span>
              <span className="text-[10px] font-bold text-pink-200 uppercase tracking-[0.4em] ml-1">Producer Hub</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white">
          <h2 className="text-6xl font-black leading-[1] mb-8 tracking-tighter">
            Escale sua <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-white">produção.</span>
          </h2>
          <p className="text-pink-100/80 text-lg font-light max-w-sm">
            A plataforma definitiva para quem transforma ideias em experiências inesquecíveis.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-pink-200/40 text-[10px] font-black uppercase tracking-[0.2em]">
          <span>v2.0.4</span>
          <span>Suporte 24h</span>
        </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-24">
        <div className="w-full max-w-[440px] bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Bem-vindo</h1>
            <p className="text-slate-400 font-medium">Acesse sua conta de produtor.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest ml-2 text-slate-400">
                E-mail Corporativo
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Senha</label>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 transition-all font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#C22973]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.senha && <p className="text-[10px] text-red-500 font-bold ml-2 italic">{errors.senha}</p>}
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-[#C22973] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-pink-100 hover:bg-[#a62262] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Acessar Painel <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}