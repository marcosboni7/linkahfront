'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Ticket, AlertCircle, 
  CheckCircle2, XCircle, Search, Filter, 
  MoreVertical, Eye, Trash2, ShieldCheck, 
  MessageSquare, Settings, LogOut, Save, X, Edit3,
  Loader2, RefreshCcw, Calendar, MapPin
} from 'lucide-react';

export default function AdminDashboard() {
  // --- ESTADOS DE NAVEGAÇÃO ---
  const [abaAtiva, setAbaAtiva] = useState('eventos'); // Dashboard, eventos, usuarios, chat

  // --- ESTADOS DE DADOS (EVENTOS) ---
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

  // --- LÓGICA DE EVENTOS ---
  const handleExcluir = async (evento: any) => {
    const confirmar = window.confirm(`⚠️ Deseja realmente remover o evento "${evento.nome}"?`);
    if (!confirmar) return;
    setIsProcessing(evento.id);
    try {
      const res = await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, status: 'Excluído' })
      });
      if (res.ok) {
        setEventos((prev) => prev.filter(ev => ev.id !== evento.id));
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setIsProcessing(null);
    }
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
      if (res.ok) {
        setEventos(prev => prev.map(ev => ev.id === evento.id ? {...ev, status: novoStatus} : ev));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
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
        alert("Dados atualizados!");
      }
    } catch (err) { alert("Erro ao salvar."); }
  };

  const eventosFiltrados = eventos.filter(ev => 
    ev.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    ev.categoria?.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  // --- RENDERIZADOR DE CONTEÚDO DINÂMICO ---
  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'dashboard':
        return (
          <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400">
             <LayoutDashboard size={48} className="mb-4 opacity-20" />
             <p className="text-xl font-bold">Visão Geral em desenvolvimento...</p>
          </div>
        );
      case 'eventos':
        return (
          <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* BARRA DE PESQUISA */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
            </div>

            {/* TABELA */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="px-8 py-6">Informações do Evento</th>
                    <th className="px-8 py-6">Data e Local</th>
                    <th className="px-8 py-6">Status da Vitrine</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventosFiltrados.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <img src={ev.imagem_capa || ev.imagem_url} className="w-16 h-16 rounded-[1.2rem] object-cover shadow-sm border border-slate-200" />
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-tight mb-1">{ev.nome}</p>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff4d4d] bg-[#ff4d4d]/10 px-2 py-0.5 rounded-md">{ev.categoria || 'Geral'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Calendar size={12}/> {ev.data || 'Sem data'}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12}/> {ev.local || 'Sem local'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleStatus(ev)}
                          disabled={isProcessing === ev.id}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            ev.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {ev.status || 'Inativo'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setEventoParaEditar(ev); setIsModalOpen(true); }} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-900 transition-all shadow-sm">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleExcluir(ev)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Trash2 size={18} />
                          </button>
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
          <div className="p-10 flex flex-col items-center justify-center h-full text-slate-400">
             <Users size={48} className="mb-4 opacity-20" />
             <p className="text-xl font-bold">Gestão de Usuários em breve...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900 font-sans">
      
      {/* SIDEBAR ADMIN */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff4d4d]/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black leading-none tracking-tighter">LINKAH</p>
              <p className="text-[10px] font-bold text-[#ff4d4d] tracking-[0.2em] uppercase">Staff Panel</p>
            </div>
          </div>
          <nav className="space-y-3">
            <SidebarItem 
               icon={<LayoutDashboard size={20}/>} 
               label="Dashboard" 
               active={abaAtiva === 'dashboard'} 
               onClick={() => setAbaAtiva('dashboard')}
            />
            <SidebarItem 
               icon={<Ticket size={20}/>} 
               label="Gerenciar Eventos" 
               active={abaAtiva === 'eventos'} 
               onClick={() => setAbaAtiva('eventos')}
            />
            <SidebarItem 
               icon={<Users size={20}/>} 
               label="Usuários" 
               active={abaAtiva === 'usuarios'} 
               onClick={() => setAbaAtiva('usuarios')}
            />
            <SidebarItem 
               icon={<MessageSquare size={20}/>} 
               label="Moderação Chat" 
               active={abaAtiva === 'chat'} 
               onClick={() => setAbaAtiva('chat')}
            />
          </nav>
        </div>
        
        <div className="mt-auto p-8">
            <button className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors font-bold text-sm">
                <LogOut size={20} /> Sair do Painel
            </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize">{abaAtiva}</h1>
            <p className="text-slate-400 text-sm font-medium">Controle total sobre a vitrine e status da plataforma.</p>
          </div>
          <button onClick={carregarDados} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {renderConteudo()}
      </main>

      {/* MODAL DE EDIÇÃO (Mantido igual) */}
      {isModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-3xl font-black tracking-tight">Editar Evento</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X /></button>
            </div>
            
            <form onSubmit={salvarEdicao} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400">Título</label>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none" 
                    value={eventoParaEditar.nome} onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400">Categoria</label>
                  <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none" 
                    value={eventoParaEditar.categoria} onChange={(e) => setEventoParaEditar({...eventoParaEditar, categoria: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#ff4d4d] transition-all shadow-xl">
                <Save size={20} className="inline mr-2"/> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// SidebarItem com props de clique
function SidebarItem({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
        active ? 'bg-[#ff4d4d] text-white shadow-lg shadow-[#ff4d4d]/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </button>
  );
}