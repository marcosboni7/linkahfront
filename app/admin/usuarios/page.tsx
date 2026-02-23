'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, Save, X, Loader2, 
  RefreshCcw, UserMinus, UserCheck, Lock, Calendar,
  LayoutDashboard, Ticket, MessageSquare, LogOut
} from 'lucide-react';
import Link from 'next/link';

// --- COMPONENTE SIDEBAR INTERNO (Para evitar erro de import) ---
function SidebarLocal({ abaAtiva }: { abaAtiva: string }) {
  return (
    <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0 min-h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff4d4d]/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-black leading-none tracking-tighter">LINKAH</p>
            <p className="text-[10px] font-bold text-[#ff4d4d] tracking-[0.2em] uppercase">Staff Panel</p>
          </div>
        </div>

        <nav className="space-y-3">
          <Link href="/admin/dashboard" className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${abaAtiva === 'dashboard' ? 'bg-[#ff4d4d] text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20}/> Dashboard
          </Link>
          <Link href="/admin/eventos" className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${abaAtiva === 'eventos' ? 'bg-[#ff4d4d] text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <Ticket size={20}/> Gerenciar Eventos
          </Link>
          <Link href="/admin/usuarios" className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${abaAtiva === 'usuarios' ? 'bg-[#ff4d4d] text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <Users size={20}/> Usuários
          </Link>
          <Link href="#" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:text-white hover:bg-white/5">
            <MessageSquare size={20}/> Chat
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-8">
        <Link href="/" className="w-full flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors font-bold text-sm">
          <LogOut size={20} /> Sair do Painel
        </Link>
      </div>
    </aside>
  );
}

// --- PÁGINA PRINCIPAL ---
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
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  const handleToggleBan = async (user: any) => {
    const idIdentificador = user.id || user.email;
    const novoStatus = user.status === 'Banido' ? 'Ativo' : 'Banido';
    if (!window.confirm(`Mudar status de ${user.nome} para ${novoStatus}?`)) return;

    setIsProcessing(idIdentificador);
    try {
      await fetch(`${API_URL}/${idIdentificador}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: novoStatus })
      });
      carregarUsuarios();
    } finally {
      setIsProcessing(null);
    }
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    const idIdentificador = userParaEditar.id || userParaEditar.email;
    setIsProcessing(idIdentificador);
    try {
      await fetch(`${API_URL}/${idIdentificador}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userParaEditar)
      });
      setIsModalOpen(false);
      carregarUsuarios();
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900">
      <SidebarLocal abaAtiva="usuarios" />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-3xl font-black tracking-tight">Gestão de Usuários</h1>
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
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-[#ff4d4d]/20 font-medium"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100">
                  <th className="px-8 py-6">Usuário</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Ações Staff</th>
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
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => { setUserParaEditar(user); setIsModalOpen(true); }} className="p-3 border rounded-xl text-slate-400 hover:text-slate-900"><Lock size={18} /></button>
                        <button onClick={() => handleToggleBan(user)} className={`p-3 border rounded-xl ${user.status === 'Banido' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-red-500 hover:text-white'}`}>
                          {isProcessing === (user.id || user.email) ? <Loader2 size={18} className="animate-spin" /> : (user.status === 'Banido' ? <UserCheck size={18} /> : <UserMinus size={18} />)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && userParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 text-left">
              <h2 className="text-2xl font-black">Editar Perfil</h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={salvarEdicao} className="space-y-6 text-left">
              <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none" value={userParaEditar.nome || ''} onChange={(e) => setUserParaEditar({...userParaEditar, nome: e.target.value})} />
              <input type="text" className="w-full bg-slate-50 border border-red-100 rounded-2xl p-4 font-bold outline-none" placeholder="Definir nova senha..." onChange={(e) => setUserParaEditar({...userParaEditar, password: e.target.value})} />
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase hover:bg-[#ff4d4d] transition-all">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}