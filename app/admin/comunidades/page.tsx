'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Trash2, ShieldCheck, 
  MessageSquare, LogOut, Save, X, Edit3,
  Loader2, RefreshCcw, LayoutDashboard, Ticket,
  MessageCircle, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AdminComunidades() {
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [itemParaEditar, setItemParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  // Endpoint que retorna TODAS as comunidades
  const API_URL = 'https://linkah-api.onrender.com/api/comunidades';

  const carregarComunidades = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        // IMPORTANTE: Aqui não usamos .slice(), pegamos o array inteiro
        // Filtramos apenas para não mostrar as que o staff já deletou/arquivou (Soft Delete)
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
    const confirmar = window.confirm("⚠️ Desativar esta comunidade? Ela sairá da vitrine, mas os dados de chat permanecem no banco.");
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
      alert("Erro ao salvar.");
    }
  };

  // Lógica de busca em tempo real em toda a lista
  const comunidadesFiltradas = comunidades.filter(c => 
    c.nome?.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck size={24} /></div>
            <p className="text-xl font-black tracking-tighter">LINKAH STAFF</p>
          </div>
          <nav className="space-y-3">
            <Link href="/admin/dashboard" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 transition-all">
              <LayoutDashboard size={20}/> Dashboard
            </Link>
            <Link href="/admin/eventos" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 transition-all">
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Comunidades</h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                {comunidades.length} Total
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Gestão completa de todas as salas de conversa da plataforma.</p>
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
              placeholder="Buscar em todas as comunidades..." 
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
                  <th className="px-8 py-6">Status / Membros</th>
                  <th className="px-8 py-6 text-right">Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">Buscando lista completa...</td></tr>
                ) : (
                  comunidadesFiltradas.map((com) => (
                    <tr key={com.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <img src={com.imagem_url || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-[1.2rem] object-cover border border-slate-200" />
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-tight mb-1">{com.nome}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ativa</span>
                              <span className="text-[10px] text-slate-300">ID: #{com.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                              <Users size={14} className="text-[#ff4d4d]" />
                              {com.total_membros || 0} membros
                            </span>
                            <Link href={`/evento/${com.evento_id}/comunidade`} target="_blank" className="text-[10px] font-black text-blue-500 flex items-center gap-1 hover:underline">
                               VER CHAT <ExternalLink size={10} />
                            </Link>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => { setItemParaEditar(com); setIsModalOpen(true); }}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                            title="Editar Dados"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleExcluir(com.id)}
                            disabled={isProcessing === com.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Desativar Sala"
                          >
                            {isProcessing === com.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {!loading && comunidadesFiltradas.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-bold">Nenhuma comunidade encontrada com esse nome.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE EDIÇÃO (MANTIDO) */}
      {isModalOpen && itemParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
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
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">URL da Foto</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10 transition-all"
                  value={itemParaEditar.imagem_url}
                  onChange={(e) => setItemParaEditar({...itemParaEditar, imagem_url: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-3">
                <Save size={20} /> Atualizar Agora
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}