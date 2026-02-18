'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://linkah-api.onrender.com/api/eventos/vitrine');
      const data = await res.json();
      setEventos(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const deletarEvento = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      const res = await fetch(`https://linkah-api.onrender.com/api/eventos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('linkah_token')}` }
      });
      if (res.ok) carregarEventos();
    } catch (err) { alert("Erro ao deletar"); }
  };

  useEffect(() => { carregarEventos(); }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Eventos <span className="text-[#ff0082]">Ativos</span></h1>
        <div className="flex gap-2">
          <button onClick={carregarEventos} className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200"><RefreshCw size={20} /></button>
          <button className="bg-[#ff0082] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-pink-200"><Plus size={20} /> Novo Evento</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 font-sans">Evento</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 font-sans text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={2} className="p-10 text-center animate-pulse font-bold italic uppercase text-slate-400">Buscando eventos...</td></tr>
            ) : eventos.map((ev: any) => (
              <tr key={ev.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-5">
                   <p className="font-bold text-slate-800">{ev.nome}</p>
                   <p className="text-[10px] text-slate-400 uppercase font-black">{ev.categoria} • R$ {ev.preco}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-3">
                    <button className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={18} /></button>
                    <button onClick={() => deletarEvento(ev.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}