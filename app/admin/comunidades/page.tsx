'use client';

import { useState, useEffect } from 'react';
import { 
  Ticket, Search, Trash2, ShieldCheck, 
  LogOut, Save, X, Edit3, Loader2, 
  RefreshCcw, LayoutDashboard, MessageCircle,
  ExternalLink, Calendar, MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [itemParaEditar, setItemParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  // Usamos o endpoint geral de eventos (sem o filtro /vitrine se possível)
  // para garantir que apareça TUDO o que existe no banco
  const API_URL = 'https://linkah-api.onrender.com/api/eventos';

  const carregarTodosEventos = async () => {
    setLoading(true);
    try {
      // Tentamos o endpoint principal. Se sua API exigir /vitrine, usamos, 
      // mas garantimos que o front não limite os dados.
      const res = await fetch(`${API_URL}/vitrine`); 
      if (res.ok) {
        const data = await res.json();
        // Removemos qualquer .slice() para mostrar a lista completa
        setEventos(data.filter((ev: any) => ev.status !== 'Excluído'));
      }
    } catch (err) {
      console.error("Erro ao carregar lista completa de eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarTodosEventos(); }, []);

  const handleExcluir = async (id: number) => {
    const confirmar = window.confirm("⚠️ Deletar este evento? Ele sairá da vitrine imediatamente.");
    if (!confirmar) return;

    setIsProcessing(id);
    try {
      // Soft Delete via PUT para evitar erro 500 de integridade
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

  const salvarEdicao = async (e: any) => {
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
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck size={24} /></div>
            <p className="text-xl font-black tracking-tighter uppercase">Linkah Admin</p>
          </div>
          <nav className="space-y-3">
            <Link href="/admin/dashboard" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 transition-all">
              <LayoutDashboard size={20}/> Dashboard
            </Link>
            <Link href="/admin/eventos" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm bg-[#ff4d4d] text-white shadow-xl shadow-[#ff4d4d]/20 transition-all">
              <Ticket size={20}/> Todos os Eventos
            </Link>
            <Link href="/admin/comunidades" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 transition-all">
              <MessageCircle size={20}/> Comunidades
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Eventos</h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md">
                {eventos.length} CADASTRADOS
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Visualize e controle cada experiência criada na plataforma.</p>
          </div>
          <button onClick={carregarTodosEventos} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-8">
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar em toda a lista..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all font-medium"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6">Evento / Categoria</th>
                  <th className="px-8 py-6">Informações Técnicas</th>
                  <th className="px-8 py-6 text-right">Controle Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">Carregando inventário completo...</td></tr>
                ) : (
                  eventosFiltrados.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <img src={ev.imagem_capa || ev.imagem_url} className="w-16 h-16 rounded-[1.2rem] object-cover border border-slate-200 shadow-sm" />
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-tight mb-1">{ev.nome}</p>
                            <span className="text-[10px] font-black text-[#ff4d4d] uppercase tracking-widest">{ev.categoria || 'Sem Categoria'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 text-slate-500 font-bold text-xs">
                          <span className="flex items-center gap-2"><Calendar size={14}/> {ev.data || 'Data não definida'}</span>
                          <span className="flex items-center gap-2"><MapPin size={14}/> {ev.local || 'Online / Global'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/evento/${ev.id}`} target="_blank" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm">
                            <ExternalLink size={18} />
                          </Link>
                          <button 
                            onClick={() => { setItemParaEditar(ev); setIsModalOpen(true); }}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleExcluir(ev.id)}
                            disabled={isProcessing === ev.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
               <h2 className="text-2xl font-black uppercase tracking-tighter">Editar Evento</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
            </div>
            <form onSubmit={salvarEdicao} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Título da Experiência</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10 transition-all"
                  value={itemParaEditar.nome}
                  onChange={(e) => setItemParaEditar({...itemParaEditar, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Categoria</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10 transition-all"
                  value={itemParaEditar.categoria}
                  onChange={(e) => setItemParaEditar({...itemParaEditar, categoria: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-3 shadow-xl">
                <Save size={20} /> Salvar no Banco
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}