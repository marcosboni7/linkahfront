'use client';

import { MessageCircle, ExternalLink, RefreshCcw } from 'lucide-react';

export default function AdminComunidades() {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Comunidades</h1>
          <p className="text-slate-400 text-sm font-medium">Gerencie os grupos de WhatsApp e Telegram.</p>
        </div>
        <button className="p-3 hover:bg-white rounded-full text-slate-400 shadow-sm transition-all">
          <RefreshCcw size={20} />
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-20 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
          <MessageCircle size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Módulo de Comunidades</h2>
        <p className="text-slate-400 font-medium max-w-xs mx-auto">
          Em breve você poderá gerenciar os links de convite e membros por aqui.
        </p>
      </div>
    </div>
  );
}