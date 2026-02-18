'use client';
import { useState, useEffect } from 'react';
import { Plus, Users, Lock, Trash2, Settings } from 'lucide-react';

export default function AdminSalasPage() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarSalas = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidades/salas');
      const data = await res.json();
      setSalas(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarSalas(); }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Salas da <span className="text-[#ff0082]">Comunidade</span></h1>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={20} /> Criar Sala</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
           <p className="col-span-3 text-center py-10 font-bold text-slate-400 italic">Carregando salas...</p>
        ) : salas.map((sala: any) => (
          <div key={sala.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between mb-4">
              <span className="p-2 bg-slate-50 rounded-xl text-slate-400"><Lock size={18} /></span>
              <div className="flex gap-2">
                <button className="text-slate-300 hover:text-[#ff0082]"><Settings size={16} /></button>
                <button className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-xl uppercase italic leading-tight mb-2">{sala.nome}</h3>
            <p className="text-slate-500 text-xs line-clamp-2 mb-6">{sala.descricao}</p>
            <div className="flex items-center gap-2 text-slate-400 border-t pt-4 border-slate-50">
              <Users size={16} />
              <span className="text-[10px] font-black uppercase">{sala.membros_count || 0} Membros</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}