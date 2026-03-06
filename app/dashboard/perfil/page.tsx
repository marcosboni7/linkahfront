'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  UserCircle, Save, Loader2, ArrowLeft, Info, 
  MapPin, CreditCard, ExternalLink, CheckCircle2, AlertCircle, Mail
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

interface StripeDetails {
  charges_enabled: boolean;
  payouts_enabled: boolean;
  business_name: string;
  email_stripe: string;
  status_banco: string;
}

function PerfilContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeAtivo, setStripeAtivo] = useState(false);
  const [stripeDetails, setStripeDetails] = useState<StripeDetails | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: ''
  });

  const checarStatusStripe = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/pagamento/status-stripe?email=${email}`);
      const data = await res.json();
      
      if (data.conectado) {
        setStripeAtivo(data.charges_enabled);
        setStripeDetails({
          charges_enabled: data.charges_enabled,
          payouts_enabled: data.payouts_enabled,
          business_name: data.business_name,
          email_stripe: data.email_stripe,
          status_banco: data.status_banco
        });

        if (searchParams.get('stripe_callback') === 'true' && data.charges_enabled) {
          Swal.fire({
            title: 'CONTA ATIVADA!',
            text: 'Sua conta Stripe foi vinculada e está pronta para receber vendas.',
            icon: 'success',
            confirmButtonColor: '#FF4D4D'
          });
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status Stripe:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    const carregarDados = async () => {
      const userStorage = localStorage.getItem('@Linkah:User');
      const emailLogado = userStorage ? JSON.parse(userStorage).email : localStorage.getItem('userEmail');
      const token = localStorage.getItem('@Linkah:Token');
      
      if (!emailLogado) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/perfil?email=${emailLogado}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok && data) {
          setFormData({
            nome: data.nome || '',
            cpf_cnpj: data.cpf_cnpj || '',
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            bairro: data.bairro || ''
          });
          
          setStripeAccountId(data.stripe_account_id || null);

          if (data.stripe_account_id) {
            await checarStatusStripe(emailLogado);
          }

          if (data.cpf_cnpj && data.cep) {
            localStorage.setItem('perfil_completo', 'true');
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [router, checarStatusStripe]);

  const handleConectarStripe = async () => {
    setIsSaving(true);
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const emailLogado = userStorage ? JSON.parse(userStorage).email : localStorage.getItem('userEmail');
      
      const response = await fetch(`${API_URL}/api/pagamento/conectar-stripe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogado }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        Swal.fire('Erro', 'Não foi possível gerar o link do Stripe.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Falha na conexão com o servidor de pagamentos.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro }));
          setErrors(prev => ({ ...prev, cep: "" }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = "Obrigatório";
    if (!formData.cpf_cnpj) newErrors.cpf_cnpj = "Obrigatório";
    if (!formData.cep) newErrors.cep = "Obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    const userStorage = localStorage.getItem('@Linkah:User');
    const emailLogado = userStorage ? JSON.parse(userStorage).email : localStorage.getItem('userEmail');
    const token = localStorage.getItem('@Linkah:Token');

    try {
      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email_original: emailLogado, ...formData }),
      });

      if (response.ok) {
        localStorage.setItem('perfil_completo', 'true');
        localStorage.setItem('userName', formData.nome);
        await Swal.fire({
          title: 'DADOS ATUALIZADOS!',
          text: 'Suas informações foram sincronizadas.',
          icon: 'success',
          confirmButtonColor: '#FF4D4D'
        });
        router.push('/dashboard/eventos');
      }
    } catch (error) {
      Swal.fire('Erro', 'Erro ao salvar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Sincronizando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans">
      <div className="max-w-[850px] mx-auto">
        <Link href="/dashboard/eventos" className="inline-flex items-center gap-3 text-slate-400 hover:text-[#FF4D4D] transition-all mb-10 font-black text-[10px] tracking-[0.2em] uppercase group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Dashboard
        </Link>

        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-red-100/20 p-8 md:p-16 border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-bl-[5rem] -z-0"></div>

          <div className="flex items-center gap-6 mb-16 relative z-10">
            <div className="w-20 h-20 bg-[#030712] rounded-[2rem] flex items-center justify-center shadow-lg shadow-slate-200">
              <UserCircle className="text-white" size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tighter italic uppercase">Meu Perfil</h2>
              <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest italic">Configurações de Produtor & Pagamentos</p>
            </div>
          </div>
          
          <form onSubmit={handleSalvar} className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className={`text-[11px] font-black uppercase tracking-[0.2em] block ml-1 ${errors.nome ? 'text-red-500' : 'text-slate-400'}`}>Nome do Responsável *</label>
                <input name="nome" value={formData.nome} onChange={handleChange} className={`w-full border-2 p-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-sm ${errors.nome ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50/50 focus:border-[#FF4D4D] focus:bg-white'}`} />
              </div>
              <div className="space-y-3">
                <label className={`text-[11px] font-black uppercase tracking-[0.2em] block ml-1 ${errors.cpf_cnpj ? 'text-red-500' : 'text-slate-400'}`}>Documento (CPF/CNPJ) *</label>
                <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} placeholder="000.000.000-00" className={`w-full border-2 p-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 shadow-sm ${errors.cpf_cnpj ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50/50 focus:border-[#FF4D4D] focus:bg-white'}`} />
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-8">
                <MapPin size={18} className="text-[#FF4D4D]" />
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] italic">Endereço de Faturamento</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-1 space-y-3">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] ml-1">CEP *</label>
                  <input name="cep" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} className={`w-full border-2 p-5 rounded-[1.5rem] outline-none transition-all font-bold text-slate-700 ${errors.cep ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50/50 focus:border-[#FF4D4D]'}`} />
                </div>
                <div className="col-span-2 space-y-3">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] ml-1">Logradouro *</label>
                  <input name="rua" value={formData.rua} onChange={handleChange} className="w-full border-2 border-slate-50 p-5 rounded-[1.5rem] outline-none focus:border-[#FF4D4D] bg-slate-50/50 font-bold text-slate-700" />
                </div>
                <div className="col-span-1 space-y-3">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] ml-1">Nº</label>
                  <input name="numero" value={formData.numero} onChange={handleChange} className="w-full border-2 border-slate-50 p-5 rounded-[1.5rem] outline-none focus:border-[#FF4D4D] bg-slate-50/50 font-bold text-slate-700 text-center" />
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-8">
                <CreditCard size={18} className="text-[#FF4D4D]" />
                <h3 className="text-slate-900 font-black text-xs uppercase tracking-[0.3em] italic">Configuração de Recebimentos</h3>
              </div>

              {stripeAtivo && stripeDetails ? (
                <div className="bg-emerald-50/50 border-2 border-emerald-100 p-8 rounded-[2.5rem] space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-emerald-900 font-black uppercase text-[10px] tracking-widest leading-none">
                          {stripeDetails.business_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-emerald-700/60 font-bold text-[9px] uppercase tracking-tighter">
                          <Mail size={10} />
                          {stripeDetails.email_stripe}
                        </div>
                        <p className="text-slate-500 font-bold text-[9px] mt-1 italic uppercase">Vínculo estabelecido com sucesso</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-50">ATIVO</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-emerald-100/50">
                    <div className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl border border-emerald-50">
                        <div className={`w-2 h-2 rounded-full ${stripeDetails.charges_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Vendas: {stripeDetails.charges_enabled ? 'Habilitadas' : 'Bloqueadas'}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl border border-emerald-50">
                        <div className={`w-2 h-2 rounded-full ${stripeDetails.payouts_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Saques: {stripeDetails.payouts_enabled ? 'Liberados' : 'Em Verificação'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-2">
                        {stripeAccountId ? <AlertCircle className="text-amber-500" size={18} /> : null}
                        <p className="text-slate-700 font-black text-sm italic uppercase">
                         {stripeAccountId ? "Pendência no Cadastro" : "Vincule sua conta bancária"}
                        </p>
                    </div>
                    <p className="text-slate-400 font-medium text-[11px] leading-relaxed uppercase tracking-tight">
                      {stripeAccountId 
                        ? "Sua conta foi criada, mas faltam documentos ou informações para liberar as vendas no Stripe."
                        : "Para vender e receber via Pix ou Cartão, conecte ao Stripe. Nós retemos apenas 5% de taxa."}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleConectarStripe}
                    className="bg-[#030712] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    <ExternalLink size={16} /> {stripeAccountId ? "Concluir Onboarding" : "Configurar Recebimentos"}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-red-50/30 p-8 rounded-[2.5rem] flex gap-5 items-center border border-red-100/50">
              <Info className="text-[#FF4D4D] shrink-0" size={24} />
              <p className="text-[11px] text-red-900 font-bold uppercase tracking-tight leading-relaxed">
                Dados completos e conta Stripe configurada garantem que o dinheiro dos eventos caia na sua conta sem atrasos.
              </p>
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-[#FF4D4D] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 hover:bg-[#e64545] transition-all shadow-2xl shadow-red-200 disabled:opacity-50 active:scale-95 group">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={22} className="group-hover:rotate-12 transition-transform" />} 
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4 font-sans">
        <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Carregando Painel...</span>
      </div>
    }>
      <PerfilContent />
    </Suspense>
  );
}