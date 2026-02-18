import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { LayoutDashboard, Users, Calendar, LogOut, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/router';

export default function StaffPainel() {
  const [stats, setStats] = useState({ vendas: 0, eventos: 0, salas: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('staff_token');
      
      // Buscando dados do seu backend no Render
      // Nota: Ajuste os endpoints conforme as rotas que você criou no seu Controller
      const [resEv, resSalas] = await Promise.all([
        fetch('https://linkah-api.onrender.com/api/eventos/vitrine'),
        fetch('https://linkah-api.onrender.com/api/comunidades/salas')
      ]);

      const eventos = await resEv.json();
      const salas = await resSalas.json();

      setStats({
        vendas: 1250, // Exemplo: Integre com sua rota de pagamentos depois
        eventos: eventos.length || 0,
        salas: salas.length || 0
      });
    } catch (err) {
      console.error("Erro ao carregar dados do Staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('staff_token');
    if (!token) {
      router.push('/staff/login'); // Proteção: Se não tem token, volta pro login
    } else {
      fetchData();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('staff_token');
    router.push('/staff/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Head><title>Linkah Staff | Painel</title></Head>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 fixed h-full shadow-2xl">
        <h2 className="text-2xl font-black italic mb-10 text-[#ff0082]">LINKAH</h2>
        <nav className="flex-1 space-y-2">
          <a href="/staff/painel" className="flex items-center gap-3 p-4 bg-[#ff0082] rounded-2xl font-bold text-sm shadow-lg shadow-pink-500/20">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="/staff/eventos" className="flex items-center gap-3 p-4 text-slate-400 hover:text-white transition-all font-bold text-sm">
            <Calendar size={18} /> Gerenciar Eventos
          </a>
          <a href="/staff/salas" className="flex items-center gap-3 p-4 text-slate-400 hover:text-white transition-all font-bold text-sm">
            <Users size={18} /> Gerenciar Salas
          </a>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-400 p-4 font-bold text-sm mt-auto transition-colors">
          <LogOut size={18} /> Sair do Sistema
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase italic">Dashboard <span className="text-[#ff0082]">Staff</span></h1>
            <p className="text-slate-400 font-medium">Conectado ao backend Linkah no Render</p>
          </div>
          <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#ff0082] transition-all shadow-sm">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard title="Vendas Confirmadas" value={`R$ ${stats.vendas}`} loading={loading} />
          <StatCard title="Eventos Cadastrados" value={stats.eventos} loading={loading} />
          <StatCard title="Salas Ativas" value={stats.salas} loading={loading} />
        </div>

        <div className="mt-12 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="font-black italic uppercase text-slate-800 mb-4">Status da API</h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizado com Render em Tempo Real</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, loading }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 group-hover:text-[#ff0082] transition-colors">{title}</p>
      <p className={`text-4xl font-black text-slate-800 ${loading ? 'animate-pulse' : ''}`}>{value}</p>
    </div>
  );
}