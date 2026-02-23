'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Trash2, ShieldCheck, 
  MessageSquare, LogOut, Save, X, Edit3,
  Loader2, RefreshCcw, LayoutDashboard, Ticket,
  Image as ImageIcon, MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminComunidades() {
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [itemParaEditar, setItemParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/comunidades';

  const carregarComunidades = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        // Filtramos para não mostrar as comunidades que o staff já deletou/arquivou
        setComunidades(data.filter((c: any) => c.status !== 'Excluído'));
      }
    } catch (err) {
      console.error("Erro ao carregar comunidades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarComunidades(); }, []);

  const handleExcluir = async (id: number) => {
    const confirmar = window.confirm("⚠️ Deseja desativar esta comunidade? O chat ficará inacessível.");
    if (!confirmar) return;

    setIsProcessing(id);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Excluído' })
      });

      if (res.ok) {
        setComunidades(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      alert("Erro ao processar exclusão.");
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
        carregarComunidades();
      }
    } catch (err) {
      alert("Erro ao salvar alterações.");
    }
  };

  const comunidadesFiltradas = comunidades.filter(c => 
    c.nome?.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900 font-sans">
      
      {/* SIDEBAR REUTILIZÁVEL */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck size={24} /></div>
            <p className="text-xl font-black tracking-tighter">LINKAH STAFF</p>
          </div>
          <nav className="space-y-3">
            <Link href="/admin/dashboard" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 hover:text-white transition-all">
              <LayoutDashboard size={20}/> Dashboard
            </Link>
            <Link href="/admin/eventos" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 hover:text-white transition-all">
              <Ticket size={20}/> Eventos
            </Link>
            <Link href="/admin/comunidades" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm bg-[#ff4d4d] text-white shadow-xl shadow-[#ff4d4d]/20 transition-all">
              <MessageCircle size={20}/> Comunidades
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Comunidades</h1>
            <p className="text-slate-400 text-sm font-medium">Controle de chats e interação entre usuários.</p>
          </div>
          <button onClick={carregarComunidades} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-8">
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar comunidade..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all font-medium"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                  <th className="px-8 py-6">Comunidade</th>
                  <th className="px-8 py-6">Membros Ativos</th>
                  <th className="px-8 py-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comunidadesFiltradas.map((com) => (
                  <tr key={com.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <img src={com.imagem_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-[1.2rem] object-cover border border-slate-200" />
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight mb-1">{com.nome}</p>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Chat Online</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-slate-600 font-bold">
                          <Users size={16} className="text-[#ff4d4d]" />
                          {com.total_membros || 0} usuários
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => { setItemParaEditar(com); setIsModalOpen(true); }}
                          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(com.id)}
                          disabled={isProcessing === com.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          {isProcessing === com.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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
      {isModalOpen && itemParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-2xl font-black">Editar Comunidade</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400"><X /></button>
            </div>
            
            <form onSubmit={salvarEdicao} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Nome da Comunidade</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10 transition-all"
                  value={itemParaEditar.nome}
                  onChange={(e) => setItemParaEditar({...itemParaEditar, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Link da Imagem (Capa)</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10 transition-all"
                      value={itemParaEditar.imagem_url}
                      onChange={(e) => setItemParaEditar({...itemParaEditar, imagem_url: e.target.value})}
                    />
                  </div>
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                    <img src={itemParaEditar.imagem_url} className="w-full h-full object-cover" alt="preview" />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-3"
              >
                <Save size={20} /> Atualizar Comunidade
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}