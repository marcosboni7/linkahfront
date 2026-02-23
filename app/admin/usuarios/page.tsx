'use client';

import { useState, useEffect } from 'react';
// Importando a Sidebar oficial (ajuste o caminho se necessário)
import Sidebar from '../Sidebar';
import { 
  Users, Search, Save, X, Loader2, 
  RefreshCcw, UserMinus, UserCheck, Lock
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

  useEffect(() => { 
    carregarUsuarios(); 
  }, []);

  const handleToggleBan = async (user: any) => {
    const idIdentificador = user.id || user.email;
    const novoStatus = user.status === 'Banido' ? 'Ativo' : 'Banido';
    
    if (!window.confirm(`Mudar status de ${user.nome || 'usuário'} para ${novoStatus}?`)) return;

    setIsProcessing(idIdentificador);
    try {
      const res = await fetch(`${API_URL}/${idIdentificador}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: novoStatus })
      });
      
      if (res.ok) {
        carregarUsuarios();
      } else {
        alert("Erro ao atualizar status no servidor.");
      }
    } catch (err) {
      alert("Erro na conexão com a API.");
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
    } catch (err) {
      alert("Erro ao salvar alterações.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-900">
      {/* Usando a Sidebar global que criamos anteriormente */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Gestão de Usuários</h1>
            <p className="text-slate-400 text-sm font-medium">Controle de acessos e permissões da LINKAH.</p>
          </div>
          <button onClick={carregarUsuarios} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all font-medium"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100">
                  <th className="px-8 py-6">Perfil do Usuário</th>
                  <th className="px-8 py-6">Status da Conta</th>
                  <th className="px-8 py-6 text-right">Ações Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios
                  .filter(u => 
                    u.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) || 
                    u.email?.toLowerCase().includes(filtroBusca.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.email} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                            {(user.nome || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{user.nome || 'Usuário LINKAH'}</p>
                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.status === 'Banido' 
                            ? 'bg-red-50 text-red-500' 
                            : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          <span className="mr-1.5 text-xs">●</span>
                          {user.status === 'Banido' ? 'Conta Banida' : 'Conta Ativa'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => { setUserParaEditar(user); setIsModalOpen(true); }} 
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                            title="Editar Dados"
                          >
                            <Lock size={18} />
                          </button>
                          <button 
                            onClick={() => handleToggleBan(user)} 
                            disabled={isProcessing === (user.id || user.email)}
                            className={`p-3 border rounded-xl transition-all shadow-sm ${
                              user.status === 'Banido' 
                                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600' 
                                : 'bg-white border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                            }`}
                            title={user.status === 'Banido' ? 'Reativar' : 'Banir'}
                          >
                            {isProcessing === (user.id || user.email) ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              user.status === 'Banido' ? <UserCheck size={18} /> : <UserMinus size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            
            {!loading && usuarios.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-bold">
                Nenhum usuário encontrado na base de dados.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && userParaEditar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black">Editar Perfil</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{userParaEditar.email}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>
            
            <form onSubmit={salvarEdicao} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Nome Completo</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-[#ff4d4d]/20 transition-all" 
                  value={userParaEditar.nome || ''} 
                  onChange={(e) => setUserParaEditar({...userParaEditar, nome: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Nova Senha (Staff Override)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-red-50 rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-red-500/10 placeholder:text-slate-300 transition-all" 
                  placeholder="Deixe em branco para não alterar..." 
                  onChange={(e) => setUserParaEditar({...userParaEditar, password: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
              >
                <Save size={20} /> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}