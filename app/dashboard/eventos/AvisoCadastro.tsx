'use client';

import { useRouter } from 'next/navigation';

export default function AvisoCadastro() {
  const router = useRouter();

  return (
    <div className="bg-pink-50 border border-pink-100 rounded-[2rem] p-8 mb-8 flex flex-col items-start gap-4">
      <h2 className="text-[#C22973] text-2xl font-bold">
        Complete seu perfil de produtor!
      </h2>
      <p className="text-slate-500 font-medium">
        Para começar a criar e publicar seus eventos, precisamos que você configure seus dados profissionais. 
        Clique no botão abaixo para preencher suas informações.
      </p>
      
      <button 
        onClick={() => router.push('/dashboard/perfil')}
        className="bg-[#C22973] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-[#a62262] transition-all active:scale-95 shadow-lg shadow-pink-100"
      >
        Configurar meus Dados
      </button>
    </div>
  );
}