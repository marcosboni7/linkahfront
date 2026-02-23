'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '../Sidebar'; 
import { 
  Search, Trash2, RefreshCcw, Calendar, MapPin, Save, X, Edit3, Ticket, Users, LayoutDashboard
} from 'lucide-react';

// O Next.js EXIGE que o componente de página seja um export default
export default function AdminDashboard() {
  const [abaAtiva, setAbaAtiva] = useState('eventos');
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/eventos';

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vitrine`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data.filter((ev: any) => ev.status !== 'Excluído'));
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleExcluir = async (evento: any) => {
    if (!window.confirm(`⚠️ Remover "${evento.nome}"?`)) return;
    setIsProcessing(evento.id);
    try {
      const res = await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, status: 'Excluído' })
      });
      if (res.ok) setEventos(prev => prev.filter(ev => ev.id !== evento.id));
    } finally { setIsProcessing(null); }
  };

  const toggleStatus = async (evento: any) => {
    const novoStatus = evento.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setIsProcessing(evento.id);
    try {
      const res = await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, status: novoStatus })
      });
      if (res.ok) setEventos(prev => prev.map(ev => ev.id === evento.id ? {...ev, status: novoStatus} : ev));
    } finally { setIsProcessing(null); }
  };

  const salvarEdicao = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoParaEditar)
      });
      if (res.ok) {
        setIsModalOpen(false);
        carregarDados();
      }
    } catch (err) { alert("Erro ao salvar."); }
  };

  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'eventos':
        return (
          <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou categoria..." 
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all font-medium"
              />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100">
                    <th className="px-8 py-6">Informações</th>
                    <th className="px-8 py-6">Data/Local</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventos.filter(ev => ev.nome.toLowerCase().includes(filtroBusca.toLowerCase())).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <img src={ev.imagem_capa || ev.imagem_url} className="w-14 h-14 rounded-xl object-cover" alt="" />
                          <div>
                            <p className="font-black text-slate-900">{ev.nome}</p>
                            <span className="text-[10px] font-black uppercase text-[#ff4d4d] bg-[#ff4d4d]/10 px-2 py-0.5 rounded">{ev.categoria}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs text-slate-600 font-bold">
                          <p className="flex items-center gap-1"><Calendar size={12}/> {ev.data}</p>
                          <p className="flex items-center gap-1 text-slate-400 font-medium"><MapPin size={12}/> {ev.local}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleStatus(ev)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${ev.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                        >
                          {ev.status}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEventoParaEditar(ev); setIsModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => handleExcluir(ev)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'usuarios':
        return (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Users size={64} className="mb-4 opacity-10" />
            <h2 className="text-2xl font-black text-slate-900">Gestão de Usuários</h2>
            <p>Em breve.</p>
          </div>
        );
      default:
        return (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <LayoutDashboard size={64} className="mb-4 opacity-10" />
            <p className="font-bold">Selecione uma aba.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900">
      <Sidebar abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-3xl font-black tracking-tight capitalize">{abaAtiva}</h1>
          <button onClick={carregarDados} className="p-3 hover:bg-slate-100 rounded-full text-slate-400">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>
        {renderConteudo()}
      </main>

      {isModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10">
            <div className="flex justify-between mb-8">
              <h2 className="text-2xl font-black">Editar</h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={salvarEdicao} className="space-y-6">
              <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold" 
                value={eventoParaEditar.nome} onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} />
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-[#ff4d4d] transition-all">
                <Save size={20} className="inline mr-2"/> Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}