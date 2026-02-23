'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCcw, UserMinus, UserCheck, Lock, Loader2 } from 'lucide-react';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/usuarios';

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black tracking-tight">Gestão de Usuários</h1>
        <button onClick={carregarUsuarios} className="p-3 hover:bg-white rounded-full text-slate-400 shadow-sm transition-all">
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar usuário..." 
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-[#ff4d4d]/20 font-medium shadow-sm"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100">
              <th className="px-8 py-6">Usuário</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.filter(u => u.nome?.toLowerCase().includes(filtroBusca.toLowerCase())).map((user) => (
              <tr key={user.email} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900">{user.nome || 'Sem Nome'}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[10px] font-black ${user.status === 'Banido' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {user.status === 'Banido' ? '● BANIDO' : '● ATIVO'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right font-bold text-slate-400 hover:text-slate-900 cursor-pointer">
                  Ações Staff
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}