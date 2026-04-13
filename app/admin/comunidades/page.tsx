'use client';

import { MessageCircle, RefreshCcw, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function AdminComunidades() {
  const { t }: any = useLanguage();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.06),transparent_30%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-12 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 mb-4">
              <ShieldCheck size={14} className="text-violet-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
                Communities Admin
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
              {t.communitiesTitle}
            </h1>

            <p className="text-sm text-slate-500 font-medium mt-3">
              {t.communitiesSub}
            </p>
          </div>

          <button className="w-12 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center">
            <RefreshCcw size={18} className="text-violet-600" />
          </button>
        </header>

        {/* HERO CARD */}
        <section className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-violet-500 mb-2">
                Overview
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Gerenciamento de comunidades
              </h2>
              <p className="text-slate-500 mt-3 max-w-2xl">
                Centralize o controle dos hubs sociais da plataforma com uma experiência
                visual mais limpa, organizada e pronta para crescer.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  Module
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  Community Center
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN EMPTY STATE */}
        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-10 md:p-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-6 text-violet-600 shadow-sm">
              <MessageCircle size={36} />
            </div>

            <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-violet-500 mb-3">
              Coming Soon
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-3">
              {t.communitiesModule}
            </h2>

            <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
              {t.communitiesComingSoon}
            </p>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              Estrutura pronta para expansão futura
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}