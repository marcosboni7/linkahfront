'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    fetch('https://linkah-api.onrender.com/api/eventos/vitrine')
      .then(res => res.json())
      .then(data => setEventos(data));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Eventos <span className="text-[#ff0082]">Ativos</span></h1>
        <button className="bg-[#ff0082] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-pink-200">
          <Plus size={20} /> Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Evento</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Categoria</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Preço Base</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {eventos.map((ev: any) => (
              <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-slate-800 text-sm">{ev.nome}</td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium uppercase">{ev.categoria}</td>
                <td className="px-8 py-5 text-sm font-black text-slate-900">R$ {ev.preco || '0,00'}</td>
                <td className="px-8 py-5 text-right flex justify-end gap-3 text-slate-400">
                  <button className="hover:text-[#ff0082]"><Edit2 size={18} /></button>
                  <button className="hover:text-red-500"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}