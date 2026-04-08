'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, RefreshCcw, MapPin, 
  Save, X, Edit3, Loader2, AlertCircle, Image as ImageIcon,
  DollarSign, Calendar, Activity, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

// --- API ATUALIZADA PARA O RENDER ---
const API_URL = 'https://api-linkah.onrender.com/api/eventos';

export default function AdminEventos() {
  const { t } = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  
  const [eventoParaEditar, setEventoParaEditar] = useState<any>({
    id: '', nome: '', data: '', horario: '', local: '', preco: '', 
    imagem: '', descricao: '', status: '', taxa_plataforma: 0.05
  });

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vitrine`);
      if (res.ok) {
        const data = await res.json();
        
        const formatados = Array.isArray(data) ? data
          .filter((ev: any) => ev.status !== 'Excluído')
          .map((ev: any) => ({
            ...ev,
            data: ev.data_inicio ? ev.data_inicio.split('T')[0] : (ev.data ? ev.data.split('T')[0] : ''),
            // Garante que o front leia a taxa como um número decimal vindo do banco
            taxa_plataforma: ev.taxa_plataforma ? parseFloat(ev.taxa_plataforma) : 0.05
          })) : [];
          
        setEventos(formatados);
      }
    } catch (err) {
      console.error("❌ Erro ao conectar com o Render:", err);
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
      status: evento.status || 'Ativo',
      // Mantém a taxa que já está no banco ao abrir o modal
      taxa_plataforma: evento.taxa_plataforma ?? 0.05
    });
    setIsModalOpen(true);
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing('salvando');

    const payload = { 
      ...eventoParaEditar, 
      data_inicio: eventoParaEditar.data,
      preco: parseFloat(eventoParaEditar.preco) || 0,
      taxa_plataforma: parseFloat(eventoParaEditar.taxa_plataforma)
    };

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
          title: 'Sincronizado!',
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: 'rounded-[3rem]' }
        });
        await carregarDados();
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao salvar no Render', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleExcluir = async (evento: any) => {
    const result = await Swal.fire({
      title: 'Remover da Vitrine?',
      text: `O evento "${evento.nome}" será ocultado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'rounded-[3rem]' }
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
        Swal.fire({ title: 'Removido!', icon: 'success', timer: 1000, showConfirmButton: false });
      }
    } catch (err) {
      console.error("❌ Erro na exclusão:", err);
    } finally { setIsProcessing(null); }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
            {t.eventsTitle || 'Eventos'}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">
            Console de Administração • Render Host Ativo
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar na vitrine..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-rose-500/5 font-bold shadow-sm w-full md:w-80 transition-all text-sm text-slate-900"
            />
          </div>
          <button 
            onClick={carregarDados} 
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 transition-all shadow-sm active:scale-95"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin text-rose-500' : ''} />
          </button>
        </div>
      </header>

      {/* TABELA DE DADOS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-8">Evento</th>
                <th className="px-10 py-8 text-center">Data e Hora</th>
                <th className="px-10 py-8 text-center">Taxa Linkah</th>
                <th className="px-10 py-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
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
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic tracking-tight text-base leading-none mb-1">{ev.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <MapPin size={10} className="text-rose-500"/> {ev.local}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-tighter">{ev.data}</span>
                          <span className="text-[11px] font-bold text-slate-400">{ev.horario || '--:--'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex flex-col items-center">
                           <span className="text-slate-900 font-black italic text-sm">{(ev.taxa_plataforma * 100).toFixed(1)}%</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase">Fee Ativa</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
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

      {/* MODAL EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] p-10 lg:p-14 shadow-2xl overflow-y-auto max-h-[90vh] relative border border-white/20 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"><X size={28} /></button>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-10">Editar Evento</h2>
            
            <form onSubmit={salvarEdicao} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título do Evento</label>
                <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black italic uppercase text-slate-900 outline-none focus:bg-white transition-all" value={eventoParaEditar.nome} onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} required />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Calendar size={12}/> Data</label>
                <input type="date" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white text-slate-800" value={eventoParaEditar.data} onChange={(e) => setEventoParaEditar({...eventoParaEditar, data: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Clock size={12}/> Horário</label>
                <input type="time" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white text-slate-800" value={eventoParaEditar.horario} onChange={(e) => setEventoParaEditar({...eventoParaEditar, horario: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Localização</label>
                <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white text-slate-800" value={eventoParaEditar.local} onChange={(e) => setEventoParaEditar({...eventoParaEditar, local: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><DollarSign size={12}/> Preço de Venda</label>
                <input type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white text-slate-800" value={eventoParaEditar.preco} onChange={(e) => setEventoParaEditar({...eventoParaEditar, preco: e.target.value})} />
              </div>

              {/* SLIDER DE TAXA - STAFF ONLY */}
              <div className="col-span-2 space-y-4 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-inner">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                      <Activity size={14}/> Taxa da Plataforma
                    </label>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Lucro Linkah por venda</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black italic text-white">{(eventoParaEditar.taxa_plataforma * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="0.30" 
                  step="0.005" 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  value={eventoParaEditar.taxa_plataforma} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, taxa_plataforma: parseFloat(e.target.value)})} 
                />
              </div>

              <button type="submit" disabled={isProcessing === 'salvando'} className="col-span-2 bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] hover:bg-rose-500 transition-all flex items-center justify-center gap-3 text-xs shadow-xl active:scale-95 disabled:opacity-50">
                {isProcessing === 'salvando' ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Sincronizar no Render
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}