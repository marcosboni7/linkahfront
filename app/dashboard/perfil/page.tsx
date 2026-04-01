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
}

function PerfilContent() {

  const { t }: any = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fotoPerfil,setFotoPerfil] = useState<string | null>(null);

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

      return { userStorage, parsedUser, emailLogado, token };

    } catch {
      return { userStorage:null, parsedUser:null, emailLogado:'', token:'' };
    }
  }, []);

  const handleFotoChange = async (e:any)=>{

    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onloadend = async ()=>{

      const base64 = reader.result;
      const { emailLogado } = getUsuarioLogado();

      try{

        const res = await fetch(`${API_URL}/api/auth/upload-foto`,{
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            email: emailLogado,
            imagem: base64
          })
        });

        const data = await res.json();

        if(data.foto_url){

          setFotoPerfil(data.foto_url);

          Swal.fire({
            icon:'success',
            title:'Foto atualizada!'
          });

        }

      }catch(err){
        console.log(err);
      }

    };

    reader.readAsDataURL(file);

  }

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

  useEffect(()=>{

    const carregarPerfil = async ()=>{

      const { emailLogado } = getUsuarioLogado();

      if(!emailLogado){
        router.push('/site/login');
        return;
      }

      try{

        const res = await fetch(`${API_URL}/api/auth/perfil?email=${emailLogado}`);
        const data = await res.json();

        setFormData({
          nome:data.nome || '',
          cpf_cnpj:data.cpf_cnpj || '',
          cep:data.cep || '',
          rua:data.rua || '',
          numero:data.numero || '',
          bairro:data.bairro || '',
          linkedin:data.linkedin || '',
          instagram:data.instagram || '',
          bio:data.bio || '',
        });

        setFotoPerfil(data.foto_url || null);

      }catch(err){
        console.log(err);
      }

      setIsLoading(false);

    }

    carregarPerfil();

  },[])

  const handleChange = (e:any)=>{

    const {name,value} = e.target;

    const finalValue =
      name === 'cpf_cnpj' || name === 'cep'
      ? aplicarMascara(name,value)
      : value;

    setFormData(prev=>({
      ...prev,
      [name]:finalValue
    }))

  }

  const handleSalvar = async(e:any)=>{

    e.preventDefault();
    setIsSaving(true);

    const { emailLogado } = getUsuarioLogado();

    try{

      const res = await fetch(`${API_URL}/api/auth/perfil`,{
        method:'PUT',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          email_original: emailLogado,
          ...formData
        })
      });

      const data = await res.json();

      if(res.ok){

        Swal.fire({
          icon:'success',
          title:'Perfil atualizado'
        });

      }

    }catch(err){
      console.log(err);
    }

    setIsSaving(false);

  }

  if(isLoading){

    return(
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#FF4D4D]" size={48}/>
      </div>
    )

  }

  return (

<div className="min-h-screen bg-[#FDFDFF] p-6 md:p-12">

<div className="max-w-[850px] mx-auto">

<Link
href="/dashboard/eventos"
className="inline-flex items-center gap-3 text-slate-400 hover:text-[#FF4D4D] mb-10"
>
<ArrowLeft size={18}/>
Voltar
</Link>

<div className="bg-white rounded-[4rem] shadow-xl p-10">

{/* FOTO PERFIL */}

<div className="flex flex-col items-center mb-16">

<div className="relative">

{fotoPerfil ? (

<img
src={fotoPerfil}
className="w-32 h-32 rounded-full object-cover"
/>

):(

<div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center">
<UserCircle size={60}/>
</div>

)}

<label className="absolute bottom-0 right-0 bg-[#FF4D4D] p-3 rounded-full cursor-pointer text-white">

<Camera size={18}/>

<input
type="file"
accept="image/*"
className="hidden"
onChange={handleFotoChange}
/>

</label>

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
placeholder="CPF/CNPJ"
className="w-full border p-4 rounded-xl"
/>

<input
name="cep"
value={formData.cep}
onChange={handleChange}
placeholder="CEP"
className="w-full border p-4 rounded-xl"
/>

<input
name="rua"
value={formData.rua}
onChange={handleChange}
placeholder="Rua"
className="w-full border p-4 rounded-xl"
/>

<input
name="numero"
value={formData.numero}
onChange={handleChange}
placeholder="Número"
className="w-full border p-4 rounded-xl"
/>

<input
name="bairro"
value={formData.bairro}
onChange={handleChange}
placeholder="Bairro"
className="w-full border p-4 rounded-xl"
/>

<input
name="instagram"
value={formData.instagram}
onChange={handleChange}
placeholder="Instagram"
className="w-full border p-4 rounded-xl"
/>

<input
name="linkedin"
value={formData.linkedin}
onChange={handleChange}
placeholder="Linkedin"
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
className="w-full bg-[#FF4D4D] text-white py-4 rounded-xl flex items-center justify-center gap-3"
>

{isSaving
? <Loader2 className="animate-spin"/>
: <>
<Save size={18}/>
Salvar Perfil
</>
}

</button>

</form>

</div>

</div>

</div>

  )

}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>}>
      <PerfilContent />
    </Suspense>
  );
}