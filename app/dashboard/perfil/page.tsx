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
  Instagram,
  Linkedin,
  AlignLeft,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';

interface StripeDetails {
  charges_enabled: boolean;
  payout_enabled: boolean;
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
  linkedin: string;
  instagram: string;
  bio: string;
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
    bairro: '',
    linkedin: '',
    instagram: '',
    bio: '',
  });

  const getUsuarioLogado = useCallback(() => {
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
  }, []);

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

  const perfilJaCompleto = useCallback((data: Partial<FormDataState>) => {
    return Boolean(
      data?.nome?.trim() &&
      data?.cpf_cnpj?.trim() &&
      data?.cep?.trim() &&
      data?.rua?.trim() &&
      data?.numero?.trim()
    );
  }, []);

  const checarStatusStripe = useCallback(
    async (email: string) => {
      try {
        console.log('🔎 Checando status Stripe para:', email);
        const res = await fetch(`${API_URL}/api/pagamento/status-stripe?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) return;

        const data = await res.json();
        console.log('📦 Status Stripe atualizado:', data);

        if (data.conectado) {
          const estaRealmenteAtivo =
            data.status_banco === 'Ativo' && Boolean(data.charges_enabled);

          setStripeAtivo(estaRealmenteAtivo);
          setStripeDetails({
            charges_enabled: Boolean(data.charges_enabled),
            payout_enabled: Boolean(data.payout_enabled),
            business_name: data.business_name || 'Conta em Verificação',
            email_stripe: data.email_stripe || email,
            status_banco: data.status_banco || 'Pendente',
          });

          if (searchParams.get('stripe_callback') === 'true' && estaRealmenteAtivo) {
            Swal.fire({
              title: 'CONTA ATIVADA!',
              text: 'Sua conta Stripe foi vinculada e está pronta para faturar.',
              icon: 'success',
              confirmButtonColor: '#FF4D4D',
              customClass: { popup: 'rounded-[2.5rem]' },
            });
          }
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

      if (!emailLogado) {
        router.push('/site/login');
        return;
      }

      try {
        const autoRedirect = searchParams.get('auto') === '1';
        const perfilCompletoLocal = localStorage.getItem('perfil_completo');

        if (autoRedirect && perfilCompletoLocal === 'true') {
          router.replace('/dashboard/eventos');
          return;
        }

        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();

          const dadosPerfil = {
            nome: data.nome || '',
            cpf_cnpj: data.cpf_cnpj || '',
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
            linkedin: data.linkedin || '',
            instagram: data.instagram || '',
            bio: data.bio || '',
          };

          setFormData(dadosPerfil);

          if (perfilJaCompleto(dadosPerfil)) {
            localStorage.setItem('perfil_completo', 'true');
            if (autoRedirect) {
              router.replace('/dashboard/eventos');
              return;
            }
          }

          setStripeAccountId(data.stripe_account_id || null);
          if (data.stripe_account_id) {
            await checarStatusStripe(emailLogado);
          }
        }
      } catch (error) {
        console.error('❌ Erro carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [router, checarStatusStripe, getUsuarioLogado, perfilJaCompleto, searchParams]);

  const handleConectarStripe = async () => {
    setIsSaving(true);
    try {
      const { emailLogado, token } = getUsuarioLogado();

      if (!emailLogado) {
        Swal.fire('Erro', 'Nenhum email encontrado.', 'error');
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/pagamento/conectar-stripe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: emailLogado }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao conectar Stripe');
      if (data.url) window.location.href = data.url;
    } catch (error: any) {
      Swal.fire('Erro', error.message, 'error');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const valueFinal =
      name === 'cpf_cnpj' || name === 'cep'
        ? aplicarMascara(name, value)
        : value;

    setFormData((prev) => ({ ...prev, [name]: valueFinal }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { emailLogado, token, userStorage, parsedUser } = getUsuarioLogado();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ email_original: emailLogado, ...formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar');
      }

      // ✅ marca perfil completo
      localStorage.setItem('perfil_completo', 'true');

      // ✅ atualiza o localStorage do usuário com os dados novos
      if (data.user) {
        const userAtual = userStorage ? parsedUser || {} : {};

        const userAtualizado = {
          ...userAtual,
          ...data.user,
          nome: data.user.nome ?? formData.nome,
          bio: data.user.bio ?? formData.bio,
          instagram: data.user.instagram ?? formData.instagram,
          linkedin: data.user.linkedin ?? formData.linkedin,
          email: data.user.email ?? emailLogado,
        };

        localStorage.setItem('@Linkah:User', JSON.stringify(userAtualizado));
      } else {
        // fallback caso backend não devolva user
        const userAtual = userStorage ? parsedUser || {} : {};
        localStorage.setItem(
          '@Linkah:User',
          JSON.stringify({
            ...userAtual,
            nome: formData.nome,
            bio: formData.bio,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            email: emailLogado,
          })
        );
      }

      Swal.fire({
        title: 'SUCESSO!',
        text: 'Perfil sincronizado.',
        icon: 'success',
        confirmButtonColor: '#FF4D4D',
        customClass: { popup: 'rounded-[2rem]' },
      });

      router.replace('/dashboard/eventos');
    } catch (error: any) {
      Swal.fire('Erro', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
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
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block ml-2 text-slate-400">
                  Nome Completo / Social *
                </label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] focus:bg-white transition-all font-bold text-slate-800 text-sm"
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
                  className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] focus:bg-white transition-all font-bold text-slate-800 text-sm"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="pt-16 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                  <AlignLeft size={20} />
                </div>
                <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.3em] italic">
                  Bio & Redes Sociais
                </h3>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">
                    Mini Bio / Descrição
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2.5rem] outline-none focus:border-[#FF4D4D] font-bold text-slate-800 resize-none"
                    placeholder="Conte um pouco sobre você para seus clientes..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 pl-16 rounded-[2rem] outline-none focus:border-blue-400 font-bold text-slate-800"
                      placeholder="linkedin.com/in/seu-perfil"
                    />
                  </div>
                  <div className="relative group">
                    <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-500 transition-colors" size={20} />
                    <input
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 pl-16 rounded-[2rem] outline-none focus:border-pink-400 font-bold text-slate-800"
                      placeholder="@seu-instagram"
                    />
                  </div>
                </div>
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
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">CEP</label>
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
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">Rua / Avenida</label>
                  <input
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                    className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] font-bold text-slate-800"
                  />
                </div>
                <div className="col-span-1 space-y-4">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">Nº</label>
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
                      <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-200">
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
                    <span className="px-5 py-2 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      CONTA ATIVA
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`p-10 rounded-[3rem] border-2 border-dashed flex flex-col lg:flex-row items-center justify-between gap-10 transition-all ${stripeAccountId ? 'bg-amber-50/30 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                      {stripeAccountId ? <AlertCircle className="text-amber-500" size={28} /> : <Zap className="text-slate-300" size={28} />}
                    </div>
                    <div>
                      <p className="text-slate-900 font-black text-base italic uppercase tracking-tight">
                        {stripeAccountId ? 'Pendência de Verificação' : 'Habilitar Recebimentos'}
                      </p>
                      <p className="text-slate-400 font-bold text-[11px] leading-relaxed uppercase tracking-tight mt-1 max-w-sm">
                        {stripeAccountId
                          ? 'Sua conta está vinculada, mas o Stripe precisa de mais dados ou documentos para liberar suas vendas.'
                          : 'Conecte sua conta para aceitar Pix e Cartão. Taxa fixa de 5% por ticket vendido.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConectarStripe}
                    className="bg-slate-950 text-white px-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#FF4D4D] transition-all shadow-xl active:scale-95 group"
                  >
                    <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    {stripeAccountId ? 'Concluir Cadastro' : 'Configurar Agora'}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#FF4D4D] text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-5 hover:bg-slate-950 transition-all shadow-2xl shadow-red-200 disabled:opacity-50 active:scale-[0.98] group"
            >
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} className="group-hover:rotate-12 transition-transform" />}
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
        <div className="flex h-screen w-screen items-center justify-center bg-white">
          <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
        </div>
      }
    >
      <PerfilContent />
    </Suspense>
  );
}