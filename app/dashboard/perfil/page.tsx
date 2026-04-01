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
  Camera
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
  foto_perfil?: string;
}

function PerfilContent() {

  const { t }: any = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

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

    const userStorage = localStorage.getItem('@Linkah:User');
    const parsedUser = userStorage ? JSON.parse(userStorage) : null;

    const emailLogado =
      parsedUser?.email ||
      localStorage.getItem('userEmail') ||
      '';

    const token =
      localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '') || '';

    return {
      userStorage,
      parsedUser,
      emailLogado,
      token
    };

  }, []);

  // FOTO

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    setFotoFile(file);

    const preview = URL.createObjectURL(file);
    setFotoPreview(preview);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const { name, value } = e.target;

    const valueFinal =
      name === 'cpf_cnpj' || name === 'cep'
        ? aplicarMascara(name, value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: valueFinal
    }));

  };

  // CARREGAR PERFIL

  useEffect(() => {

    const carregarDados = async () => {

      const { emailLogado, token } = getUsuarioLogado();

      if (!emailLogado) {
        router.push('/site/login');
        return;
      }

      try {

        const headers: Record<string, string> = {
          Accept: 'application/json'
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_URL}/api/auth/perfil?email=${encodeURIComponent(emailLogado)}`,
          {
            method: 'GET',
            headers
          }
        );

        if (response.ok) {

          const data = await response.json();

          setFormData({
            nome: data.nome || '',
            cpf_cnpj: data.cpf_cnpj || '',
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
            linkedin: data.linkedin || '',
            instagram: data.instagram || '',
            bio: data.bio || '',
            foto_perfil: data.foto_perfil || ''
          });

          if (data.foto_perfil) {
            setFotoPreview(data.foto_perfil);
          }

          setStripeAccountId(data.stripe_account_id || null);

        }

      } catch (error) {

        console.error('Erro carregar perfil', error);

      } finally {

        setIsLoading(false);

      }

    };

    carregarDados();

  }, [router, getUsuarioLogado]);

  // SALVAR PERFIL

  const handleSalvar = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsSaving(true);

    const { emailLogado, token } = getUsuarioLogado();

    try {

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {

        if (value) {
          payload.append(key, value);
        }

      });

      payload.append('email_original', emailLogado);

      if (fotoFile) {
        payload.append('foto_perfil', fotoFile);
      }

      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
        body: payload
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar');
      }

      Swal.fire({
        title: 'SUCESSO!',
        text: 'Perfil atualizado.',
        icon: 'success',
        confirmButtonColor: '#FF4D4D'
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#FF4D4D]" size={48}/>
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12">

      <div className="max-w-[850px] mx-auto">

        <Link
          href="/dashboard/eventos"
          className="flex items-center gap-3 mb-10"
        >
          <ArrowLeft size={18}/>
          Voltar ao Painel
        </Link>

        <div className="bg-white rounded-[4rem] shadow-xl p-10">

          {/* FOTO PERFIL */}

          <div className="flex items-center gap-6 mb-10">

            <label className="cursor-pointer relative group">

              {fotoPreview ? (

                <img
                  src={fotoPreview}
                  className="w-24 h-24 rounded-[2rem] object-cover"
                />

              ) : (

                <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center">
                  <UserCircle size={40} className="text-white"/>
                </div>

              )}

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFotoChange}
              />

              <div className="absolute -bottom-2 -right-2 bg-[#FF4D4D] p-2 rounded-xl">
                <Camera size={16} color="white"/>
              </div>

            </label>

            <div>

              <h2 className="text-3xl font-black">
                Meu Perfil
              </h2>

              <p className="text-slate-400 text-sm">
                Identidade do Produtor
              </p>

            </div>

          </div>

          <form onSubmit={handleSalvar} className="space-y-8">

            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome"
              className="w-full border p-4 rounded-xl"
            />

            <input
              name="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={handleChange}
              placeholder="CPF ou CNPJ"
              className="w-full border p-4 rounded-xl"
            />

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              className="w-full border p-4 rounded-xl"
            />

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#FF4D4D] text-white p-5 rounded-xl flex justify-center items-center gap-3"
            >

              {isSaving
                ? <Loader2 className="animate-spin"/>
                : <Save size={18}/>
              }

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

    <Suspense fallback={<Loader2 className="animate-spin"/>}>

      <PerfilContent/>

    </Suspense>

  );

}