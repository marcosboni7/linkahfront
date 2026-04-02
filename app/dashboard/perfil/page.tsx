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

  // Armazenar usuário logado
  const getUsuarioLogado = useCallback(() => {
    try {
      const userStorage = localStorage.getItem('@Linkah:User');
      const parsedUser = userStorage ? JSON.parse(userStorage) : null;
      const emailLogado = parsedUser?.email || localStorage.getItem('userEmail') || '';
      const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '') || '';

      return { userStorage, parsedUser, emailLogado, token };
    } catch (error) {
      console.error('❌ Erro ao ler usuário do localStorage:', error);
      return { userStorage: null, parsedUser: null, emailLogado: '', token: '' };
    }
  }, []);

  const aplicarMascara = (name: string, value: string) => {
    let v = value.replace(/\D/g, '');

    if (name === 'cpf_cnpj') {
      if (v.length <= 11) {
        return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})?/, '$1.$2.$3-$4').slice(0, 14);
      } else {
        return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})?/, '$1.$2.$3/$4-$5').slice(0, 18);
      }
    }

    if (name === 'cep') {
      return v.replace(/(\d{5})(\d{3})/, '$1-$2').slice(0, 9);
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

  const stripeCallback = searchParams.get('stripe_callback') === 'true';

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
          const estaRealmenteAtivo = data.status_banco === 'Ativo' && Boolean(data.charges_enabled);

          setStripeAtivo(estaRealmenteAtivo);
          setStripeDetails({
            charges_enabled: Boolean(data.charges_enabled),
            payout_enabled: Boolean(data.payout_enabled),
            business_name: data.business_name || 'Conta em Verificação',
            email_stripe: data.email_stripe || email,
            status_banco: data.status_banco || 'Pendente',
          });

          if (stripeCallback && estaRealmenteAtivo) {
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
    [stripeCallback]
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
            avatar: data.avatar || '',
          };

          setFormData(dadosPerfil);
          if (data.avatar) setAvatarPreview(data.avatar);

          if (perfilJaCompleto(dadosPerfil)) {
            localStorage.setItem('perfil_completo', 'true');
            if (autoRedirect) router.replace('/dashboard/eventos');
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

  // Upload de Avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    const { emailLogado, token, userStorage, parsedUser } = getUsuarioLogado();

    try {
      const dataTransfer = new FormData();
      dataTransfer.append('avatar', file);
      dataTransfer.append('email', emailLogado);

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/auth/upload-avatar`, {
        method: 'POST',
        headers,
        body: dataTransfer,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro no upload');

      const userAtual = userStorage ? parsedUser || {} : {};
      localStorage.setItem('@Linkah:User', JSON.stringify({ ...userAtual, avatar: data.avatar }));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Foto atualizada!',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error: any) {
      Swal.fire('Erro', error.message, 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
    const valueFinal = name === 'cpf_cnpj' || name === 'cep' ? aplicarMascara(name, value) : value;

    setFormData((prev) => ({ ...prev, [name]: valueFinal }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
      if (!response.ok) throw new Error(data.message || 'Erro ao salvar');

      localStorage.setItem('perfil_completo', 'true');

      const userAtual = userStorage ? parsedUser || {} : {};
      const userAtualizado = data.user
        ? { ...userAtual, ...data.user }
        : { ...userAtual, ...formData, email: emailLogado };

      localStorage.setItem('@Linkah:User', JSON.stringify(userAtualizado));

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
        {/* LAYOUT MANTIDO */}
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