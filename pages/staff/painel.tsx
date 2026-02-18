import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, Trash2, Edit, RefreshCw, ArrowLeft } from 'lucide-react';

export default function GerenciarEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://linkah-api.onrender.com/api/eventos/vitrine');
      const data = await res.json();
      setEventos(data);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  const deletarEvento = async (id: string) => {
    if (!confirm("Deseja realmente excluir este evento?")) return;
    try {
      const token = localStorage.getItem('staff_token');
      await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      carregarEventos();
    } catch (err) {
      alert("Erro ao deletar.");
    }
  };

  useEffect(() => { carregarEventos(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Head><title>Staff | Gerenciar Eventos</title></Head>

      {/* Sidebar Simples para Pages Directory */}
      <aside className="w-64 bg-slate-900 p-6 text-white fixed h-full">
        <button onClick={() => router.push('/staff/painel')} className="flex items-center gap-2 text-slate-400 mb-10 hover:text-white transition-all">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <h2 className="font-black italic text-xl text-[#ff0082] mb-6">EVENTOS</h2>
        <button className="w-full bg-[#ff0082] py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20">
          <Plus size={18} /> Criar Novo
        </button>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black uppercase italic text-slate-800">Gerenciar <span className="text-[#ff0082]">Eventos</span></h1>
          <button onClick={carregarEventos} className="p-3 bg-white border rounded-xl hover:text-[#ff0082] transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Nome do Evento</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {eventos.map((ev: any) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800">{ev.nome}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{ev.categoria} • R$ {ev.preco}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="p-2 text-slate-300 hover:text-blue-500"><Edit size={18} /></button>
                      <button onClick={() => deletarEvento(ev.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}