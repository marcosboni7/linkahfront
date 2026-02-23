'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Trash2, Save, X, Edit3, Loader2, 
  RefreshCcw, ExternalLink, Calendar, MapPin
} from 'lucide-react';
import Link from 'next/link';
// Importamos a Sidebar centralizada para evitar erros de duplicidade
import Sidebar from '../Sidebar';

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [itemParaEditar, setItemParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/eventos';

  const carregarTodosEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vitrine`); 
      if (res.ok) {
        const data = await res.json();
        // Filtramos apenas os que não foram deletados logicamente
        setEventos(data.filter((ev: any) => ev.status !== 'Excluído'));
      }
    } catch (err) {
      console.error("Erro ao carregar lista completa de eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    carregarTodosEventos(); 
  }, []);

  const handleExcluir = async (id: number) => {
    const confirmar = window.confirm("⚠️ Deletar este evento? Ele sairá da vitrine imediatamente.");
    if (!confirmar) return;

    setIsProcessing(id);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Excluído' })
      });

      if (res.ok) {
        setEventos(prev => prev.filter(ev => ev.id !== id));
      }
    } catch (err) {
      alert("Erro ao excluir evento.");
    } finally {
      setIsProcessing(null);
    }
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${itemParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemParaEditar)
      });
      if (res.ok) {
        setIsModalOpen(false);
        carregarTodosEventos();
      }
    } catch (err) {
      alert("Erro ao salvar.");
    }
  };

  const eventosFiltrados = eventos.filter(ev => 
    ev.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    ev.categoria?.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900 font-sans">
      
      {/* SIDEBAR CENTRALIZADA */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Eventos</h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                {eventos.length} Cadastrados
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Visualize e controle cada experiência criada na plataforma.</p>
          </div>
          <button 
            onClick={carregarTodosEventos} 
            className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"
            title="Recarregar dados"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          
          {/* BARRA DE BUSCA */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou categoria..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all font-medium"
            />
          </div>

          {/* TABELA DE EVENTOS */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6">Evento / Categoria</th>
                  <th className="px-8 py-6">Informações Técnicas</th>
                  <th className="px-8 py-6 text-right">Controle Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">
                      Carregando inventário completo...
                    </td>
                  </tr>
                ) : eventosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold">
                      Nenhum evento encontrado.
                    </td>
                  </tr>
                ) : (
                  eventosFiltrados.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <img 
                            src={ev.imagem_capa || ev.imagem_url || 'https://via.placeholder.com/150'} 
                            className="w-16 h-16 rounded-[1.2rem] object-cover border border-slate-200 shadow-sm" 
                            alt={ev.nome}
                          />
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-tight mb-1">{ev.nome}</p>
                            <span className="text-[10px] font-black text-[#ff4d4d] uppercase tracking-widest bg-[#ff4d4d]/5 px-2 py-0.5 rounded">
                              {ev.categoria || 'Sem Categoria'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 text-slate-500 font-bold text-xs">
                          <span className="flex items-center gap-2 text-slate-700">
                            <Calendar size={14} className="text-slate-400" /> {ev.data || 'Data não definida'}
                          </span>
                          <span className="flex items-center gap-2 text-slate-400 font-medium">
                            <MapPin size={14} /> {ev.local || 'Online / Global'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Link 
                            href={`/evento/${ev.id}`} 
                            target="_blank" 
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm"
                            title="Ver na Vitrine"
                          >
                            <ExternalLink size={18} />
                          </Link>
                          <button 
                            onClick={() => { setItemParaEditar(ev); setIsModalOpen(true); }}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                            title="Editar Evento"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleExcluir(ev.id)}
                            disabled={isProcessing === ev.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm disabled:opacity-50"
                            title="Excluir"
                          >
                            {isProcessing === ev.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && itemParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Editar Evento</h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X />
                </button>
            </div>
            
            <form onSubmit={salvarEdicao} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Título da Experiência</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10 transition-all"
                  value={itemParaEditar.nome}
                  onChange={(e) => setItemParaEditar({...itemParaEditar, nome: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Categoria</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10 transition-all"
                  value={itemParaEditar.categoria || ''}
                  onChange={(e) => setItemParaEditar({...itemParaEditar, categoria: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
              >
                <Save size={20} /> Salvar no Banco
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}