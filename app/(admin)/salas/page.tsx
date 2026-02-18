'use client';

import { useState, useEffect } from 'react';
import { Users, Lock, Unlock, MessageSquare } from 'lucide-react';

export default function AdminSalasPage() {
  const [salas, setSalas] = useState([]);

  useEffect(() => {
    // Exemplo de rota que precisa existir no seu FastAPI
    fetch('https://linkah-api.onrender.com/api/comunidades/salas')
      .then(res => res.json())
      .then(data => setSalas(data))
      .catch(() => setSalas([])); // Fallback se a rota não existir ainda
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Salas da <span className="text-[#ff0082]">Comunidade</span></h1>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
          <Plus size={20} /> Criar Sala
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {salas.length > 0 ? salas.map((sala: any) => (
          <div key={sala.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between mb-4">
                <span className="p-2 bg-slate-100 rounded-xl text-slate-600">
                  {sala.is_private ? <Lock size={18} /> : <Unlock size={18} />}
                </span>
                <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">ID: {sala.id}</span>
              </div>
              <h3 className="font-black text-slate-800 text-xl leading-tight mb-2 uppercase italic">{sala.nome}</h3>
              <p className="text-slate-500 text-xs line-clamp-2 mb-4">{sala.descricao}</p>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Users size={16} />
                <span className="text-xs font-bold">{sala.membros_count || 0} Membros</span>
              </div>
              <button className="text-[#ff0082] font-black text-[10px] uppercase tracking-widest hover:underline">Configurar</button>
            </div>
          </div>
        )) : (
          <div className="col-span-3 py-20 text-center text-slate-400 italic">Nenhuma sala encontrada no backend.</div>
        )}
      </div>
    </div>
  );
}