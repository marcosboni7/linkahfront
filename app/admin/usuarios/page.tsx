'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, Save, X, Loader2, 
  RefreshCcw, LayoutDashboard, Ticket, MessageCircle, 
  Lock, UserMinus, UserCheck, Mail, Hash, Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [userParaEditar, setUserParaEditar] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  // Endpoint principal de usuários
  const API_URL = 'https://linkah-api.onrender.com/api/usuarios';

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      // Fazemos o fetch da lista completa
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        // data deve ser o array com todos os registros do banco
        setUsuarios(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar banco de usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  const handleToggleBan = async (user: any) => {
    const novoStatus = user.status === 'Banido' ? 'Ativo' : 'Banido';
    const confirmar = window.confirm(`⚠️ Confirmar alteração: ${user.nome} ficará como ${novoStatus}?`);
    
    if (!confirmar) return;

    setIsProcessing(user.id);
    try {
      const res = await fetch(`${API_URL}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: novoStatus })
      });

      if (res.ok) {
        setUsuarios(prev => prev.map(u => u.id === user.id ? { ...u, status: novoStatus } : u));
      }
    } catch (err) {
      alert("Erro ao processar banimento.");
    } finally {
      setIsProcessing(null);
    }
  };

  const salvarEdicao = async (e: any) => {
    e.preventDefault();
    setIsProcessing(userParaEditar.id);
    try {
      const res = await fetch(`${API_URL}/${userParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userParaEditar)
      });
      if (res.ok) {
        setIsModalOpen(false);
        carregarUsuarios();
        alert("Dados e senha atualizados!");
      }
    } catch (err) {
      alert("Erro ao salvar alterações.");
    } finally {
      setIsProcessing(null);
    }
  };

  // Busca em tempo real em todos os campos
  const usuariosFiltrados = usuarios.filter(u => 
    u.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    u.email?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    u.id?.toString() === filtroBusca
  );

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#ff4d4d] rounded-2xl flex items-center justify-center shadow-lg"><ShieldCheck size={24} /></div>
            <p className="text-xl font-black tracking-tighter">LINKAH STAFF</p>
          </div>
          <nav className="space-y-3">
            <Link href="/admin/dashboard" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 transition-all">
              <LayoutDashboard size={20}/> Dashboard
            </Link>
            <Link href="/admin/eventos" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 transition-all">
              <Ticket size={20}/> Eventos
            </Link>
            <Link href="/admin/comunidades" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-white/5 transition-all">
              <MessageCircle size={20}/> Comunidades
            </Link>
            <Link href="/admin/usuarios" className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm bg-[#ff4d4d] text-white shadow-xl shadow-[#ff4d4d]/20 transition-all">
              <Users size={20}/> Usuários
            </Link>
          </nav>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">Base de Usuários</h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                {usuarios.length} Registrados
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Controle de acesso, senhas e status de banimento.</p>
          </div>
          <button onClick={carregarUsuarios} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-8">
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, E-mail ou ID..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all font-medium"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                  <th className="px-8 py-6">ID / Usuário</th>
                  <th className="px-8 py-6">E-mail / Cadastro</th>
                  <th className="px-8 py-6">Status / Role</th>
                  <th className="px-8 py-6 text-right">Ações Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">Lendo banco de dados...</td></tr>
                ) : (
                  usuariosFiltrados.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-slate-300">#{user.id}</span>
                          <p className="font-black text-slate-900">{user.nome || 'Sem Nome'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-slate-600 italic">{user.email}</p>
                          <span className="text-[10px] text-slate-300 flex items-center gap-1 uppercase tracking-tighter">
                            <Calendar size={10}/> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {user.role || 'user'}
                          </span>
                          <span className={`text-[10px] font-black ${user.status === 'Banido' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {user.status === 'Banido' ? '● BANIDO' : '● ATIVO'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => { setUserParaEditar(user); setIsModalOpen(true); }}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
                            title="Alterar Senha e Dados"
                          >
                            <Lock size={18} />
                          </button>
                          <button 
                            onClick={() => handleToggleBan(user)}
                            className={`p-3 border rounded-xl transition-all shadow-sm ${
                              user.status === 'Banido' 
                              ? 'bg-emerald-500 text-white border-emerald-500' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500'
                            }`}
                            title={user.status === 'Banido' ? "Reativar" : "Banir"}
                          >
                            {user.status === 'Banido' ? <UserCheck size={18} /> : <UserMinus size={18} />}
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

      {/* MODAL STAFF - ALTERAR SENHA E NOME */}
      {isModalOpen && userParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6 text-left">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                 <h2 className="text-2xl font-black">Editar Membro</h2>
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">ID: #{userParaEditar.id}</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400"><X /></button>
            </div>
            
            <form onSubmit={salvarEdicao} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400">Nome Completo</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10"
                  value={userParaEditar.nome || ''}
                  onChange={(e) => setUserParaEditar({...userParaEditar, nome: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#ff4d4d]">🔐 Definir Nova Senha</label>
                <input 
                  type="text"
                  placeholder="Digite a nova senha aqui..."
                  className="w-full bg-slate-50 border border-red-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 ring-[#ff4d4d]/10"
                  onChange={(e) => setUserParaEditar({...userParaEditar, password: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 italic font-medium">Ao salvar, a senha antiga será invalidada e esta passará a ser a nova.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400">Cargo / Role</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold outline-none"
                  value={userParaEditar.role || 'user'}
                  onChange={(e) => setUserParaEditar({...userParaEditar, role: e.target.value})}
                >
                  <option value="user">Membro Comum</option>
                  <option value="admin">Staff Administrador</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isProcessing === userParaEditar.id ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Atualizar Perfil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}