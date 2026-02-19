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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação Inline (reage enquanto o usuário interage)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Se o usuário começar a digitar, removemos o erro para dar feedback positivo
    if (value.trim() !== "") {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Validação específica de formato em tempo real
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
    
    // Validação final de segurança
    const newErrors: Record<string, string> = {};
    const camposObrigatòrios = ["nome", "email", "cpf_cnpj", "senha", "data_nascimento", "telefone", "cep", "rua", "estado"];
    
    camposObrigatòrios.forEach(key => {
      if (!data[key]) newErrors[key] = "Obrigatório *";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      // Scroll suave para o primeiro erro
      const firstError = Object.keys(newErrors)[0];
      document.getElementsByName(firstError)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const payload = { ...data, tipo: tipoPessoa };

    try {
      const apiBaseUrl = 'https://linkah-api.onrender.com';
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '<span style="color: #C22973">🚀 Conta Criada!</span>',
          text: 'Seu cadastro foi realizado com sucesso.',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'ACESSAR MINHA CONTA',
          customClass: { popup: 'rounded-[2.5rem]' }
        }).then((res) => {
          if (res.isConfirmed) router.push('/auth/login');
        });
      } else {
        Swal.fire('Ops!', result.message || 'Erro ao cadastrar.', 'warning');
      }
    } catch (error) {
      Swal.fire('Erro', 'Não foi possível conectar ao servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans antialiased text-slate-900">
      
      {/* SIDEBAR */}
      <div className="hidden lg:flex w-[35%] bg-[#C22973] flex-col justify-between p-12 relative overflow-hidden sticky top-0 h-screen shadow-2xl">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10">
          <Link href="/auth/login" className="flex items-center gap-2 text-pink-100 hover:text-white transition-all mb-16 text-xs font-black uppercase tracking-[0.2em]">
            <ArrowLeft size={16} /> Voltar para Login
          </Link>
          <div className="flex flex-col gap-6">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6 transition-transform hover:rotate-0">
              <Globe className="text-[#C22973] w-10 h-10" />
            </div>
            <h2 className="text-5xl font-black text-white leading-tight mt-6">
              <span className="text-pink-200">Criar uma conta</span> <br/> e comece a produzir.
            </h2>
          </div>
        </div>
        <p className="relative z-10 text-pink-200/50 text-[10px] font-bold uppercase tracking-widest">Linkah Producer Hub v2.0</p>
      </div>

      {/* FORMULÁRIO */}
      <div className="flex-1 flex flex-col items-center bg-[#F0F2F5] px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-4xl bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-sm border border-slate-200">
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="flex items-center gap-8 mb-4 border-b border-slate-100 pb-6">
              <button type="button" onClick={() => setTipoPessoa('PF')} className={`font-black text-xs uppercase tracking-widest pb-2 transition-all ${tipoPessoa === 'PF' ? 'text-[#C22973] border-b-2 border-[#C22973]' : 'text-slate-400'}`}>Pessoa Física</button>
              <button type="button" onClick={() => setTipoPessoa('PJ')} className={`font-black text-xs uppercase tracking-widest pb-2 transition-all ${tipoPessoa === 'PJ' ? 'text-[#C22973] border-b-2 border-[#C22973]' : 'text-slate-400'}`}>Pessoa Jurídica</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* CPF / CNPJ */}
              <div className="flex flex-col">
                <div className="relative">
                  <Fingerprint className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.cpf_cnpj ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="cpf_cnpj" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder={`${tipoPessoa === 'PF' ? "CPF" : "CNPJ"} *`} 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.cpf_cnpj ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-medium`} 
                  />
                </div>
                {errors.cpf_cnpj && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.cpf_cnpj}</span>}
              </div>

              {/* NOME */}
              <div className="flex flex-col">
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.nome ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="nome" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder={`${tipoPessoa === 'PF' ? "Nome completo" : "Nome do Responsável"} *`} 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.nome ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-medium`} 
                  />
                </div>
                {errors.nome && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.nome}</span>}
              </div>

              {/* EMAIL */}
              <div className="flex flex-col md:col-span-2">
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="email" 
                    type="email" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="E-mail Corporativo *" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.email ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-medium`} 
                  />
                </div>
                {errors.email && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.email}</span>}
              </div>

              {/* SENHA */}
              <div className="flex flex-col md:col-span-2">
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.senha ? 'text-red-400' : 'text-slate-300'}`} size={20} />
                  <input 
                    name="senha" 
                    type="password" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="Crie sua senha de acesso (mín. 6 caracteres) *" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.senha ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200 focus:border-[#C22973] focus:ring-4 focus:ring-pink-50'} rounded-2xl outline-none bg-slate-50/50 transition-all font-medium`} 
                  />
                </div>
                {errors.senha && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.senha}</span>}
              </div>

              {/* DATA NASCIMENTO */}
              <div className="flex flex-col">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    name="data_nascimento" 
                    type="date" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.data_nascimento ? 'border-red-400' : 'border-slate-200 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 text-slate-500 font-medium transition-all`} 
                  />
                </div>
                {errors.data_nascimento && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.data_nascimento}</span>}
              </div>

              {/* TELEFONE */}
              <div className="flex flex-col">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    name="telefone" 
                    type="text" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="Telefone com DDD *" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.telefone ? 'border-red-400' : 'border-slate-200 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 transition-all font-medium`} 
                  />
                </div>
                {errors.telefone && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.telefone}</span>}
              </div>

              {/* CEP */}
              <div className="flex flex-col">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    name="cep" 
                    type="text" 
                    onChange={handleInputChange}
                    onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                    placeholder="CEP *" 
                    className={`w-full pl-12 pr-4 py-4 border ${errors.cep ? 'border-red-400' : 'border-slate-200 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 transition-all font-medium`} 
                  />
                </div>
                {errors.cep && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.cep}</span>}
              </div>

              {/* RUA */}
              <div className="flex flex-col md:col-span-2">
                <input 
                  name="rua" 
                  type="text" 
                  onChange={handleInputChange}
                  onBlur={(e) => validateFieldOnBlur(e.target.name, e.target.value)} 
                  placeholder="Endereço Completo (Rua, Avenida...) *" 
                  className={`w-full p-4 border ${errors.rua ? 'border-red-400' : 'border-slate-200 focus:border-[#C22973]'} rounded-2xl outline-none bg-slate-50/50 transition-all font-medium`} 
                />
                {errors.rua && <span className="text-red-500 text-[10px] font-black mt-1 ml-2 uppercase italic">{errors.rua}</span>}
              </div>

              {/* COMPLEMENTOS */}
              <div className="grid grid-cols-3 col-span-2 gap-4">
                <input name="numero" placeholder="Nº" className="p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50 font-medium" />
                <input name="bairro" placeholder="Bairro" className="p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50 font-medium" />
                <input name="estado" placeholder="UF" required className="p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50 text-center uppercase font-bold" maxLength={2} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-2xl text-[11px] text-[#C22973] font-black uppercase tracking-widest border border-pink-100">
              <Info size={16} /> Verifique seus dados antes de confirmar.
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-pink-100 hover:bg-[#a62262] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Criar Minha Conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}