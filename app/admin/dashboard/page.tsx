'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Ticket, AlertCircle, 
  CheckCircle2, XCircle, Search, Filter, 
  MoreVertical, Eye, Trash2, ArrowUpRight,
  ShieldCheck, MessageSquare, Settings, LogOut
} from 'lucide-react';

export default function AdminDashboard() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendas: 0,
    novosUsuarios: 0,
    eventosAtivos: 0,
    pendentes: 0
  });

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const res = await fetch('https://linkah-api.onrender.com/api/eventos/vitrine');
        if (res.ok) {
          const data = await res.json();
          setEventos(data);
          setStats({
            totalVendas: 12540.50,
            novosUsuarios: 84,
            eventosAtivos: data.length,
            pendentes: 3
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados de admin", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      
      {/* SIDEBAR FIXA PARA STAFF */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-[#ff4d4d] rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">LINKAH <span className="text-[#ff4d4d]">STAFF</span></span>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
            <SidebarItem icon={<Ticket size={20}/>} label="Eventos" />
            <SidebarItem icon={<Users size={20}/>} label="Usuários" />
            <SidebarItem icon={<MessageSquare size={20}/>} label="Chat Moderação" />
            <SidebarItem icon={<Settings size={20}/>} label="Configurações" />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/10">
          <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors font-bold text-sm">
            <LogOut size={18} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-100 px-10 py-6 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Visão Geral</h1>
            <p className="text-slate-400 text-sm font-medium">Bem-vindo ao centro de comando, Admin.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold leading-none">Equipe Linkah</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Nível 01 • Master</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Staff+Linkah&background=0f172a&color=fff" alt="staff" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-10">
          
          {/* METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Receita Bruta" value={`R$ ${stats.totalVendas}`} icon={<Ticket className="text-emerald-500" />} trend="+12.5%" />
            <MetricCard title="Novos Membros" value={stats.novosUsuarios} icon={<Users className="text-blue-500" />} trend="+5.2%" />
            <MetricCard title="Eventos Ativos" value={stats.eventosAtivos} icon={<LayoutDashboard className="text-purple-500" />} />
            <MetricCard title="Denúncias" value={stats.pendentes} icon={<AlertCircle className="text-rose-500" />} color="bg-rose-50/30" />
          </div>

          {/* TABELA DE GESTÃO */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                 <h3 className="text-xl font-black text-slate-900">Gestão de Eventos</h3>
                 <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-md">{eventos.length} TOTAL</span>
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filtrar por nome ou produtor..." 
                  className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl w-full md:w-80 text-sm font-medium outline-none focus:ring-2 ring-[#ff4d4d]/10 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                    <th className="px-8 py-5">Evento</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Categoria</th>
                    <th className="px-8 py-5 text-right">Ações de Moderação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1,2,3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-8 py-6 h-20 bg-slate-50/30" />
                      </tr>
                    ))
                  ) : (
                    eventos.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={ev.imagem_capa || ev.imagem_url} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                            <div>
                              <p className="font-bold text-slate-900 leading-none mb-1">{ev.nome}</p>
                              <p className="text-xs text-slate-400 font-medium">ID: #{ev.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                            ev.status === 'Ativo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${ev.status === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {ev.status || 'Pendente'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{ev.categoria}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button title="Ver Detalhes" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 hover:shadow-md transition-all">
                              <Eye size={18} />
                            </button>
                            <button title="Banir Evento" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:shadow-md transition-all">
                              <Trash2 size={18} />
                            </button>
                            <button className="p-2.5 text-slate-400 hover:text-slate-900">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES
function SidebarItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-[#ff4d4d] text-white shadow-lg shadow-[#ff4d4d]/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function MetricCard({ title, value, icon, trend, color = "bg-white" }: any) {
  return (
    <div className={`${color} p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm relative group overflow-hidden`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        {trend && (
          <div className="flex flex-col items-end">
             <span className="text-emerald-500 text-xs font-black">{trend}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Este mês</span>
          </div>
        )}
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>
  );
}