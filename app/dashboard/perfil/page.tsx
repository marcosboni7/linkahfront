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
  CheckCircle2,
  ShieldCheck,
  Zap,
  Instagram,
  Linkedin,
  AlignLeft,
  Camera,
  Globe,
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

  // ---- ÚNICA FUNÇÃO ALTERADA ----
  // Agora verifica @Linkah:User, perfil_completo e userEmail,
  // igual a Navbar faz, em vez de depender só de @Linkah:User.
  const getUsuarioLogado = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('@Linkah:User');
      const perfilCompleto = localStorage.getItem('perfil_completo');
      const userEmail = localStorage.getItem('userEmail');
      const token =
        localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '') || '';

      let usuarioEncontrado: any = null;

      if (savedUser) {
        try {
          usuarioEncontrado = JSON.parse(savedUser);
        } catch {
          usuarioEncontrado = null;
        }
      }

      if (!usuarioEncontrado && perfilCompleto) {
        try {
          usuarioEncontrado = JSON.parse(perfilCompleto);
        } catch {
          usuarioEncontrado = null;
        }
      }

      const emailLogado =
        usuarioEncontrado?.email ||
        usuarioEncontrado?.Email ||
        usuarioEncontrado?.user?.email ||
        userEmail ||
        '';

      // Se achamos e-mail mas @Linkah:User não tinha, sincroniza pra
      // não cair de novo nesse caminho da próxima vez.
      if (emailLogado && !usuarioEncontrado?.email) {
        localStorage.setItem(
          '@Linkah:User',
          JSON.stringify({ ...usuarioEncontrado, email: emailLogado })
        );
      }

      return { emailLogado, token };
    } catch (error) {
      return { emailLogado: '', token: '' };
    }
  }, []);
  // ---- FIM DA ALTERAÇÃO ----

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
      if (!emailLogado) return router.push('/site/login');

      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
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
          const completo = perfilJaCompleto(dadosPerfil);
          const userStorage = localStorage.getItem('@Linkah:User');
          if (userStorage) {
            const userAtual = JSON.parse(userStorage);
            localStorage.setItem('@Linkah:User', JSON.stringify({ ...userAtual, ...dadosPerfil, perfil_completo: completo }));
          }
          localStorage.setItem('perfil_completo', completo ? 'true' : 'false');
          if (data.stripe_account_id) await checarStatusStripe(emailLogado);
        }
      } catch (error) {
        console.error('❌ Erro carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, [router, checarStatusStripe, getUsuarioLogado, perfilJaCompleto]);

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
      
      const completo = perfilJaCompleto(formData);
      const userStorage = localStorage.getItem('@Linkah:User');
      if (userStorage) {
        const userAtual = JSON.parse(userStorage);
        localStorage.setItem('@Linkah:User', JSON.stringify({ ...userAtual, ...formData, perfil_completo: completo }));
      }
      localStorage.setItem('perfil_completo', completo ? 'true' : 'false');

      await Swal.fire({
        title: 'Perfil Atualizado!',
        text: 'Suas informações foram sincronizadas com sucesso.',
        icon: 'success',
        confirmButtonColor: '#000',
        customClass: { popup: 'rounded-2xl' }
      });

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
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-300 mb-2" size={32} />
      <span className="text-[12px] font-medium text-slate-400">Carregando perfil...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased">
      {/* NAVBAR LUMA STYLE */}
      <nav className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/dashboard/eventos" className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Painel
        </Link>
        <button 
          onClick={handleSalvar} 
          disabled={isSaving} 
          className="bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </nav>

      <main className="max-w-[640px] mx-auto pt-12 pb-24 px-6">
        <div className="flex flex-col items-center mb-12">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-xl transition-all group-hover:brightness-90">
                {isUploadingAvatar ? (
                    <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><UserCircle size={60} /></div>
                )}
            </div>
            <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-100">
                <Camera size={16} className="text-slate-600" />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Configurações</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie sua identidade no Linkah</p>
        </div>

        <form onSubmit={handleSalvar} className="space-y-8">
          {/* SEÇÃO: PERFIL PÚBLICO */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <UserCircle size={14} /> Perfil Público
                </h3>
            </div>
            <div className="p-8 space-y-6">
                <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Nome Completo</label>
                    <input 
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-0 transition-all outline-none text-sm bg-slate-50/30"
                        placeholder="Como você quer ser chamado?"
                    />
                </div>
                <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Bio</label>
                    <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-0 transition-all outline-none text-sm resize-none bg-slate-50/30"
                        placeholder="Uma breve descrição sobre você..."
                    />
                </div>
            </div>
          </div>

          {/* SEÇÃO: DOCUMENTAÇÃO E ENDEREÇO */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={14} /> Dados de Verificação
                </h3>
            </div>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-2">CPF ou CNPJ</label>
                        <input 
                            name="cpf_cnpj"
                            value={formData.cpf_cnpj}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-0 transition-all outline-none text-sm bg-slate-50/30"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-2">CEP</label>
                        <input 
                            name="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-0 transition-all outline-none text-sm bg-slate-50/30"
                            placeholder="00000-000"
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* SEÇÃO: REDES SOCIAIS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Globe size={14} /> Presença Digital
                </h3>
            </div>
            <div className="p-8 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                        <Instagram size={20} />
                    </div>
                    <input 
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-0 transition-all outline-none text-sm"
                        placeholder="@usuario"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Linkedin size={20} />
                    </div>
                    <input 
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-0 transition-all outline-none text-sm"
                        placeholder="linkedin.com/in/usuario"
                    />
                </div>
            </div>
          </div>

          {/* SEÇÃO: FINANCEIRO */}
          <div className={`rounded-3xl border p-8 transition-all ${stripeAtivo ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${stripeAtivo ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                        {stripeAtivo ? <CheckCircle2 size={28} /> : <Zap size={28} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">Pagamentos via Stripe</h4>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {stripeAtivo ? `Conectado como ${stripeDetails?.business_name}` : 'Receba pagamentos de seus eventos diretamente.'}
                        </p>
                    </div>
                </div>
                
                {!stripeAtivo ? (
                    <button 
                        type="button" 
                        onClick={handleConectarStripe}
                        className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Conectar Conta
                    </button>
                ) : (
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Ativo</span>
                )}
            </div>
          </div>

          <div className="pt-6">
            <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Salvar Todas as Alterações
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
            <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
    }>
      <PerfilContent />
    </Suspense>
  );
}