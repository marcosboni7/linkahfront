'use client';

import { 
  Users, Ticket, MessageCircle, TrendingUp, 
  ArrowUpRight, Clock, Calendar, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER COM STATUS RAPIDÃO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Olá, Admin 👋</h1>
          <p className="text-slate-500 font-medium">Aqui está o que aconteceu na Linkah hoje.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sistema Online</span>
          </div>
        </div>
      </header>

      {/* CARDS PRINCIPAIS COM GRADIENTE SUTIL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Eventos */}
        <div className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div className="w-14 h-14 bg-red-50 text-[#ff4d4d] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Ticket size={28} />
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">Eventos Ativos</p>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-slate-900 tracking-tighter">12</p>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <ArrowUpRight size={14} /> +20%
            </span>
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
            <p className="text-5xl font-black text-slate-900 tracking-tighter">842</p>
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <ArrowUpRight size={14} /> +5%
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
            <p className="text-5xl font-black text-slate-900 tracking-tighter">24</p>
            <span className="text-slate-400 text-xs font-bold">Estável</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ATIVIDADE RECENTE */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="text-slate-400" size={20} /> Atividade Recente
            </h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-[#ff4d4d] hover:underline">Ver tudo</button>
          </div>
          
          <div className="space-y-6">
            {[
              { text: "Novo usuário registrado", time: "2 min atrás", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
              { text: "Evento 'Tech Meetup' criado", time: "45 min atrás", icon: Calendar, color: "text-red-500", bg: "bg-red-50" },
              { text: "Pagamento Stripe aprovado", time: "2 horas atrás", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-[#ff4d4d] transition-colors">{item.text}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PERFORMANCE (MOCK DE GRÁFICO) */}
        <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
              <TrendingUp className="text-[#ff4d4d]" size={20} /> Performance Semanal
            </h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Crescimento de engajamento da Linkah.</p>
            
            <div className="flex items-end gap-3 h-32 mt-10">
              {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-[#ff4d4d] rounded-t-lg transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,77,77,0.3)]"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] font-black text-slate-500">D{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}