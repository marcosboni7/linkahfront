'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  Globe, ArrowLeft, User, Mail, 
  Fingerprint, Info, Lock, Calendar, 
  Phone, MapPin, Loader2 
} from 'lucide-react';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://r8amtavirp.us-east-1.awsapprunner.com';

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
      document.getElementsByName(firstError)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          text: 'Seu acesso ao Producer Hub foi liberado.',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'ACESSAR MINHA CONTA',
          customClass: { popup: 'rounded-[3rem] border-none' }
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
      
      {/* SIDEBAR PERSISTENTE */}
      <div className="hidden lg:flex w-[35%] bg-[#C22973] flex-col justify-between p-12 relative overflow-hidden sticky top-0 h-screen shadow-2xl">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10">
          <Link href="/auth/login" className="flex items-center gap-2 text-pink-100 hover:text-white transition-all mb-16 text-[10px] font-black uppercase tracking-[0.3em]">
            <ArrowLeft size={14} /> Voltar para Login
          </Link>
          <div className="flex flex-col gap-6">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <Globe className="text-[#C22973] w-10 h-10" />
            </div>
            <h2 className="text-5xl font-black text-white leading-[1.1] mt-6 italic uppercase tracking-tighter">
              <span className="text-pink-300">Crie sua conta</span> <br/> e escale sua <br/> produção.
            </h2>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4 text-pink-200/40 text-[9px] font-black uppercase tracking-widest">
            <span>Linkah AWS Cloud</span>
            <span className="w-1 h-1 bg-pink-200/20 rounded-full" />
            <span>v2.1.0</span>
        </div>
      </div>

      {/* ÁREA DO FORMULÁRIO */}
      <div className="flex-1 flex flex-col items-center bg-[#F0F2F5] px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-4xl bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
          
          <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Cadastro de Produtor</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Preencha os dados da sua organização</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="flex items-center gap-8 mb-4 border-b border-slate-100 pb-6">
              <button type="button" onClick={() => setTipoPessoa('PF')} className={`font-black text-[10px] uppercase tracking-[0.2em] pb-3 transition-all ${tipoPessoa === 'PF' ? 'text-[#C22973] border-b-2 border-[#C22973]' : 'text-slate-300 hover:text-slate-400'}`}>Pessoa Física</button>
              <button type="button" onClick={() => setTipoPessoa('PJ')} className={`font-black text-[10px] uppercase tracking-[0.2em] pb-3 transition-all ${tipoPessoa === 'PJ' ? 'text-[#C22973] border-b-2 border-[#C22973]' : 'text-slate-300 hover:text-slate-400'}`}>Pessoa Jurídica</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DOCUMENTO */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Documento Principal</label>
                <div className="relative">
                  <Fingerprint className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.cpf_cnpj ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="cpf_cnpj" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder={tipoPessoa === 'PF' ? "000.000.000-00" : "00.000.000/0000-00"} 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.cpf_cnpj ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-bold placeholder:text-slate-200`} 
                  />
                </div>
                {errors.cpf_cnpj && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.cpf_cnpj}</span>}
              </div>

              {/* NOME */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Nome Completo/Razão</label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.nome ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="nome" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="Ex: João Silva ou Eventos LTDA" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.nome ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-bold placeholder:text-slate-200`} 
                  />
                </div>
                {errors.nome && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.nome}</span>}
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">E-mail para Acesso</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="email" 
                    type="email" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="nome@empresa.com" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.email ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-bold placeholder:text-slate-200`} 
                  />
                </div>
                {errors.email && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.email}</span>}
              </div>

              {/* SENHA */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Senha de Segurança</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.senha ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="senha" 
                    type="password" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="Mínimo 6 caracteres" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.senha ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-100 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-bold placeholder:text-slate-200`} 
                  />
                </div>
                {errors.senha && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.senha}</span>}
              </div>

              {/* DATA NASCIMENTO */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Data de Nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    name="data_nascimento" 
                    type="date" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.data_nascimento ? 'border-red-400' : 'border-slate-100 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 text-slate-500 font-bold transition-all`} 
                  />
                </div>
                {errors.data_nascimento && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.data_nascimento}</span>}
              </div>

              {/* TELEFONE */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    name="telefone" 
                    type="text" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="(00) 00000-0000" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.telefone ? 'border-red-400' : 'border-slate-100 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 transition-all font-bold placeholder:text-slate-200`} 
                  />
                </div>
                {errors.telefone && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.telefone}</span>}
              </div>

              {/* CEP */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">CEP</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    name="cep" 
                    type="text" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="00000-000" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.cep ? 'border-red-400' : 'border-slate-100 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 transition-all font-bold placeholder:text-slate-200`} 
                  />
                </div>
                {errors.cep && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.cep}</span>}
              </div>

              {/* RUA */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Logradouro</label>
                <input 
                  name="rua" 
                  type="text" 
                  onChange={handleInputChange}
                  onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                  placeholder="Rua, Avenida, Praça..." 
                  className={`w-full p-4 border ${errors.rua ? 'border-red-400' : 'border-slate-100 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 transition-all font-bold placeholder:text-slate-200`} 
                />
                {errors.rua && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic tracking-tighter">{errors.rua}</span>}
              </div>

              {/* COMPLEMENTOS */}
              <div className="grid grid-cols-3 col-span-2 gap-4">
                <input name="numero" placeholder="Nº" className="p-4 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 bg-slate-50/50 font-bold placeholder:text-slate-200" />
                <input name="bairro" placeholder="Bairro" className="p-4 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 bg-slate-50/50 font-bold placeholder:text-slate-200" />
                <input name="estado" placeholder="UF" required className="p-4 border border-slate-100 rounded-2xl outline-none focus:border-[#C22973] focus:ring-4 focus:ring-pink-50 bg-slate-50/50 text-center uppercase font-black" maxLength={2} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-[2rem] text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border border-slate-100">
              <Info size={16} className="text-[#C22973]" /> Ao clicar em criar conta, você concorda com nossos termos.
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#C22973] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-pink-200/50 hover:bg-[#a62262] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 text-xs"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Criar Minha Conta Producer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}