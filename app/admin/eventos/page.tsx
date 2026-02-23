'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, RefreshCcw, Calendar, MapPin, 
  Save, X, Edit3, Loader2, Link, AlignLeft, DollarSign, Clock 
} from 'lucide-react';

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  
  const [eventoParaEditar, setEventoParaEditar] = useState<any>({
    id: '', nome: '', data: '', horario: '', local: '', preco: '', imagem: '', descricao: '', status: ''
  });

  const API_URL = 'https://linkah-api.onrender.com/api/eventos';

  const carregarDados = async () => {
    setLoading(true);
    try {
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
    console.log("📂 Abrindo edição para o evento:", evento);
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

    const payload = {
      nome: eventoParaEditar.nome,
      data: eventoParaEditar.data,
      data_inicio: eventoParaEditar.data, // Garante compatibilidade
      horario: eventoParaEditar.horario,
      local: eventoParaEditar.local,
      preco: eventoParaEditar.preco,
      imagem: eventoParaEditar.imagem,
      descricao: eventoParaEditar.descricao,
      status: eventoParaEditar.status
    };

    console.log("📤 Enviando atualização para ID:", eventoParaEditar.id);
    console.log("📦 Dados enviados (Payload):", payload);

    try {
      const res = await fetch(`${API_URL}/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        console.log("✅ Sucesso! Evento atualizado.");
        setIsModalOpen(false);
        await carregarDados();
      } else {
        const erroTexto = await res.text();
        console.error("⚠️ Erro na resposta do servidor:", res.status, erroTexto);
        alert(`Erro ${res.status}: O servidor não salvou os dados.`);
      }
    } catch (err) {
      console.error("❌ Erro de conexão/rede:", err);
      alert("Erro de conexão com o servidor. Verifique o console.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleExcluir = async (evento: any) => {
    if (!window.confirm(`⚠️ Deseja remover "${evento.nome}"?`)) return;
    setIsProcessing(evento.id);
    try {
      const res = await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evento, status: 'Excluído' })
      });
      if (res.ok) setEventos(prev => prev.filter(ev => ev.id !== evento.id));
    } catch (err) {
      console.error("❌ Erro ao excluir:", err);
    } finally { setIsProcessing(null); }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Eventos</h1>
          <p className="text-slate-500 font-medium tracking-tight">Gerenciamento completo da vitrine.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar evento..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-red-500/10 font-medium shadow-sm w-full md:w-80 transition-all"
            />
          </div>
          <button onClick={carregarDados} className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 transition-all shadow-sm">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Informações</th>
                <th className="px-10 py-6">Data & Horário</th>
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
                        {ev.imagem && <img src={ev.imagem} className="w-10 h-10 rounded-lg object-cover border border-slate-100" alt="" />}
                        <div>
                          <p className="font-black text-slate-900">{ev.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{ev.local}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="text-xs font-bold text-slate-600 space-y-1">
                        <div className="flex items-center gap-1"><Calendar size={14} className="text-red-400"/> {ev.data}</div>
                        <div className="flex items-center gap-1"><Clock size={14} className="text-blue-400"/> {ev.horario}</div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => abrirEdicao(ev)} className="p-3 hover:bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm"><Edit3 size={18}/></button>
                        <button onClick={() => handleExcluir(ev)} className="p-3 hover:bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm" disabled={isProcessing === ev.id}>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Editar Evento</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>

            <form onSubmit={salvarEdicao} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título do Evento</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                  value={eventoParaEditar.nome} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data</label>
                <input 
                  type="date"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                  value={eventoParaEditar.data} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, data: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Horário</label>
                <input 
                  type="time"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                  value={eventoParaEditar.horario} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, horario: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Local</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                  value={eventoParaEditar.local} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, local: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preço (R$)</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                  value={eventoParaEditar.preco} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, preco: e.target.value})} 
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL da Imagem</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-xs outline-none" 
                  value={eventoParaEditar.imagem} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, imagem: e.target.value})} 
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descrição Detalhada</label>
                <textarea 
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium outline-none resize-none" 
                  value={eventoParaEditar.descricao} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, descricao: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isProcessing === 'salvando'}
                className="col-span-2 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing === 'salvando' ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Confirmar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}