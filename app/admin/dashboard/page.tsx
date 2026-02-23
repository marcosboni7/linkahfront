'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Ticket, MessageCircle, TrendingUp, 
  ArrowUpRight, Clock, Calendar, CheckCircle2, Loader2 
} from 'lucide-react';

export default function AdminDashboard() {
  // Estados para os dados do backend
  const [stats, setStats] = useState({
    usuarios: 0,
    eventos: 0,
    comunidades: 0
  });
  const [loading, setLoading] = useState(true);

  // URL base da sua API
  const API_BASE = 'https://linkah-api.onrender.com/api';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscamos os dados em paralelo para ser mais rápido
        const [resUsers, resEvents] = await Promise.all([
          fetch(`${API_BASE}/usuarios`),
          fetch(`${API_BASE}/eventos`) // Assumindo que este endpoint existe
        ]);

        const usersData = await resUsers.json();
        const eventsData = await resEvents.json();

        setStats({
          usuarios: Array.isArray(usersData) ? usersData.length : 0,
          eventos: Array.isArray(eventsData) ? eventsData.length : 0,
          comunidades: 24 // Exemplo estático ou mude para o seu endpoint de comunidades
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Olá, Admin 👋</h1>
          <p className="text-slate-500 font-medium tracking-tight text-sm">Status atualizado da plataforma Linkah.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${loading ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              {loading ? 'Sincronizando...' : 'Sistema Online'}
            </span>
          </div>
        </div>
      </header>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Eventos */}
        <div className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="w-14 h-14 bg-red-50 text-[#ff4d4d] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Ticket size={28} />
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">Eventos Ativos</p>
          <div className="flex items-baseline gap-2">
            {loading ? <Loader2 className="animate-spin text-slate-200" /> : (
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.eventos}</p>
            )}
          </div>
        </div>

        {/* Usuários */}
        <div className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Users size={28} />
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">Membros Totais</p>
          <div className="flex items-baseline gap-2">
            {loading ? <Loader2 className="animate-spin text-slate-200" /> : (
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.usuarios}</p>
            )}
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <ArrowUpRight size={14} /> +2%
            </span>
          </div>
        </div>

        {/* Comunidades */}
        <div className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <MessageCircle size={28} />
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">Comunidades</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats.comunidades}</p>
            <span className="text-slate-400 text-xs font-bold">Oficiais</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ATIVIDADE RECENTE (Lógica para o histórico) */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="text-slate-400" size={20} /> Histórico Local
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Última checagem concluída</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Agora mesmo</p>
              </div>
            </div>
            {/* Adicione mais itens conforme necessário */}
          </div>
        </div>

        {/* GRÁFICO (CSS Puro) */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <TrendingUp className="text-[#ff4d4d]" size={20} /> Projeção Linkah
            </h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Crescimento orgânico mensal.</p>
            
            <div className="flex items-end gap-3 h-32 mt-10">
              {[30, 45, 35, 60, 55, 80, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-[#ff4d4d] rounded-t-lg transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,77,77,0.4)]"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] font-black text-slate-500">M{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}