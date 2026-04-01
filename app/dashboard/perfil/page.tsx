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

  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeAtivo, setStripeAtivo] = useState(false);
  const [stripeDetails, setStripeDetails] = useState<StripeDetails | null>(null);

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

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
      localStorage
        .getItem('@Linkah:Token')
        ?.replace(/['"]+/g, '') || '';

    return {
      emailLogado,
      token,
      parsedUser,
      userStorage
    };

  }, []);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {

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

  const handleSalvar = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsSaving(true);

    const { emailLogado, token } = getUsuarioLogado();

    try {

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) payload.append(key, value);
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
        text: 'Perfil atualizado',
        icon: 'success',
        confirmButtonColor: '#FF4D4D'
      });

      router.replace('/dashboard/eventos');

    } catch (error: any) {

      Swal.fire(
        'Erro',
        error.message,
        'error'
      );

    } finally {

      setIsSaving(false);

    }

  };

  if (isLoading) {

    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-red-500" />
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12">

      <div className="max-w-[850px] mx-auto">

        <Link
          href="/dashboard/eventos"
          className="flex items-center gap-2 mb-8"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="bg-white rounded-[3rem] shadow-xl p-10">

          {/* FOTO PERFIL */}

          <div className="flex items-center gap-6 mb-12">

            <label className="cursor-pointer relative group">

              {fotoPreview ? (

                <img
                  src={fotoPreview}
                  className="w-24 h-24 rounded-3xl object-cover"
                />

              ) : (

                <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center">
                  <UserCircle size={40} className="text-white" />
                </div>

              )}

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFotoChange}
              />

              <div className="absolute -bottom-2 -right-2 bg-red-500 p-2 rounded-xl">
                <Camera size={16} color="white" />
              </div>

            </label>

            <div>

              <h1 className="text-3xl font-bold">
                Meu Perfil
              </h1>

              <p className="text-slate-400">
                Gerencie suas informações
              </p>

            </div>

          </div>

          <form onSubmit={handleSalvar} className="space-y-8">

            <input
              name="nome"
              placeholder="Nome"
              value={formData.nome}
              onChange={handleChange}
              className="input"
            />

            <input
              name="cpf_cnpj"
              placeholder="CPF/CNPJ"
              value={formData.cpf_cnpj}
              onChange={handleChange}
              className="input"
            />

            <textarea
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              className="input"
            />

            {/* STRIPE NÃO FOI ALTERADO */}

            <div className="pt-12 border-t">

              <h3 className="font-bold mb-4 flex items-center gap-2">
                <CreditCard size={18}/>
                Stripe
              </h3>

              {stripeAtivo && stripeDetails ? (

                <div className="bg-green-50 p-6 rounded-2xl">

                  <p className="font-bold">
                    {stripeDetails.business_name}
                  </p>

                  <p className="text-sm">
                    {stripeDetails.email_stripe}
                  </p>

                </div>

              ) : (

                <button
                  type="button"
                  className="bg-black text-white px-6 py-3 rounded-xl"
                >
                  Conectar Stripe
                </button>

              )}

            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-red-500 text-white py-4 rounded-2xl flex justify-center items-center gap-2"
            >

              {isSaving
                ? <Loader2 className="animate-spin"/>
                : <Save size={18}/>
              }

              Salvar Perfil

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