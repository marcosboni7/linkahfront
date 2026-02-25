'use client';

import { MessageCircle, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext'; 

export default function AdminComunidades() {
  const { t } = useLanguage(); 

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          {/* Agora t.communitiesTitle existe! */}
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {t.communitiesTitle}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {t.communitiesSub}
          </p>
        </div>
        <button className="p-3 hover:bg-white rounded-full text-slate-400 shadow-sm transition-all">
          <RefreshCcw size={20} />
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-20 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
          <MessageCircle size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">
            {t.communitiesModule}
        </h2>
        <p className="text-slate-400 font-medium max-w-xs mx-auto">
          {t.communitiesComingSoon}
        </p>
      </div>
    </div>
  );
}