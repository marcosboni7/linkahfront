'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  ArrowLeft, User, Mail, Fingerprint, Info, 
  Lock, Calendar, Phone, MapPin, Loader2, 
  Sparkles, ArrowRight, ChevronLeft
} from 'lucide-react';

const API_URL_BASE = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.trim() !== "") setErrors(prev => ({ ...prev, [name]: "" }));
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      setErrors(prev => ({ ...prev, email: "E-mail inválido" }));
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const newErrors: Record<string, string> = {};
    const camposObrigatorios = ["nome", "email", "cpf_cnpj", "senha", "data_nascimento", "telefone", "cep", "rua", "estado"];
    
    camposObrigatorios.forEach(key => {
      if (!data[key]) newErrors[key] = "Obrigatório *";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tipo: tipoPessoa }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '<span style="color: #000; font-weight: 900; text-transform: uppercase; font-style: italic;">🚀 SUCESSO!</span>',
          text: 'Sua conta foi criada. Prepare-se para o extraordinário.',
          icon: 'success',
          confirmButtonColor: '#000',
        }).then(() => router.push('/auth/login'));
      } else {
        Swal.fire('Ops!', result.message || 'Erro ao cadastrar.', 'warning');
      }
    } catch (error) {
      Swal.fire('Erro', 'Conexão com AWS falhou.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      
      {/* LADO ESQUERDO: BACKGROUND IMERSIVO (DARK) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-black sticky top-0 h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1514525253361-bee1455670f2?q=80&w=1964&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="text-2xl font-black tracking-tighter text-white italic">LINKAH.</div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
               <span className="w-1.5 h-1.5 bg-[#FF4D4D] rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Producer Hub</span>
            </div>
            <h1 className="text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Escale sua <br/><span className="text-[#FF4D4D]">visão.</span>
            </h1>
            <p className="text-gray-300 text-lg font-medium leading-relaxed max-w-sm">
              Junte-se a milhares de produtores que gerenciam experiências globais.
            </p>
          </div>

          <div className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">
            Linkah Ecosystem © 2026
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO (CLEAN) */}
      <div className="flex-1 flex flex-col items-center bg-white px-6 py-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-2xl">
          
          <Link href="/auth/login" className="flex items-center gap-1 text-gray-400 hover:text-black transition-colors text-[11px] font-bold uppercase tracking-widest mb-10">
            <ChevronLeft size={16} /> Voltar para o login
          </Link>

          <header className="mb-12">
            <h2 className="text-4xl font-black text-black italic uppercase tracking-tighter mb-2">Cadastro</h2>
            <p className="text-gray-500 font-medium">Crie sua identidade de produtor na plataforma.</p>
          </header>

          <form onSubmit={handleRegister} className="space-y-8">
            {/* TOGGLE TIPO DE PESSOA */}
            <div className="flex p-1 bg-gray-50 rounded-2xl w-fit border border-gray-100">
              <button 
                type="button" 
                onClick={() => setTipoPessoa('PF')} 
                className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${tipoPessoa === 'PF' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
              >
                Pessoa Física
              </button>
              <button 
                type="button" 
                onClick={() => setTipoPessoa('PJ')} 
                className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${tipoPessoa === 'PJ' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
              >
                Pessoa Jurídica
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* INPUT NOME */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome / Razão Social</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input name="nome" onChange={handleInputChange} placeholder="João Silva" className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all font-semibold" />
                </div>
              </div>

              {/* INPUT DOCUMENTO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CPF / CNPJ</label>
                <div className="relative">
                  <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input name="cpf_cnpj" onChange={handleInputChange} placeholder="000.000.000-00" className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all font-semibold" />
                </div>
              </div>

              {/* E-MAIL (FULL WIDTH) */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input name="email" type="email" onChange={handleInputChange} placeholder="seu@email.com" className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all font-semibold" />
                </div>
              </div>

              {/* SENHA */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input name="senha" type="password" onChange={handleInputChange} placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none transition-all font-semibold" />
                </div>
              </div>

              {/* DATA E TELEFONE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Data Nascimento</label>
                <input name="data_nascimento" type="date" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none font-semibold text-gray-500" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Telefone</label>
                <input name="telefone" placeholder="(00) 00000-0000" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none font-semibold" />
              </div>

              {/* ENDEREÇO */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Rua</label>
                  <input name="rua" placeholder="Logradouro" className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">UF</label>
                  <input name="estado" placeholder="SP" maxLength={2} className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-black outline-none font-bold text-center uppercase" />
                </div>
              </div>
            </div>

            {/* BOTÃO SUBMIT */}
            <button
              disabled={isLoading}
              className="w-full bg-[#030712] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Finalizar Cadastro <Sparkles size={18} className="text-[#FF4D4D]" /></>
              )}
            </button>
          </form>

          <footer className="mt-10 mb-20 text-center">
            <p className="text-[12px] font-bold text-gray-400">
              Já possui conta? <Link href="/auth/login" className="text-black hover:underline ml-1">Fazer login</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}