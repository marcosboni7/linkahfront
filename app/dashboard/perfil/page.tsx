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

          // Atualiza LocalStorage para sincronizar com o Modal
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
      
      // Atualiza avatar no LocalStorage
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
              <p className="text-slate-400 mt-3 font-bold uppercase text-[11px] tracking-[0.25em] italic flex items-center gap-2"><Zap size={14} className="text-[#FF4D4D]" /> Identidade do Produtor</p>
            </div>
          </div>

          <form onSubmit={handleSalvar} className="space-y-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block ml-2 text-slate-400">Nome Completo *</label>
                <input name="nome" value={formData.nome} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] focus:bg-white font-bold" placeholder="Ex: João Silva" />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] block ml-2 text-slate-400">CPF ou CNPJ *</label>
                <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} maxLength={18} className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2rem] outline-none focus:border-[#FF4D4D] font-bold" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className="pt-16 border-t border-slate-100">
              <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.3em] italic mb-10 flex items-center gap-3"><AlignLeft size={20} className="text-purple-500"/> Bio & Redes Sociais</h3>
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2">Mini Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 rounded-[2.5rem] outline-none focus:border-[#FF4D4D] font-bold resize-none" placeholder="Conte um pouco sobre você..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 pl-16 rounded-[2rem] outline-none focus:border-blue-400 font-bold" placeholder="linkedin.com/in/seu-perfil" />
                  </div>
                  <div className="relative group">
                    <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 p-6 pl-16 rounded-[2rem] outline-none focus:border-pink-400 font-bold" placeholder="@seu-instagram" />
                  </div>
                </div>
              </div>
            </div>

            {/* STRIPE STATUS */}
            <div className="pt-16 border-t border-slate-100">
              <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.3em] italic mb-10 flex items-center gap-3"><CreditCard size={20} className="text-emerald-500"/> Faturamento</h3>
              {stripeAtivo ? (
                <div className="bg-emerald-50/30 border-2 border-emerald-100 p-10 rounded-[3rem] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white"><CheckCircle2 size={32} /></div>
                    <div><p className="text-emerald-950 font-black uppercase text-[12px]">{stripeDetails?.business_name}</p></div>
                  </div>
                  <span className="px-5 py-2 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">CONTA ATIVA</span>
                </div>
              ) : (
                <div className="p-10 rounded-[3rem] border-2 border-dashed bg-slate-50 flex items-center justify-between">
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-tight">Conecte sua conta para aceitar pagamentos.</p>
                  <button type="button" onClick={handleConectarStripe} className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase hover:bg-[#FF4D4D] transition-all">Configurar Agora</button>
                </div>
              )}
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-[#FF4D4D] text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-5 hover:bg-slate-950 transition-all shadow-2xl disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} Atualizar Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-[#FF4D4D]" size={48} /></div>}>
      <PerfilContent />
    </Suspense>
  );
}