'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  Globe, ArrowLeft, Instagram, Facebook, 
  User, Building2, Calendar, Phone, 
  MapPin, Mail, Fingerprint, Info 
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const payload = { ...data, tipo: tipoPessoa };

    try {
    
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-api.onrender.com';

      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: '<span style="color: #C22973">🚀 Sucesso!</span>',
          text: 'Conta criada! Verifique seu e-mail para receber sua senha.',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'IR PARA LOGIN',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-[2.5rem]',
            confirmButton: 'rounded-xl px-10 py-4 font-black tracking-widest'
          }
        }).then((res) => {
          if (res.isConfirmed) router.push('/auth/login');
        });

      } else {
        Swal.fire({
          title: '<span style="color: #475569">Atenção</span>',
          text: result.message || 'Erro ao processar cadastro.',
          icon: 'warning',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'ENTENDI',
          customClass: {
            popup: 'rounded-[2.5rem]',
            confirmButton: 'rounded-xl px-10 py-4 font-bold'
          }
        });
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Swal.fire({
        title: 'Erro de Conexão',
        text: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        icon: 'error',
        confirmButtonColor: '#C22973'
      });
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
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6">
              <Globe className="text-[#C22973] w-10 h-10" />
            </div>
            <h2 className="text-5xl font-black text-white leading-tight mt-6">
              Crie sua conta e <span className="text-pink-200">comece a produzir.</span>
            </h2>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="flex-1 flex flex-col items-center bg-[#F0F2F5] px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-4xl bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-sm border border-slate-200">
          
          <form onSubmit={handleRegister} className="space-y-8">
            {/* SELETOR PF/PJ */}
            <div className="flex items-center gap-8 mb-4 border-b border-slate-100 pb-6">
              <button 
                type="button"
                onClick={() => setTipoPessoa('PF')}
                className={`flex items-center gap-3 font-bold transition-all ${tipoPessoa === 'PF' ? 'text-[#C22973] scale-105 border-b-2 border-[#C22973]' : 'text-slate-400'}`}
              >
                Pessoa Física
              </button>
              <button 
                type="button"
                onClick={() => setTipoPessoa('PJ')}
                className={`flex items-center gap-3 font-bold transition-all ${tipoPessoa === 'PJ' ? 'text-[#C22973] scale-105 border-b-2 border-[#C22973]' : 'text-slate-400'}`}
              >
                Pessoa Jurídica
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input required name="cpf_cnpj" type="text" placeholder={tipoPessoa === 'PF' ? "CPF" : "CNPJ"} className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
              </div>
              
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input required name="nome" type="text" placeholder={tipoPessoa === 'PF' ? "Nome completo" : "Nome do Responsável"} className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
              </div>

              {tipoPessoa === 'PJ' && (
                <div className="md:col-span-2 relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input required name="razao_social" type="text" placeholder="Razão Social" className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input required name="email" type="email" placeholder="E-mail" className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
              </div>

              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input required name="data_nascimento" type="date" className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50 text-slate-400" />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input required name="telefone" type="text" placeholder="Telefone" className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input required name="cep" type="text" placeholder="CEP" className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
              </div>

              <div className="md:col-span-2">
                <input required name="rua" type="text" placeholder="Endereço Completo" className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
              </div>

              <div className="grid grid-cols-3 col-span-2 gap-4">
                <input name="numero" placeholder="Nº" className="p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
                <input name="bairro" placeholder="Bairro" className="p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50" />
                <input name="estado" placeholder="UF" className="p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/50 text-center uppercase" maxLength={2} />
              </div>

              <div className="relative">
                <Instagram className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                <input name="instagram" placeholder="Instagram" className="w-full p-4 border border-slate-200 rounded-2xl outline-none bg-slate-50/50 focus:border-[#C22973]" />
              </div>
              <div className="relative">
                <Facebook className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                <input name="facebook" placeholder="Facebook" className="w-full p-4 border border-slate-200 rounded-2xl outline-none bg-slate-50/50 focus:border-[#C22973]" />
              </div>

              <div className="col-span-2">
                <textarea 
                  name="descricao" 
                  placeholder="Conte sobre sua trajetória em eventos..." 
                  className="w-full p-5 border border-slate-200 rounded-3xl outline-none focus:border-[#C22973] bg-slate-50/50 h-32 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-2xl text-[11px] text-pink-800 font-bold uppercase tracking-widest">
              <Info size={16} /> Verifique seu e-mail para receber sua senha inicial.
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-[#a62262] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processando..." : "Criar Conta Profissional"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}