'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  MoreHorizontal,
  ArrowUpRight,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function PainelStaff() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dados fictícios para o layout
  const stats = [
    { label: 'Vendas Hoje', value: 'R$ 12.450', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Novos Usuários', value: '148', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Ingressos Ativos', value: '2.840', icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const eventosRecentes = [
    { id: 1, nome: 'Baile da Linkah', status: 'Ativo', vendas: 850, data: '20/02/2026' },
    { id: 2, nome: 'Workshop DJ Pro', status: 'Pendente', vendas: 0, data: '25/02/2026' },
    { id: 3, nome: 'Sunset Party', status: 'Encerrado', vendas: 1200, data: '15/02/2026' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* SIDEBAR ESQUERDA */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
            Linkah <span className="text-[#C22973]">Staff</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-[#C22973] text-white shadow-lg shadow-pink-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Painel Geral
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Calendar size={18} /> Eventos
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Users size={18} /> Usuários
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Ticket size={18} /> Validar Ingressos
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar eventos, pedidos ou CPFs..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#C22973] transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-slate-800">Admin Linkah</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Master Staff</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+Linkah&background=C22973&color=fff" alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* ÁREA DE SCROLL */}
        <div className="p-8 space-y-8 overflow-y-auto">
          
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Visão Geral</h2>
              <p className="text-slate-500 text-sm font-medium">Veja o que está acontecendo na plataforma hoje.</p>
            </div>
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
              Exportar Relatório <ArrowUpRight size={14} />
            </button>
          </div>

          {/* CARDS DE STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${item.bg} ${item.color} p-3 rounded-xl`}>
                    <item.icon size={24} />
                  </div>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{item.label}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{item.value}</h3>
              </div>
            ))}
          </div>

          {/* TABELA DE EVENTOS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Eventos de Destaque</h3>
              <button className="text-[#C22973] text-xs font-black hover:underline uppercase tracking-widest">Ver Todos</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                  <th className="px-8 py-4">Nome do Evento</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Data</th>
                  <th className="px-8 py-4">Vendas</th>
                  <th className="px-8 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventosRecentes.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-slate-700">{evt.nome}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                        evt.status === 'Ativo' ? 'bg-emerald-100 text-emerald-600' : 
                        evt.status === 'Pendente' ? 'bg-amber-100 text-amber-600' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{evt.data}</td>
                    <td className="px-8 py-4 text-sm font-black text-slate-700">{evt.vendas}</td>
                    <td className="px-8 py-4">
                      <div className="flex justify-center">
                        <button className="p-2 text-slate-400 hover:text-[#C22973] transition-colors">
                          <Settings size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}