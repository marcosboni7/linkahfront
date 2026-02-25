'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';

export default function AvisoCadastro() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="bg-pink-50 border border-pink-100 rounded-[2rem] p-8 mb-8 flex flex-col items-start gap-4">
      <h2 className="text-[#C22973] text-2xl font-bold">
        {t.producerAlertTitle}
      </h2>
      <p className="text-slate-500 font-medium">
        {t.producerAlertSub}
      </p>
      
      <button 
        onClick={() => router.push('/dashboard/perfil')}
        className="bg-[#C22973] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-[#a62262] transition-all active:scale-95 shadow-lg shadow-pink-100"
      >
        {t.btnConfigureData}
      </button>
    </div>
  );
}