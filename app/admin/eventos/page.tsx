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
  
  // Estado detalhado para o formulário
  const [eventoParaEditar, setEventoParaEditar] = useState({
    id: '',
    nome: '',
    data: '',    // Formato: YYYY-MM-DD
    horario: '', // Formato: HH:mm
    local: '',
    preco: '',
    imagem: '',
    descricao: '',
    status: ''
  });

  const API_URL = 'https://linkah-api.onrender.com/api/eventos';

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/vitrine`);
      if (res.ok) {
        const data = await res.json();
        setEventos(Array.isArray(data) ? data.filter((ev: any) => ev.status !== 'Excluído') : []);
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // Abre o modal carregando os dados do evento
  const abrirEdicao = (evento: any) => {
    // Tenta separar a data do horário se vierem juntos "2026-02-23T14:00"
    const dataHora = evento.data ? evento.data.split(' ') : ['', ''];
    
    setEventoParaEditar({
      ...evento,
      data: dataHora[0] || '',
      horario: evento.horario || dataHora[1] || '',
      preco: evento.preco || '',
    });
    setIsModalOpen(true);
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing('salvando');

    try {
      // Montamos o objeto para o back-end
      const payload = {
        ...eventoParaEditar,
        // Você pode optar por enviar data e horário separados ou juntos:
        data: eventoParaEditar.data, 
        horario: eventoParaEditar.horario
      };

      const res = await fetch(`${API_URL}/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        carregarDados();
      } else {
        alert("Erro ao salvar no servidor.");
      }
    } catch (err) {
      alert("Erro de conexão com a API.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleExcluir = async (id: string | number) => {
    if (!confirm("Confirmar exclusão?")) return;
    setIsProcessing(id);
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE' // Ou PUT com status 'Excluído', dependendo da sua API
      });
      setEventos(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      alert("Erro ao deletar.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Eventos</h1>
          <p className="text-slate-500 font-medium">Controle total da vitrine Linkah.</p>
        </div>
        <button onClick={carregarDados} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* BUSCA */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Filtrar por nome..." 
          className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 ring-red-50"
          onChange={(e) => setFiltroBusca(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Evento</th>
              <th className="px-8 py-5">Data / Hora</th>
              <th className="px-8 py-5">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eventos.filter(ev => ev.nome?.toLowerCase().includes(filtroBusca.toLowerCase())).map((ev) => (
              <tr key={ev.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900">{ev.nome}</p>
                  <p className="text-xs text-slate-400">{ev.local}</p>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-slate-600">
                  {ev.data} <span className="text-slate-300 mx-1">|</span> {ev.horario || '--:--'}
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirEdicao(ev)} className="p-2 hover:text-blue-500 transition-colors"><Edit3 size={18}/></button>
                    <button onClick={() => handleExcluir(ev.id)} className="p-2 hover:text-red-500 transition-colors">
                      {isProcessing === ev.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter">Editar Evento</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>

            <form onSubmit={salvarEdicao} className="grid grid-cols-2 gap-6">
              {/* NOME */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome do Evento</label>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 ring-red-500/20 outline-none" 
                  value={eventoParaEditar.nome} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} 
                />
              </div>

              {/* DATA */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><Calendar size={12}/> Data</label>
                <input 
                  type="date"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" 
                  value={eventoParaEditar.data} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, data: e.target.value})} 
                />
              </div>

              {/* HORÁRIO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1"><Clock size={12}/> Horário</label>
                <input 
                  type="time"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" 
                  value={eventoParaEditar.horario} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, horario: e.target.value})} 
                />
              </div>

              {/* PREÇO */}
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preço (R$)</label>
                <input 
                  placeholder="0.00"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" 
                  value={eventoParaEditar.preco} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, preco: e.target.value})} 
                />
              </div>

              {/* LOCAL */}
              <div className="col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Local</label>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" 
                  value={eventoParaEditar.local} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, local: e.target.value})} 
                />
              </div>

              {/* IMAGEM */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL da Imagem</label>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium text-sm outline-none" 
                  value={eventoParaEditar.imagem} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, imagem: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                className="col-span-2 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing === 'salvando' ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Confirmar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}