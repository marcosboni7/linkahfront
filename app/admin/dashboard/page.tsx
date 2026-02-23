'use client';

import { LayoutDashboard, Users, Ticket, MessageCircle } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-400 text-sm font-medium">Bem-vindo ao painel de controle da Linkah.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <Ticket className="text-[#ff4d4d] mb-4" size={32} />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Eventos Ativos</p>
          <p className="text-4xl font-black mt-1">--</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <Users className="text-blue-500 mb-4" size={32} />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Usuários Totais</p>
          <p className="text-4xl font-black mt-1">--</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <MessageCircle className="text-emerald-500 mb-4" size={32} />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Comunidades</p>
          <p className="text-4xl font-black mt-1">--</p>
        </div>
      </div>
    </div>
  );
}