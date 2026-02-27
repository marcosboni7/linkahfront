'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  Globe, ArrowLeft, User, Mail, 
  Fingerprint, Info, Lock, Calendar, 
  Phone, MapPin, Loader2, Sparkles, ShieldCheck
} from 'lucide-react';

// --- CONFIGURAÇÃO DA API DA AWS ATUALIZADA ---
const API_URL_BASE = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.trim() !== "") {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      setErrors(prev => ({ ...prev, email: "E-mail inválido" }));
    }
  };

  const validateFieldOnBlur = (name: string, value: string) => {
    if (!value && ["nome", "email", "cpf_cnpj", "senha", "data_nascimento", "telefone", "cep", "rua"].includes(name)) {
      setErrors(prev => ({ ...prev, [name]: "Campo obrigatório *" }));
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
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const payload = { ...data, tipo: tipoPessoa };

    try {
      const response = await fetch(`${API_URL_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '<span style="color: #C22973; font-family: sans-serif; font-weight: 900; text-transform: uppercase; font-style: italic;">🚀 Conta Criada!</span>',
          html: '<p style="font-weight: bold; color: #64748b;">Seu acesso ao Producer Hub foi liberado com sucesso.</p>',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'ACESSAR MINHA CONTA',
          buttonsStyling: true,
          customClass: { 
            popup: 'rounded-[3rem] border-none shadow-2xl',
            confirmButton: 'rounded-2xl px-8 py-4 font-black tracking-widest'
          }
        }).then((res) => {
          if (res.isConfirmed) router.push('/auth/login');
        });
      } else {
        Swal.fire({
          title: 'Ops!',
          text: result.message || 'Erro ao cadastrar.',
          icon: 'warning',
          confirmButtonColor: '#C22973',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível conectar ao servidor AWS.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans antialiased text-slate-900">
      
      {/* SIDEBAR PERSISTENTE - ESTILO LINKAH CLOUD */}
      <div className="hidden lg:flex w-[35%] bg-[#C22973] flex-col justify-between p-16 relative overflow-hidden sticky top-0 h-screen shadow-2xl">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10">
          <Link href="/auth/login" className="flex items-center gap-3 text-pink-100 hover:text-white transition-all mb-20 text-[11px] font-black uppercase tracking-[0.3em] group">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
              <ArrowLeft size={14} />
            </div>
            Voltar para Login
          </Link>
          
          <div className="flex flex-col gap-8">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-700 cursor-help">
              <Globe className="text-[#C22973] w-12 h-12" />
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest text-pink-200 backdrop-blur-sm border border-white/5">
                <Sparkles size={12} /> Producer Enrollment
              </div>
              <h2 className="text-6xl font-black text-white leading-[1] italic uppercase tracking-tighter">
                Escale <br/>
                <span className="text-pink-300">Sua Visão.</span>
              </h2>
              <p className="text-pink-100/70 text-lg font-medium leading-relaxed max-w-xs">
                Junte-se a milhares de produtores que utilizam a Linkah para gerenciar experiências globais.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-pink-200/40 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={16} />
            <span>Dados protegidos por criptografia AWS</span>
          </div>
          <div className="flex items-center gap-4 text-pink-200/20 text-[9px] font-black uppercase tracking-widest">
              <span>Linkah Enterprise</span>
              <span className="w-1 h-1 bg-pink-200/20 rounded-full" />
              <span>v2.1.0 stable</span>
          </div>
        </div>
      </div>

      {/* ÁREA DO FORMULÁRIO SCROLLABLE */}
      <div className="flex-1 flex flex-col items-center bg-[#F0F2F5] px-6 py-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white p-10 lg:p-16 rounded-[4rem] shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-white">
          
          <div className="mb-14 text-center lg:text-left">
              <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tight leading-none mb-3">Cadastro</h1>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="h-[2px] w-10 bg-[#C22973] rounded-full" />
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">Identificação do Produtor</p>
              </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-10">
            {/* TOGGLE TIPO DE PESSOA */}
            <div className="flex p-1.5 bg-slate-50 rounded-[1.8rem] w-fit mx-auto lg:mx-0 border border-slate-100">
              <button 
                type="button" 
                onClick={() => setTipoPessoa('PF')} 
                className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${tipoPessoa === 'PF' ? 'bg-white text-[#C22973] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Pessoa Física
              </button>
              <button 
                type="button" 
                onClick={() => setTipoPessoa('PJ')} 
                className={`px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${tipoPessoa === 'PJ' ? 'bg-white text-[#C22973] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Pessoa Jurídica
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              
              {/* DOCUMENTO */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Documento Principal</label>
                <div className="relative group">
                  <Fingerprint className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.cpf_cnpj ? 'text-red-400' : 'text-slate-300 group-focus-within:text-[#C22973]'}`} size={22} />
                  <input 
                    name="cpf_cnpj" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder={tipoPessoa === 'PF' ? "000.000.000-00" : "00.000.000/0000-00"} 
                    className={`w-full pl-14 pr-6 py-5 border-2 ${errors.cpf_cnpj ? 'border-red-100 bg-red-50/30 ring-4 ring-red-50' : 'border-transparent focus:border-[#C22973] focus:bg-white focus:ring-4 focus:ring-pink-50'} rounded-[2rem] outline-none bg-slate-50/50 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner`} 
                  />
                </div>
                {errors.cpf_cnpj && <span className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase italic tracking-tighter">{errors.cpf_cnpj}</span>}
              </div>

              {/* NOME */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Nome Completo/Razão</label>
                <div className="relative group">
                  <User className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.nome ? 'text-red-400' : 'text-slate-300 group-focus-within:text-[#C22973]'}`} size={22} />
                  <input 
                    name="nome" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="João Silva ou Eventos LTDA" 
                    className={`w-full pl-14 pr-6 py-5 border-2 ${errors.nome ? 'border-red-100 bg-red-50/30 ring-4 ring-red-50' : 'border-transparent focus:border-[#C22973] focus:bg-white focus:ring-4 focus:ring-pink-50'} rounded-[2rem] outline-none bg-slate-50/50 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner`} 
                  />
                </div>
                {errors.nome && <span className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase italic tracking-tighter">{errors.nome}</span>}
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">E-mail Corporativo</label>
                <div className="relative group">
                  <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-300 group-focus-within:text-[#C22973]'}`} size={22} />
                  <input 
                    name="email" 
                    type="email" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="nome@empresa.com" 
                    className={`w-full pl-14 pr-6 py-5 border-2 ${errors.email ? 'border-red-100 bg-red-50/30 ring-4 ring-red-50' : 'border-transparent focus:border-[#C22973] focus:bg-white focus:ring-4 focus:ring-pink-50'} rounded-[2rem] outline-none bg-slate-50/50 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner`} 
                  />
                </div>
                {errors.email && <span className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase italic tracking-tighter">{errors.email}</span>}
              </div>

              {/* SENHA */}
              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Senha de Segurança</label>
                <div className="relative group">
                  <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.senha ? 'text-red-400' : 'text-slate-300 group-focus-within:text-[#C22973]'}`} size={22} />
                  <input 
                    name="senha" 
                    type="password" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="Mínimo 6 caracteres alfanuméricos" 
                    className={`w-full pl-14 pr-6 py-5 border-2 ${errors.senha ? 'border-red-100 bg-red-50/30 ring-4 ring-red-50' : 'border-transparent focus:border-[#C22973] focus:bg-white focus:ring-4 focus:ring-pink-50'} rounded-[2rem] outline-none bg-slate-50/50 transition-all font-bold text-slate-800 placeholder:text-slate-200 shadow-inner`} 
                  />
                </div>
                {errors.senha && <span className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase italic tracking-tighter">{errors.senha}</span>}
              </div>

              {/* DATA NASCIMENTO */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Data de Fundação/Nasc.</label>
                <div className="relative group">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C22973]" size={22} />
                  <input 
                    name="data_nascimento" 
                    type="date" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    className={`w-full pl-14 pr-6 py-5 border-2 ${errors.data_nascimento ? 'border-red-100' : 'border-transparent focus:border-[#C22973] focus:bg-white'} rounded-[2rem] outline-none bg-slate-50/50 text-slate-600 font-bold transition-all shadow-inner`} 
                  />
                </div>
              </div>

              {/* TELEFONE */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Telefone Hub</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C22973]" size={22} />
                  <input 
                    name="telefone" 
                    type="text" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="(00) 00000-0000" 
                    className={`w-full pl-14 pr-6 py-5 border-2 ${errors.telefone ? 'border-red-100' : 'border-transparent focus:border-[#C22973] focus:bg-white'} rounded-[2rem] outline-none bg-slate-50/50 transition-all font-bold text-slate-800 shadow-inner`} 
                  />
                </div>
              </div>

              {/* CEP */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Localização (CEP)</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C22973]" size={22} />
                  <input 
                    name="cep" 
                    type="text" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="00000-000" 
                    className={`w-full pl-14 pr-6 py-5 border-2 ${errors.cep ? 'border-red-100' : 'border-transparent focus:border-[#C22973] focus:bg-white'} rounded-[2rem] outline-none bg-slate-50/50 transition-all font-bold text-slate-800 shadow-inner`} 
                  />
                </div>
              </div>

              {/* RUA */}
              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 italic">Endereço Fiscal</label>
                <input 
                  name="rua" 
                  type="text" 
                  onChange={handleInputChange}
                  onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                  placeholder="Rua, Avenida, Praça..." 
                  className={`w-full px-7 py-5 border-2 ${errors.rua ? 'border-red-100' : 'border-transparent focus:border-[#C22973] focus:bg-white'} rounded-[2rem] outline-none bg-slate-50/50 transition-all font-bold text-slate-800 shadow-inner`} 
                />
              </div>

              {/* COMPLEMENTOS */}
              <div className="grid grid-cols-3 col-span-2 gap-5">
                <div className="space-y-2">
                  <input name="numero" placeholder="Nº" className="w-full p-5 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-[#C22973] focus:bg-white bg-slate-50/50 font-bold text-center" />
                </div>
                <div className="space-y-2">
                  <input name="bairro" placeholder="Bairro" className="w-full p-5 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-[#C22973] focus:bg-white bg-slate-50/50 font-bold" />
                </div>
                <div className="space-y-2">
                  <input name="estado" placeholder="UF" required className="w-full p-5 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-[#C22973] focus:bg-white bg-slate-50/50 text-center uppercase font-black" maxLength={2} />
                </div>
              </div>
            </div>

            {/* INFO BOX */}
            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Info size={18} className="text-[#C22973]" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Ao prosseguir com o cadastro, você afirma estar ciente dos nossos <span className="text-slate-900 underline underline-offset-2 cursor-pointer">Termos de Uso</span> e <span className="text-slate-900 underline underline-offset-2 cursor-pointer">Política de Dados</span> sob conformidade com a LGPD.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#C22973] text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-pink-200/60 hover:bg-[#a62262] hover:shadow-pink-300 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 text-xs relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>Finalizar Cadastro Producer <Sparkles size={16} /></>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-[#C22973] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>
          
          <div className="mt-12 text-center">
             <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 italic">
               Linkah Systems &copy; 2026 - Secure Environment
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}