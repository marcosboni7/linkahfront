'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserCircle,
  Save,
  Loader2,
  ArrowLeft,
  MapPin,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';

interface StripeDetails {
  charges_enabled: boolean;
  payouts_enabled: boolean;
  business_name: string;
  email_stripe: string;
  status_banco: string;
}

interface FormDataState {
  nome: string;
  cpf_cnpj: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
}

function PerfilContent() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeAtivo, setStripeAtivo] = useState(false);
  const [stripeDetails, setStripeDetails] = useState<StripeDetails | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    nome: '',
    cpf_cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    bairro',
  });

  const getUsuarioLogado = () => {
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const parsedUser = userStorage ? JSON.parse(userStorage) : null;
      const emailLogado = parsedUser?.email || localStorage.getItem('userEmail') || '';
      const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '') || '';

      return {
        userStorage,
        parsedUser,
        emailLogado,
        token,
      };
    } catch (error) {
      console.error('❌ Erro ao ler usuário do localStorage:', error);
      return {
        userStorage: null,
        parsedUser: null,
        emailLogado: '',
        token: '',
      };
    }
  };

  const aplicarMascara = (name: string, value: string) => {
    let v = value.replace(/\D/g, '');

    if (name === 'cpf_cnpj') {
      if (v.length <= 11) {
        return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
      } else {
        return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5');
      }
    }

    if (name === 'cep') {
      return v.replace(/(\d{5})(\d{3})/g, '$1-$2');
    }

    return value;
  };

  const checarStatusStripe = useCallback(
    async (email: string) => {
      try {
        console.log('🔎 Checando status Stripe para:', email);

        const res = await fetch(`${API_URL}/api/pagamento/status-stripe?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        const raw = await res.text();
        console.log('📄 Resposta bruta status-stripe:', raw);

        let data: any = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = { raw };
        }

        console.log('📦 JSON status-stripe:', data);

        if (!res.ok) {
          console.error('❌ Erro ao verificar status Stripe:', data);
          return;
        }

        if (data.conectado) {
          setStripeAtivo(Boolean(data.charges_enabled));
          setStripeDetails({
            charges_enabled: Boolean(data.charges_enabled),
            payouts_enabled: Boolean(data.payouts_enabled),
            business_name: data.business_name || 'Conta Vinculada',
            email_stripe: data.email_stripe || '',
            status_banco: data.status_banco || 'Pendente',
          });

          if (searchParams.get('stripe_callback') === 'true' && data.charges_enabled) {
            Swal.fire({
              title: 'CONTA ATIVADA!',
              text: 'Sua conta Stripe foi vinculada e está pronta para faturar.',
              icon: 'success',
              confirmButtonColor: '#FF4D4D',
              customClass: { popup: 'rounded-[2.5rem]' },
            });
          }
        } else {
          setStripeAtivo(false);
          setStripeDetails(null);
        }
      } catch (error) {
        console.error('❌ Erro Stripe Status:', error);
      }
    },
    [searchParams]
  );

  useEffect(() => {
    const carregarDados = async () => {
      const { emailLogado, token } = getUsuarioLogado();

      console.log('🧪 emailLogado carregarDados:', emailLogado);
      console.log('🧪 token carregarDados:', token);

      if (!emailLogado) {
        router.push('/site/login');
        return;
      }

      try {
        const headers: Record<string, string> = {
          Accept: 'application/json',
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });

        const raw = await response.text();
        console.log('📄 Resposta bruta perfil:', raw);

        let data: any = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = { raw };
        }

        console.log('📦 JSON perfil:', data);

        if (response.ok && data) {
          setFormData({
            nome: data.nome || '',
            cpf_cnpj: data.cpf_cnpj || '',
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
          });

          setStripeAccountId(data.stripe_account_id || null);

          if (data.stripe_account_id) {
            await checarStatusStripe(emailLogado);
          }
        } else {
          console.error('❌ Erro ao carregar perfil:', data);
        }
      } catch (error) {
        console.error('❌ Erro carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [router, checarStatusStripe]);

  const handleConectarStripe = async () => {
    setIsSaving(true);

    try {
      const { userStorage, emailLogado, token } = getUsuarioLogado();

      console.log('🧪 userStorage:', userStorage);
      console.log('🧪 userEmail:', localStorage.getItem('userEmail'));
      console.log('🧪 emailLogado:', emailLogado);
      console.log('🧪 token:', token);

      if (!emailLogado) {
        Swal.fire('Erro', 'Nenhum email encontrado para conectar o Stripe.', 'error');
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/pagamento/conectar-stripe`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ email: emailLogado }),
      });

      console.log('📡 Status conectar-stripe:', response.status);

      const raw = await response.text();
      console.log('📄 Resposta bruta Stripe:', raw);

      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }

      console.log('📦 JSON Stripe:', data);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || data?.details || `Erro HTTP ${response.status}`);
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('A API não retornou a URL do onboarding Stripe.');
    } catch (error: any) {
      console.error('❌ Erro conectar Stripe:', error);
      Swal.fire('Erro', error?.message || 'Falha ao conectar com Stripe.', 'error');
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
          setFormData((prev) => ({
            ...prev,
            rua: data.logradouro || prev.rua,
            bairro: data.bairro || prev.bairro,
          }));
        }
      } catch (err) {
        console.error('❌ Erro ao buscar CEP:', err);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: aplicarMascara(name, value),
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { emailLogado, token } = getUsuarioLogado();

    try {
      if (!emailLogado) {
        Swal.fire('Erro', 'Nenhum email encontrado para salvar o perfil.', 'error');
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          email_original: emailLogado,
          ...formData,
        }),
      });

      const raw = await response.text();
      console.log('📄 Resposta bruta salvar perfil:', raw);

      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { raw };
      }

      console.log('📦 JSON salvar perfil:', data);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Erro ao salvar perfil.');
      }

      localStorage.setItem('perfil_completo', JSON.stringify({
        email: emailLogado,
        ...formData,
      }));

      Swal.fire({
        title: 'SUCESSO!',
        text: 'Perfil sincronizado.',
        icon: 'success',
        confirmButtonColor: '#FF4D4D',
        customClass: { popup: 'rounded-[2rem]' },
      });

      router.push('/dashboard/eventos');
    } catch (error: any) {
      console.error('❌ Erro ao salvar perfil:', error);
      Swal.fire('Erro', error?.message || 'Erro ao salvar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
          <Zap
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF4D4D]"
            size={16}
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
          Sincronizando Dados...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans">
      <div className="max-w-[850px] mx-auto">
        <Link
          href="/dashboard/eventos"
          className="inline-flex items-center gap-3 text-slate-400 hover:text-[#FF4D4D] transition-all mb-10 font-black text-[10px] tracking-[0.2em] uppercase group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao Painel
        </Link>

        <div className="bg-white rounded-[4rem] shadow-2xl shadow-red-100/30 p-8 md:p-20 border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-50/50 to-transparent rounded-bl-[8rem] -z-0" />

          <div className="flex items-center gap-8 mb-20 relative z-10">
            <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-300 relative group">
              <UserCircle className="text-white group-hover:scale-110 transition-transform" size={48} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FF4D4D] rounded-2xl flex items-center justify-center border-4 border-white">
                <ShieldCheck className="text-white" size={18} />
              </div>
            </div>

            <div>
              <h2 className="text-5xl font-black text-slate-900 leading-none tracking-tighter italic uppercase">
                Meu Perfil
              </h2>
              <p className="text-slate-400 mt-3 font-bold uppercase text-[11px] tracking-[0.25em] italic flex items-center gap-2">
                <Zap size={14} className="text-[#FF4D4D]" />
                Identidade do Produtor & Checkout
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvar} className="space-y-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label
                  className={`text-[11px] font-black uppercase tracking-[0.2em] block ml-2 ${
                    errors.nome ? 'text-red-500' : 'text-slate-400'
                  }`}
                >
                  Nome Completo / Social *
                </label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] focus:bg-white transition-all font-bold text-slate-800 shadow-sm text-sm"
                  placeholder="Ex: João Silva Eventos"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block ml-2 text-slate-400">
                  CPF ou CNPJ *
                </label>
                <input
                  name="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={handleChange}
                  maxLength={18}
                  className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] focus:bg-white transition-all font-bold text-slate-800 shadow-sm text-sm"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="pt-16 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-red-50 text-[#FF4D4D] rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.3em] italic">
                  Localização de Faturamento
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-1 space-y-4">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">
                    CEP
                  </label>
                  <input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    onBlur={handleCepBlur}
                    maxLength={9}
                    className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] font-bold text-slate-800 text-center"
                  />
                </div>

                <div className="col-span-2 space-y-4">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">
                    Rua / Avenida
                  </label>
                  <input
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                    className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] font-bold text-slate-800"
                  />
                </div>

                <div className="col-span-1 space-y-4">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">
                    Nº
                  </label>
                  <input
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] font-bold text-slate-800 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="pt-16 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.3em] italic">
                  Gestão de Recebíveis (Stripe)
                </h3>
              </div>

              {stripeAtivo && stripeDetails ? (
                <div className="bg-emerald-50/30 border-2 border-emerald-100 p-10 rounded-[3rem] relative group hover:bg-emerald-50/50 transition-all">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-200 animate-pulse">
                        <CheckCircle2 size={32} />
                      </div>

                      <div>
                        <p className="text-emerald-950 font-black uppercase text-[12px] tracking-[0.1em]">
                          {stripeDetails.business_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-emerald-700/70 font-bold text-[10px] uppercase">
                          <Mail size={12} /> {stripeDetails.email_stripe}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="px-5 py-2 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        CONTA ATIVA
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                    <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-500 uppercase italic">
                        Vendas via Pix/Card
                      </span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                        Habilitado
                      </span>
                    </div>

                    <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-500 uppercase italic">
                        Saques Automáticos
                      </span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                        Liberado
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-10">
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 shrink-0 shadow-sm">
                      {stripeAccountId ? (
                        <AlertCircle className="text-amber-500" size={28} />
                      ) : (
                        <Zap size={28} />
                      )}
                    </div>

                    <div>
                      <p className="text-slate-900 font-black text-base italic uppercase tracking-tight">
                        {stripeAccountId ? 'Pendência de Verificação' : 'Habilitar Recebimentos'}
                      </p>
                      <p className="text-slate-400 font-bold text-[11px] leading-relaxed uppercase tracking-tight mt-1 max-w-sm">
                        {stripeAccountId
                          ? 'Faltam documentos ou dados bancários no painel do Stripe para liberar suas vendas.'
                          : 'Conecte sua conta para aceitar Pix e Cartão. Taxa fixa de 5% por ticket vendido.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConectarStripe}
                    className="bg-slate-950 text-white px-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#FF4D4D] transition-all shadow-xl active:scale-95 group"
                  >
                    <ExternalLink
                      size={18}
                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                    {stripeAccountId ? 'Concluir Cadastro' : 'Configurar Agora'}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#FF4D4D] text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-5 hover:bg-slate-950 transition-all shadow-2xl shadow-red-200 hover:shadow-slate-300 disabled:opacity-50 active:scale-[0.98] group"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Save size={24} className="group-hover:rotate-12 transition-transform" />
              )}
              Atualizar Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4">
          <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
        </div>
      }
    >
      <PerfilContent />
    </Suspense>
  );
}