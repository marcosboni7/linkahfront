'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar'; // Garanta que este arquivo existe
import { 
  Users, Search, ShieldCheck, Save, X, Loader2, 
  RefreshCcw, UserMinus, UserCheck, Lock, Calendar
} from 'lucide-react';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | number | null>(null);
  const [userParaEditar, setUserParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  const API_URL = 'https://linkah-api.onrender.com/api/usuarios';

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setUsuarios(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  const handleToggleBan = async (user: any) => {
    const idIdentificador = user.id || user.email;
    if (!idIdentificador) return;

    const novoStatus = user.status === 'Banido' ? 'Ativo' : 'Banido';
    if (!window.confirm(`Confirmar alteração de ${user.nome} para ${novoStatus}?`)) return;

    setIsProcessing(idIdentificador);
    try {
      const res = await fetch(`${API_URL}/${idIdentificador}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: novoStatus })
      });

      if (res.ok) {
        setUsuarios(prev => prev.map(u => 
          (u.email === user.email) ? { ...u, status: novoStatus } : u
        ));
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    const idIdentificador = userParaEditar.id || userParaEditar.email;
    setIsProcessing(idIdentificador);
    try {
      const res = await fetch(`${API_URL}/${idIdentificador}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userParaEditar)
      });
      if (res.ok) {
        setIsModalOpen(false);
        carregarUsuarios();
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    u.email?.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900">
      {/* SIDEBAR IMPORTADA */}
      <Sidebar abaAtiva="usuarios" setAbaAtiva={() => {}} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">Usuários</h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase">
                {usuarios.length} Registrados
              </span>
            </div>
          </div>
          <button onClick={carregarUsuarios} className="p-3 hover:bg-slate-100 rounded-full text-slate-400">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar usuário..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all font-medium"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100">
                  <th className="px-8 py-6">Usuário</th>
                  <th className="px-8 py-6">Contato</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Ações Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center animate-pulse font-bold text-slate-400">Carregando base...</td></tr>
                ) : (
                  usuariosFiltrados.map((user) => (
                    <tr key={user.email} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <p className="font-black text-slate-900">{user.nome || 'Sem Nome'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600 italic">{user.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black ${user.status === 'Banido' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {user.status === 'Banido' ? '● BANIDO' : '● ATIVO'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setUserParaEditar(user); setIsModalOpen(true); }} className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 border border-slate-200">
                            <Lock size={18} />
                          </button>
                          <button 
                            onClick={() => handleToggleBan(user)}
                            className={`p-3 border rounded-xl transition-all ${user.status === 'Banido' ? 'bg-emerald-500 text-white' : 'hover:bg-red-500 hover:text-white border-slate-200 text-slate-400'}`}
                          >
                            {isProcessing === (user.id || user.email) ? <Loader2 size={18} className="animate-spin" /> : (user.status === 'Banido' ? <UserCheck size={18} /> : <UserMinus size={18} />)}
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
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && userParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Editar Perfil</h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={salvarEdicao} className="space-y-6 text-left">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 block mb-2">Nome</label>
                <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none" value={userParaEditar.nome || ''} onChange={(e) => setUserParaEditar({...userParaEditar, nome: e.target.value})} />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-[#ff4d4d] block mb-2">Nova Senha Staff</label>
                <input type="text" className="w-full bg-slate-50 border border-red-100 rounded-2xl p-4 font-bold outline-none" placeholder="Definir nova senha..." onChange={(e) => setUserParaEditar({...userParaEditar, password: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase hover:bg-[#ff4d4d] transition-all">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}