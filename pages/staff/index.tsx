import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, Calendar, LogOut, DollarSign, Activity } from 'lucide-react';

export default function StaffIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PROTEÇÃO: Verifica se o staff está logado
    const token = localStorage.getItem('staff_token');
    if (!token) {
      router.push('/staff/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold italic uppercase tracking-widest">Carregando Linkah Staff...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Head><title>Linkah | Staff Panel</title></Head>

      {/* Sidebar Fixa */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 fixed h-full shadow-2xl z-50">
        <h2 className="text-2xl font-black italic mb-10 text-[#ff0082] tracking-tighter">LINKAH<span className="text-white">.</span></h2>
        
        <nav className="flex-1 space-y-2">
          <a href="/staff" className="flex items-center gap-3 p-4 bg-[#ff0082] rounded-2xl font-bold text-sm shadow-lg shadow-pink-500/20 text-white">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="/staff/eventos" className="flex items-center gap-3 p-4 text-slate-400 hover:text-white transition-all font-bold text-sm">
            <Calendar size={18} /> Eventos
          </a>
          <a href="/staff/salas" className="flex items-center gap-3 p-4 text-slate-400 hover:text-white transition-all font-bold text-sm">
            <Users size={18} /> Comunidades
          </a>
        </nav>

        <button 
          onClick={() => { localStorage.removeItem('staff_token'); router.push('/staff/login'); }}
          className="flex items-center gap-3 text-slate-500 hover:text-red-400 p-4 font-bold text-sm mt-auto transition-all border-t border-slate-800"
        >
          <LogOut size={18} /> Sair do Sistema
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 ml-64 p-12">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-[#ff0082]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ambiente Administrativo</span>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">
            Painel <span className="text-[#ff0082]">Staff</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard title="Vendas Totais" value="R$ 0,00" icon={<DollarSign className="text-green-500" />} />
          <StatCard title="Eventos Ativos" value="0" icon={<Calendar className="text-[#ff0082]" />} />
          <StatCard title="Usuários Ativos" value="0" icon={<Users className="text-blue-500" />} />
        </div>

        <div className="mt-12 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <h3 className="font-black italic uppercase text-slate-800 text-xl">Status do Servidor</h3>
                <p className="text-slate-400 font-medium">Conectado com linkah-api.onrender.com</p>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-full font-bold text-xs uppercase tracking-widest border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Online
            </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <p className="text-4xl font-black text-slate-900">{value}</p>
    </div>
  );
}