'use client';

import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
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
  Camera,
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
  avatar?: string;
}

function PerfilContent() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeAtivo, setStripeAtivo] = useState(false);
  const [stripeDetails, setStripeDetails] = useState<StripeDetails | null>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

      return { userStorage, parsedUser, emailLogado, token };
    } catch (error) {
      return { userStorage: null, parsedUser: null, emailLogado: '', token: '' };
    }
  }, []);

  const aplicarMascara = (name: string, value: string) => {
    let v = value.replace(/\D/g, '');
    if (name === 'cpf_cnpj') {
      return v.length <= 11 
        ? v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4')
        : v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5');
    }
    if (name === 'cep') return v.replace(/(\d{5})(\d{3})/g, '$1-$2');
    return value;
  };

  const perfilJaCompleto = useCallback((data: Partial<FormDataState>) => {
    return Boolean(data?.nome?.trim() && data?.cpf_cnpj?.trim() && data?.cep?.trim());
  }, []);

  const checarStatusStripe = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/pagamento/status-stripe?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.conectado) {
        setStripeAtivo(data.status_banco === 'Ativo' && Boolean(data.charges_enabled));
        setStripeDetails({
          charges_enabled: Boolean(data.charges_enabled),
          payout_enabled: Boolean(data.payout_enabled),
          business_name: data.business_name || 'Conta em Verificação',
          email_stripe: data.email_stripe || email,
          status_banco: data.status_banco || 'Pendente',
        });
      }
    } catch (error) {
      console.error('❌ Erro Stripe Status:', error);
    }
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      const { emailLogado, token } = getUsuarioLogado();
      if (!emailLogado) { router.push('/site/login'); return; }

      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          
          // Tratativa da Foto (Avatar)
          const fotoPath = data.avatar || data.foto_perfil || '';
          if (fotoPath) {
            const fullUrl = fotoPath.startsWith('http') ? fotoPath : `${API_URL}/${fotoPath.replace(/^\//, '')}`;
            setAvatarPreview(fullUrl);
          }

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
            avatar: fotoPath,
          };

          setFormData(dadosPerfil);

          // Atualiza LocalStorage para sincronizar com o Chat
          const userStorage = localStorage.getItem('@Linkah:User');
          if (userStorage) {
            const userAtual = JSON.parse(userStorage);
            localStorage.setItem('@Linkah:User', JSON.stringify({ ...userAtual, ...dadosPerfil }));
          }

          setStripeAccountId(data.stripe_account_id || null);
          if (data.stripe_account_id) await checarStatusStripe(emailLogado);
        }
      } catch (error) {
        console.error('❌ Erro carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, [router, checarStatusStripe, getUsuarioLogado]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    const { emailLogado, token } = getUsuarioLogado();

    try {
      const dataTransfer = new FormData();
      dataTransfer.append('avatar', file);
      dataTransfer.append('email', emailLogado);

      const res = await fetch(`${API_URL}/api/auth/upload-avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: dataTransfer,
      });

      if (!res.ok) throw new Error('Erro no upload');
      const data = await res.json();
      
      // Atualiza avatar no LocalStorage para o Chat pegar na hora
      const userStorage = localStorage.getItem('@Linkah:User');
      if (userStorage) {
        const userParsed = JSON.parse(userStorage);
        localStorage.setItem('@Linkah:User', JSON.stringify({ ...userParsed, avatar: data.avatar }));
      }

      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Foto atualizada!', showConfirmButton: false, timer: 2000 });
    } catch (error: any) {
      Swal.fire('Erro', error.message, 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { emailLogado, token } = getUsuarioLogado();

    try {
      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email_original: emailLogado, ...formData }),
      });

      if (!response.ok) throw new Error('Erro ao salvar');
      
      // Sincroniza o localStorage ao salvar o perfil completo
      const userStorage = localStorage.getItem('@Linkah:User');
      if (userStorage) {
        const userAtual = JSON.parse(userStorage);
        localStorage.setItem('@Linkah:User', JSON.stringify({ ...userAtual, ...formData }));
      }

      localStorage.setItem('perfil_completo', 'true');
      Swal.fire({ title: 'SUCESSO!', text: 'Perfil sincronizado.', icon: 'success', confirmButtonColor: '#FF4D4D', customClass: { popup: 'rounded-[2rem]' } });
      router.replace('/dashboard/eventos');
    } catch (error: any) {
      Swal.fire('Erro', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'cpf_cnpj' || name === 'cep') ? aplicarMascara(name, value) : value }));
  };

  const handleConectarStripe = async () => {
    const { emailLogado, token } = getUsuarioLogado();
    try {
      const response = await fetch(`${API_URL}/api/pagamento/conectar-stripe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: emailLogado }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      Swal.fire('Erro', 'Falha ao conectar Stripe', 'error');
    }
  };

  if (isLoading) return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-[#FF4D4D]" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sincronizando...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12 font-sans">
      <div className="max-w-[850px] mx-auto">
        <Link href="/dashboard/eventos" className="inline-flex items-center gap-3 text-slate-400 hover:text-[#FF4D4D] transition-all mb-10 font-black text-[10px] tracking-[0.2em] uppercase group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
        </Link>

        <div className="bg-white rounded-[4rem] shadow-2xl p-8 md:p-20 border border-slate-50 relative overflow-hidden">
          <div className="flex items-center gap-8 mb-20 relative z-10">
            {/* AVATAR COM UPLOAD */}
            <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative group cursor-pointer overflow-hidden">
              {isUploadingAvatar ? <Loader2 className="animate-spin text-white" size={32} /> : 
                avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : 
                <UserCircle className="text-white" size={48} />
              }
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="text-white" size={24} /></div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>

            <div>
              <h2 className="text-5xl font-black text-slate-900 leading-none tracking-tighter italic uppercase">Meu Perfil</h2>
              <p className="text-slate-400 mt-3 font-bold uppercase text-[11px] tracking-[0.25em] italic flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#FF4D4D]" /> Conta Verificada
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvar} className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ml-2">Nome Completo</label>
                <div className="relative group">
                  <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                  <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Seu nome" className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ml-2">CPF ou CNPJ</label>
                <div className="relative group">
                  <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                  <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} placeholder="000.000.000-00" className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ml-2">CEP</label>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                  <input name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ml-2">Bio / Descrição</label>
                <div className="relative group">
                  <AlignLeft className="absolute left-6 top-8 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                  <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Conte um pouco sobre você..." rows={3} className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all resize-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ml-2">LinkedIn</label>
                <div className="relative group">
                  <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                  <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="url do seu perfil" className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic ml-2">Instagram</label>
                <div className="relative group">
                  <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF4D4D] transition-colors" size={20} />
                  <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@seuusuario" className="w-full bg-slate-50 border-none rounded-3xl py-6 pl-16 pr-8 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-[#FF4D4D]/10 transition-all" />
                </div>
              </div>
            </div>

            <div className="pt-10 flex flex-col md:flex-row gap-6">
              <button type="submit" disabled={isSaving} className="flex-1 bg-[#FF4D4D] text-white rounded-[2rem] py-8 font-black uppercase tracking-[0.4em] italic text-xs shadow-2xl shadow-[#FF4D4D]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              
              {!stripeAtivo ? (
                <button type="button" onClick={handleConectarStripe} className="flex-1 bg-slate-950 text-white rounded-[2rem] py-8 font-black uppercase tracking-[0.4em] italic text-xs shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                  <Zap size={20} className="text-yellow-400" /> Conectar Pagamentos
                </button>
              ) : (
                <div className="flex-1 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] p-6 flex items-center gap-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 italic">Stripe Ativo</p>
                    <p className="text-slate-900 font-bold text-sm">{stripeDetails?.business_name}</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#FF4D4D]" size={48} /></div>}>
      <PerfilContent />
    </Suspense>
  );
}