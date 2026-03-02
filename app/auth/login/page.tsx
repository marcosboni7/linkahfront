'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';

const API_URL_BASE = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.email || !email || !senha) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- SALVAMENTO DE DADOS (CRUCIAL PARA A TABELA FUNCIONAR) ---
        
        // 1. Salva o Token de autenticação
        window.localStorage.setItem('@Linkah:Token', data.token);
        
        // 2. Salva o e-mail no LocalStorage (para a Tabela e Novo Evento lerem)
        const emailFormatado = email.trim().toLowerCase();
        window.localStorage.setItem('userEmail', emailFormatado);
        
        // 3. Salva o objeto do usuário completo (boa prática)
        const userData = {
           email: emailFormatado,
           id: data.user?.id,
           perfil: 'produtor'
        };
        window.localStorage.setItem('@Linkah:User', JSON.stringify(userData));

        // 4. Mantém o cookie para compatibilidade de servidor (SSR)
        document.cookie = `userEmail=${emailFormatado}; path=/; max-age=86400; SameSite=Lax`;

        // Redirecionamento baseado no perfil
        window.location.href = data.user?.perfil_completo ? '/dashboard/eventos' : '/dashboard/perfil';
      } else {
        setErrors({ senha: data.message || "Credenciais inválidas" });
      }
    } catch (error) {
      setErrors({ senha: 'Erro de conexão com o servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      
      {/* LADO ESQUERDO: BACKGROUND IMERSIVO */}
      <div className="hidden lg:flex w-[50%] relative overflow-hidden bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-2">
             <span className="text-2xl font-black tracking-tighter text-white italic">LINKAH.</span>
          </div>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
               <span className="w-1.5 h-1.5 bg-[#FF4D4D] rounded-full animate-ping" />
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Acesso Produtor</span>
            </div>
            <h1 className="text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Sua jornada para o <span className="text-[#FF4D4D]">extraordinário.</span>
            </h1>
            <p className="text-gray-300 text-lg font-medium leading-relaxed">
              Gerencie seus eventos e acompanhe suas vendas em tempo real.
            </p>
          </div>

          <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em]">
            Linkah Ecosystem © 2026
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 bg-white">
        <div className="w-full max-w-[420px]">
          
          <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-black transition-colors text-[11px] font-bold uppercase tracking-widest mb-12">
            <ChevronLeft size={16} /> Voltar para o início
          </Link>

          <header className="mb-10">
            <h2 className="text-4xl font-black text-black italic uppercase tracking-tighter mb-2">Login</h2>
            <p className="text-gray-500 font-medium">Bem-vindo de volta, Produtor.</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-gray-50 transition-all font-semibold text-black shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Senha</label>
                <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest">Esqueceu?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  required
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-gray-50 transition-all font-semibold text-black shadow-sm"
                />
              </div>
            </div>

            {errors.senha && (
              <p className="text-[11px] text-[#FF4D4D] font-bold uppercase text-center italic">{errors.senha}</p>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-[#030712] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Acessar Painel <ArrowRight size={18} className="text-[#FF4D4D]" /></>
              )}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-[12px] font-bold text-gray-400">
              Novo por aqui? <Link href="/auth/registro" className="text-black hover:underline ml-1">Criar conta de produtor</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}