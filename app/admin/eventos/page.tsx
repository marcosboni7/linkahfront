'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, RefreshCcw, Calendar, MapPin, 
  Save, X, Edit3, Loader2, Link, AlignLeft, DollarSign 
} from 'lucide-react';

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | string | null>(null);
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
        // Filtra os que não estão excluídos e garante que é um array
        setEventos(Array.isArray(data) ? data.filter((ev: any) => ev.status !== 'Excluído') : []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleExcluir = async (evento: any) => {
    if (!window.confirm(`⚠️ Tem certeza que deseja remover "${evento.nome}"?`)) return;
    setIsProcessing(evento.id);
    try {
      await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, status: 'Excluído' })
      });
      setEventos(prev => prev.filter(ev => ev.id !== evento.id));
    } catch (err) {
      alert("Erro ao excluir evento.");
    } finally { setIsProcessing(null); }
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing('salvando');
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
    } catch (err) { 
      alert("Erro ao salvar."); 
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Eventos</h1>
          <p className="text-slate-500 font-medium tracking-tight text-sm">Gerencie a vitrine de eventos da plataforma.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d4d] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar evento..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-[#ff4d4d]/10 font-medium shadow-sm w-full md:w-80 transition-all text-slate-900"
            />
          </div>
          <button onClick={carregarDados} className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 transition-all shadow-sm">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* TABELA */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Evento</th>
                <th className="px-10 py-6">Data & Local</th>
                <th className="px-10 py-6">Valor</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventos
                .filter(ev => ev.nome?.toLowerCase().includes(filtroBusca.toLowerCase()))
                .map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        {ev.imagem && (
                          <img src={ev.imagem} alt={ev.nome} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" />
                        )}
                        <span className="font-black text-slate-900">{ev.nome}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Calendar size={12} className="text-red-400" /> {ev.data}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                          <MapPin size={12} /> {ev.local}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-sm font-black text-slate-900">
                        {ev.preco ? `R$ ${ev.preco}` : 'Gratuito'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEventoParaEditar(ev); setIsModalOpen(true); }} 
                          className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm"
                        >
                          <Edit3 size={18}/>
                        </button>
                        <button 
                          onClick={() => handleExcluir(ev)} 
                          className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"
                          disabled={isProcessing === ev.id}
                        >
                          {isProcessing === ev.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO COMPLETO */}
      {isModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Editar Detalhes</h2>
                <p className="text-slate-400 text-sm font-medium">Ajuste as informações principais do evento.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={salvarEdicao} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NOME */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Título do Evento</label>
                <div className="relative">
                  <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 ring-slate-100" 
                    value={eventoParaEditar.nome} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} 
                  />
                </div>
              </div>

              {/* DATA */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Data e Hora</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                    value={eventoParaEditar.data || ''} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, data: e.target.value})} 
                  />
                </div>
              </div>

              {/* PREÇO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Valor (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                    value={eventoParaEditar.preco || ''} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, preco: e.target.value})} 
                  />
                </div>
              </div>

              {/* LOCAL */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Localização</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                    value={eventoParaEditar.local || ''} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, local: e.target.value})} 
                  />
                </div>
              </div>

              {/* IMAGEM URL */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">URL da Imagem de Capa</label>
                <div className="relative">
                  <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-xs outline-none" 
                    value={eventoParaEditar.imagem || ''} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, imagem: e.target.value})} 
                  />
                </div>
              </div>

              {/* DESCRIÇÃO */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Descrição</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-slate-300" size={18} />
                  <textarea 
                    rows={4}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium outline-none resize-none" 
                    value={eventoParaEditar.descricao || ''} 
                    onChange={(e) => setEventoParaEditar({...eventoParaEditar, descricao: e.target.value})} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing === 'salvando'}
                className="col-span-2 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-[#ff4d4d] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
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