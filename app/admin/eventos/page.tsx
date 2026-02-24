'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, RefreshCcw, Calendar, MapPin, 
  Save, X, Edit3, Loader2, Link, AlignLeft, DollarSign, Clock,
  AlertCircle, Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL = 'https://r8amtavirp.us-east-1.awsapprunner.com/api/eventos';

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  
  const [eventoParaEditar, setEventoParaEditar] = useState<any>({
    id: '', nome: '', data: '', horario: '', local: '', preco: '', imagem: '', descricao: '', status: ''
  });

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Usando o endpoint de vitrine para listar eventos ativos
      const res = await fetch(`${API_URL}/vitrine`);
      if (res.ok) {
        const data = await res.json();
        const formatados = Array.isArray(data) ? data.filter((ev: any) => ev.status !== 'Excluído').map((ev: any) => ({
            ...ev,
            data: ev.data ? ev.data.split('T')[0] : '' 
        })) : [];
        setEventos(formatados);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const abrirEdicao = (evento: any) => {
    setEventoParaEditar({
      id: evento.id || '',
      nome: evento.nome || '',
      data: evento.data || '',
      horario: evento.horario || '',
      local: evento.local || '',
      preco: evento.preco || '',
      imagem: evento.imagem || '',
      descricao: evento.descricao || '',
      status: evento.status || 'Ativo'
    });
    setIsModalOpen(true);
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing('salvando');

    const payload = { ...eventoParaEditar, data_inicio: eventoParaEditar.data };

    try {
      const res = await fetch(`${API_URL}/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        Swal.fire({
            icon: 'success',
            title: 'Evento Atualizado',
            showConfirmButton: false,
            timer: 1500,
            customClass: { popup: 'rounded-[2rem]' }
        });
        await carregarDados();
      } else {
        Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
      }
    } catch (err) {
      Swal.fire('Erro de Conexão', 'Verifique sua internet ou o servidor.', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleExcluir = async (evento: any) => {
    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: `O evento "${evento.nome}" será removido da vitrine.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C22973',
        cancelButtonColor: '#cbd5e1',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'rounded-[2rem]' }
    });

    if (!result.isConfirmed) return;

    setIsProcessing(evento.id);
    try {
      const res = await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, status: 'Excluído' })
      });
      if (res.ok) {
        setEventos(prev => prev.filter(ev => ev.id !== evento.id));
      }
    } catch (err) {
      console.error("❌ Erro ao excluir:", err);
    } finally { setIsProcessing(null); }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER DINÂMICO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">Eventos</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Gerenciamento e curadoria da vitrine Linkah</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Localizar evento..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-[#C22973]/5 font-bold shadow-sm w-full md:w-80 transition-all placeholder:text-slate-200 text-sm"
            />
          </div>
          <button 
            onClick={carregarDados} 
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 transition-all shadow-sm active:scale-95"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin text-[#C22973]' : ''} />
          </button>
        </div>
      </header>

      {/* TABELA DE GESTÃO */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-8">Thumbnail & Título</th>
                <th className="px-10 py-8 text-center">Data & Hora</th>
                <th className="px-10 py-8 text-center">Status</th>
                <th className="px-10 py-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
                    <p className="text-slate-300 font-black uppercase text-[10px] mt-4 tracking-widest">Sincronizando Vitrine...</p>
                  </td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-10 py-20 text-center">
                      <AlertCircle className="mx-auto text-slate-100" size={48} />
                      <p className="text-slate-300 font-black uppercase text-[10px] mt-4 tracking-widest">Nenhum evento encontrado</p>
                    </td>
                </tr>
              ) : (
                eventos
                  .filter(ev => ev.nome?.toLowerCase().includes(filtroBusca.toLowerCase()))
                  .map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative w-14 h-14 shrink-0">
                            {ev.imagem ? (
                                <img src={ev.imagem} className="w-full h-full rounded-2xl object-cover border border-slate-100 shadow-sm" alt="" />
                            ) : (
                                <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300"><ImageIcon size={20}/></div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-50">
                                <Link size={10} className="text-[#C22973]" />
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic tracking-tight text-base leading-none mb-1">{ev.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <MapPin size={10} className="text-[#C22973]"/> {ev.local}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-tighter">{ev.data}</span>
                          <span className="text-[11px] font-bold text-slate-400">{ev.horario || '--:--'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex justify-center">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Ativo</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => abrirEdicao(ev)} className="w-11 h-11 flex items-center justify-center bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-slate-400 transition-all shadow-sm"><Edit3 size={18}/></button>
                          <button onClick={() => handleExcluir(ev)} className="w-11 h-11 flex items-center justify-center bg-white hover:bg-red-500 hover:text-white border border-slate-200 rounded-xl text-slate-400 transition-all shadow-sm" disabled={isProcessing === ev.id}>
                            {isProcessing === ev.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
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

      {/* MODAL DE EDIÇÃO AVANÇADA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] relative border border-white/20">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-300 hover:text-slate-900"><X size={28} /></button>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Editar <span className="text-[#C22973]">Evento</span></h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">ID: {eventoParaEditar.id}</p>
            </div>

            <form onSubmit={salvarEdicao} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Título do Evento</label>
                <input 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black italic uppercase text-slate-900 outline-none focus:bg-white focus:ring-4 ring-pink-50 transition-all" 
                  value={eventoParaEditar.nome} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Data de Início</label>
                <div className="relative">
                    <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                    type="date"
                    className="w-full pl-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all" 
                    value={eventoParaEditar.data} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, data: e.target.value})} 
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Horário</label>
                <div className="relative">
                    <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                    type="time"
                    className="w-full pl-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all" 
                    value={eventoParaEditar.horario} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, horario: e.target.value})} 
                    />
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Local / Endereço</label>
                <input 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all text-sm" 
                  value={eventoParaEditar.local} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, local: e.target.value})} 
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Preço Base (R$)</label>
                <div className="relative">
                    <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                    className="w-full pl-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all" 
                    value={eventoParaEditar.preco} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, preco: e.target.value})} 
                    />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">URL da Capa (CDN)</label>
                <input 
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[10px] text-slate-400 outline-none focus:bg-white transition-all" 
                  value={eventoParaEditar.imagem} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, imagem: e.target.value})} 
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Descrição do Evento</label>
                <textarea 
                  rows={4}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-medium text-sm outline-none resize-none focus:bg-white transition-all" 
                  value={eventoParaEditar.descricao} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, descricao: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isProcessing === 'salvando'}
                className="col-span-2 bg-[#C22973] text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] hover:bg-[#a62262] transition-all shadow-2xl shadow-pink-200 active:scale-95 flex items-center justify-center gap-3 text-xs"
              >
                {isProcessing === 'salvando' ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}