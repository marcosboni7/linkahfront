'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Ticket, AlertCircle, 
  CheckCircle2, XCircle, Search, Filter, 
  MoreVertical, Eye, Trash2, ShieldCheck, 
  MessageSquare, Settings, LogOut, Save, X, Edit3
} from 'lucide-react';

export default function AdminDashboard() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = 'https://linkah-api.onrender.com/api/eventos';

  // 1. Carregar dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vitrine`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // 2. Função para Excluir
  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este evento?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEventos(eventos.filter(ev => ev.id !== id));
        alert("Evento removido com sucesso!");
      }
    } catch (err) { alert("Erro ao excluir."); }
  };

  // 3. Função para Alterar Status (Ativo/Inativo)
  const toggleStatus = async (evento: any) => {
    const novoStatus = evento.status === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      const res = await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, status: novoStatus })
      });
      if (res.ok) carregarDados();
    } catch (err) { console.error(err); }
  };

  // 4. Salvar Edição Completa
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
        alert("Evento atualizado!");
      }
    } catch (err) { alert("Erro ao salvar."); }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-[#ff4d4d] rounded-lg flex items-center justify-center"><ShieldCheck size={20} /></div>
            <span className="text-xl font-black tracking-tighter">LINKAH STAFF</span>
          </div>
          <nav className="space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
            <SidebarItem icon={<Ticket size={20}/>} label="Eventos" />
            <SidebarItem icon={<MessageSquare size={20}/>} label="Moderação Chat" />
          </nav>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-100 px-10 py-6 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-2xl font-black tracking-tight">Gestão de Eventos</h1>
          <div className="flex items-center gap-3">
             <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-black uppercase">Staff Online</div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">Evento</th>
                  <th className="px-8 py-5">Status Atual</th>
                  <th className="px-8 py-5">Categoria</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {eventos.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={ev.imagem_capa || ev.imagem_url} className="w-12 h-12 rounded-2xl object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{ev.nome}</p>
                          <p className="text-xs text-slate-400">{ev.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleStatus(ev)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                          ev.status === 'Ativo' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${ev.status === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {ev.status || 'Inativo'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{ev.categoria}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEventoParaEditar(ev); setIsModalOpen(true); }}
                          className="p-2 bg-slate-100 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(ev.id)}
                          className="p-2 bg-slate-100 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
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
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h2 className="text-2xl font-black">Editar Evento</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X /></button>
            </div>
            
            <form onSubmit={salvarEdicao} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Nome do Evento</label>
                  <input 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-[#ff4d4d]/20"
                    value={eventoParaEditar.nome}
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Categoria</label>
                  <input 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-[#ff4d4d]/20"
                    value={eventoParaEditar.categoria}
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, categoria: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400">Descrição</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium outline-none focus:ring-2 ring-[#ff4d4d]/20"
                  value={eventoParaEditar.descricao}
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, descricao: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-[#ff4d4d] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}>
      {icon} {label}
    </button>
  );
}