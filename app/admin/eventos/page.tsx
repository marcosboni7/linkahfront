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
        setEventos(Array.isArray(data) ? data.filter((ev: any) => ev.status !== 'Excluído') : []);
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const abrirEdicao = (evento: any) => {
    setEventoParaEditar({
      ...evento,
      // Garante que se vier nulo do banco, o input não fique "uncontrolled"
      data: evento.data || '',
      horario: evento.horario || '',
      local: evento.local || '',
      preco: evento.preco || ''
    });
    setIsModalOpen(true);
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing('salvando');

    // Montamos o corpo da requisição com nomes de campos idênticos ao Banco de Dados
    const payload = {
      nome: eventoParaEditar.nome,
      data: eventoParaEditar.data,     // Enviando a string da data
      horario: eventoParaEditar.horario, // Enviando a string do horário
      local: eventoParaEditar.local,
      preco: eventoParaEditar.preco,
      imagem: eventoParaEditar.imagem,
      descricao: eventoParaEditar.descricao,
      status: eventoParaEditar.status || 'Ativo'
    };

    try {
      const res = await fetch(`${API_URL}/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        await carregarDados(); // Recarrega para garantir que o front veja o dado novo
      } else {
        alert("Erro ao salvar. Verifique se os campos estão preenchidos.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Eventos</h1>
          <p className="text-slate-500 font-medium text-sm">Gerencie horários, datas e locais.</p>
        </div>
        <button onClick={carregarDados} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* TABELA DE EVENTOS */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Evento</th>
              <th className="px-8 py-5">Data / Hora</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eventos.map((ev) => (
              <tr key={ev.id} className="group hover:bg-slate-50/50">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900">{ev.nome}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{ev.local}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-red-400"/> {ev.data}</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-blue-400"/> {ev.horario}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => abrirEdicao(ev)} className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                    <Edit3 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tighter">Editar Evento</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>

            <form onSubmit={salvarEdicao} className="grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" 
                  value={eventoParaEditar.nome} onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} />
              </div>

              {/* DATA - Use texto se o seu banco não for Date formal, ou date para padrão ISO */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Data</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" 
                  value={eventoParaEditar.data} onChange={(e) => setEventoParaEditar({...eventoParaEditar, data: e.target.value})} placeholder="Ex: 23/02/2026" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Horário</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" 
                  value={eventoParaEditar.horario} onChange={(e) => setEventoParaEditar({...eventoParaEditar, horario: e.target.value})} placeholder="Ex: 19:00" />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Local</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-slate-200" 
                  value={eventoParaEditar.local} onChange={(e) => setEventoParaEditar({...eventoParaEditar, local: e.target.value})} />
              </div>

              <button type="submit" disabled={isProcessing === 'salvando'}
                className="col-span-2 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing === 'salvando' ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Confirmar e Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}