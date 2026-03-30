'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  User, Mail, Fingerprint, Lock, 
  Loader2, Sparkles, ChevronLeft,
  MapPin, Phone, Calendar, Hash
} from 'lucide-react';

const API_URL_BASE = 'https://linkah-back.onrender.com';

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
      if (!data[key]) newErrors[key] = "Obrigatório";
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
        body: JSON.stringify({ ...data, tipo: tipoPessoa, perfil: 'produtor' }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '<span style="font-family: sans-serif; font-weight: 900; font-style: italic;">SISTEMA ATUALIZADO</span>',
          text: 'Sua conta de produtor foi provisionada com sucesso.',
          icon: 'success',
          confirmButtonColor: '#000',
          customClass: { popup: 'rounded-[3rem]' }
        }).then(() => router.push('/auth/login'));
      } else {
        Swal.fire({
          title: 'Atenção',
          text: result.message || 'Dados conflitantes no banco de dados.',
          icon: 'warning',
          confirmButtonColor: '#000',
          customClass: { popup: 'rounded-[3rem]' }
        });
      }
    } catch (error) {
      Swal.fire('Erro Crítico', 'Falha de comunicação com o cluster AWS.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-[#1D1D1F]">
      
      {/* LADO ESQUERDO: BRANDING (FIXO) */}
      <div className="hidden lg:flex w-[40%] relative overflow-hidden bg-black sticky top-0 h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale-[0.5]"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1514525253361-bee1455670f2?q=80&w=1964&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <div className="text-3xl font-black tracking-tighter text-white italic">
            LINKAH<span className="text-[#FF4D4D]">.</span>
          </div>

          <div className="max-w-xs">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
               <span className="w-2 h-2 bg-[#FF4D4D] rounded-full shadow-[0_0_10px_#FF4D4D]" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Identity Provisioning</span>
            </div>
            <h1 className="text-7xl font-black text-white leading-none tracking-tighter mb-8 italic uppercase">
              Crie o <br/><span className="text-[#FF4D4D]">Futuro.</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed">
              Sua infraestrutura para eventos começa com uma conta de produtor oficial.
            </p>
          </div>

          <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
            Protocol Linkah-256 © 2026
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO (SCROLLABLE) */}
      <div className="flex-1 flex flex-col items-center bg-white px-6 py-16 lg:px-24">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <Link href="/auth/login" className="group flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-12">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Acesso
          </Link>

          <header className="mb-14">
            <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter mb-3 text-shadow-sm">Cadastro</h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-tight">Preencha os dados do responsável</p>
          </header>

          <form onSubmit={handleRegister} className="space-y-10">
            
            {/* TOGGLE TIPO DE PESSOA */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Natureza Jurídica</span>
              <div className="flex p-1.5 bg-gray-50 rounded-[2rem] w-full border border-gray-100 shadow-inner">
                <button 
                  type="button" 
                  onClick={() => setTipoPessoa('PF')} 
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${tipoPessoa === 'PF' ? 'bg-white text-black shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Pessoa Física
                </button>
                <button 
                  type="button" 
                  onClick={() => setTipoPessoa('PJ')} 
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${tipoPessoa === 'PJ' ? 'bg-white text-black shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Pessoa Jurídica
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              
              {/* NOME */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nome ou Razão</label>
                  {errors.nome && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter italic animate-bounce">! {errors.nome}</span>}
                </div>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input name="nome" onChange={handleInputChange} placeholder="Nome Completo" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black" />
                </div>
              </div>

              {/* CPF/CNPJ */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}</label>
                  {errors.cpf_cnpj && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter italic animate-bounce">! {errors.cpf_cnpj}</span>}
                </div>
                <div className="relative group">
                  <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input name="cpf_cnpj" onChange={handleInputChange} placeholder="000.000.000-00" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black" />
                </div>
              </div>

              {/* E-MAIL */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">E-mail Corporativo</label>
                  {errors.email && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter italic animate-bounce">! {errors.email}</span>}
                </div>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input name="email" type="email" onChange={handleInputChange} placeholder="exemplo@linkah.com" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black" />
                </div>
              </div>

              {/* SENHA */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Chave de Acesso</label>
                  {errors.senha && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter italic animate-bounce">! {errors.senha}</span>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input name="senha" type="password" onChange={handleInputChange} placeholder="Mínimo 6 caracteres" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black" />
                </div>
              </div>

              {/* DATA E TELEFONE */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Nascimento</label>
                <div className="relative group">
                   <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                   <input name="data_nascimento" type="date" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white outline-none font-bold text-gray-500 focus:text-black transition-all" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Telefone / WhatsApp</label>
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input name="telefone" placeholder="(00) 90000-0000" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black focus:ring-8 focus:ring-gray-50 outline-none transition-all font-bold text-black" />
                </div>
              </div>

              {/* ENDEREÇO RÁPIDO */}
              <div className="md:col-span-2 grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Logradouro Principal</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                    <input name="rua" placeholder="Rua, Av ou Alameda" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black outline-none transition-all font-bold text-black" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1 text-center block">UF</label>
                  <input name="estado" placeholder="SP" maxLength={2} className="w-full py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black outline-none font-black text-center uppercase transition-all" />
                </div>
              </div>

              {/* CEP (Oculto ou Adicional conforme necessidade, mas mantendo o campo que você pediu) */}
              <div className="md:col-span-2 space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Código Postal (CEP)</label>
                 <div className="relative group">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                    <input name="cep" placeholder="00000-000" className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-black outline-none font-bold transition-all" />
                 </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              disabled={isLoading}
              className="w-full bg-[#030712] text-white py-7 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-[#FF4D4D]" />
              ) : (
                <>Provisionar Conta de Produtor <Sparkles size={20} className="text-[#FF4D4D]" /></>
              )}
            </button>
          </form>

          <footer className="mt-16 mb-20 pt-8 border-t border-gray-50 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              Já faz parte da rede? <Link href="/auth/login" className="text-black hover:text-[#FF4D4D] transition-colors ml-2 underline decoration-gray-200 underline-offset-4">Acessar Painel</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}