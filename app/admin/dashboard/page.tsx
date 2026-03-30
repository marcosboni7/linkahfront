'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Ticket, MessageCircle, 
  ArrowUpRight, Clock, CheckCircle2, Loader2,
  Activity, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    usuarios: 0,
    eventos: 0,
    comunidades: 12 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(false);
      try {
        const [resUsers, resEvents] = await Promise.all([
          fetch(`${API_URL_BASE}/api/usuarios`),
          fetch(`${API_URL_BASE}/api/eventos`)
        ]);

        if (!resUsers.ok || !resEvents.ok) throw new Error("Falha na resposta da API");

        const usersData = await resUsers.json();
        const eventsData = await resEvents.json();

        setStats(prev => ({
          ...prev,
          usuarios: Array.isArray(usersData) ? usersData.length : 0,
          eventos: Array.isArray(eventsData) ? eventsData.length : 0,
        }));
        setLastSync(new Date());
      } catch (err) {
        console.error("Erro ao sincronizar dados:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Opcional: Atualização automática a cada 5 minutos
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER DE COMANDO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-[#C22973]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C22973]">Administrator Access</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic uppercase">
            {t.consoleTitle} <span className="text-slate-400">{t.consoleGeneral}</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">{t.infraSub}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${
              loading ? 'bg-amber-400 animate-pulse' : 
              error ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
            }`} />
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
              {loading ? t.syncing : error ? 'System Error' : t.systemStable}
            </span>
          </div>
        </div>
      </header>

      {/* MÉTRICAS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* EVENTOS */}
        <div className="group bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform" />
          <div className="w-16 h-16 bg-pink-50 text-[#C22973] rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <Ticket size={32} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t.activeEvents}</p>
          <div className="flex items-baseline gap-3">
            {loading ? (
              <Loader2 className="animate-spin text-slate-200" />
            ) : (
              <p className="text-6xl font-black text-slate-900 tracking-tighter">{stats.eventos}</p>
            )}
            <span className="text-pink-500 text-xs font-black uppercase tracking-tighter">Live Now</span>
          </div>
        </div>

        {/* USUÁRIOS */}
        <div className="group bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform" />
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <Users size={32} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t.totalMembers}</p>
          <div className="flex items-baseline gap-3">
            {loading ? (
              <Loader2 className="animate-spin text-slate-200" />
            ) : (
              <p className="text-6xl font-black text-slate-900 tracking-tighter">{stats.usuarios}</p>
            )}
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-black italic">
              <ArrowUpRight size={14} /> +{stats.usuarios > 0 ? '12' : '0'}%
            </div>
          </div>
        </div>

        {/* COMUNIDADES */}
        <div className="group bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform" />
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <MessageCircle size={32} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t.communities}</p>
          <div className="flex items-baseline gap-3">
            <p className="text-6xl font-black text-slate-900 tracking-tighter">{stats.comunidades}</p>
            <span className="text-slate-300 text-xs font-black uppercase tracking-widest italic">Hubs</span>
          </div>
        </div>
      </div>
      
      {/* LOGS DE SISTEMA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic flex items-center gap-3 mb-10">
              <Activity className="text-slate-300" size={24} /> {t.systemLogs}
            </h3>
            <div className="space-y-8">
               <div className="flex items-center gap-5 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    error ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 group-hover:bg-[#C22973] group-hover:text-white'
                  }`}>
                    {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div className="flex-1 border-b border-slate-50 pb-4">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                      {error ? 'API Connection Failed' : t.syncSuccess}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Clock size={12}/> {lastSync.toLocaleTimeString()}
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${error ? 'text-red-500' : 'text-emerald-500'}`}>
                          {error ? 'Critical' : 'Success'}
                        </span>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}