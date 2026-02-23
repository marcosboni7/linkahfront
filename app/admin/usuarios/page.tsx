'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCcw, UserMinus, UserCheck, 
  Key, Lock, X, Save, ShieldAlert 
} from 'lucide-react';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [isModalSenhaOpen, setIsModalSenhaOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');

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

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleStatus = async (user: any) => {
    const novoStatus = user.status === 'Banido' ? 'Ativo' : 'Banido';
    if (!confirm(`Deseja alterar o status de ${user.nome} para ${novoStatus}?`)) return;

    try {
      await fetch(`${API_URL}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: novoStatus })
      });
      carregarUsuarios();
    } catch (err) {
      alert("Erro ao atualizar status");
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) return alert("A senha deve ter no mínimo 6 caracteres");

    try {
      const res = await fetch(`${API_URL}/${usuarioSelecionado.id}/senha`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: novaSenha })
      });

      if (res.ok) {
        alert("Senha alterada com sucesso!");
        setIsModalSenhaOpen(false);
        setNovaSenha('');
      } else {
        alert("Erro ao processar alteração no servidor.");
      }
    } catch (err) {
      alert("Erro ao conectar com a API.");
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Membros</h1>
          <p className="text-slate-500 font-medium tracking-tight">Gerenciamento de acessos e segurança Linkah.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ff4d4d] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Nome ou e-mail..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-[#ff4d4d]/10 font-medium shadow-sm w-full md:w-80 transition-all text-slate-900"
            />
          </div>
          <button 
            onClick={carregarUsuarios} 
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 transition-all shadow-sm active:scale-95"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* TABELA */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Identificação</th>
                <th className="px-10 py-6">Status do Acesso</th>
                <th className="px-10 py-6 text-right">Ações Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios
                .filter(u => 
                  u.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) || 
                  u.email?.toLowerCase().includes(filtroBusca.toLowerCase())
                )
                .map((user) => (
                  <tr key={user.id || user.email} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-[#ff4d4d]/10 group-hover:text-[#ff4d4d] transition-all shrink-0">
                          {user.nome?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="truncate">
                          <p className="font-black text-slate-900 leading-none mb-1">{user.nome || 'Usuário Linkah'}</p>
                          <p className="text-xs font-medium text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        user.status === 'Banido' 
                        ? 'bg-red-50 text-red-500' 
                        : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Banido' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {user.status === 'Banido' ? 'Suspenso' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setUsuarioSelecionado(user); setIsModalSenhaOpen(true); }}
                          className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm active:scale-95"
                          title="Redefinir Senha"
                        >
                          <Key size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatus(user)}
                          className={`p-3 border border-transparent rounded-xl transition-all shadow-sm active:scale-95 ${
                            user.status === 'Banido' 
                            ? 'hover:bg-emerald-50 text-emerald-500' 
                            : 'hover:bg-red-50 text-red-400'
                          }`}
                          title={user.status === 'Banido' ? "Reativar" : "Banir"}
                        >
                          {user.status === 'Banido' ? <UserCheck size={18} /> : <UserMinus size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        
        {!loading && usuarios.length === 0 && (
          <div className="py-24 text-center">
            <ShieldAlert className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold italic">Nenhum membro encontrado na base.</p>
          </div>
        )}
      </div>

      {/* MODAL DE SENHA */}
      {isModalSenhaOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Nova Senha</h2>
              <button 
                onClick={() => setIsModalSenhaOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
              Você está alterando a senha de <span className="text-slate-900 font-black underline decoration-[#ff4d4d] decoration-2">{usuarioSelecionado?.nome}</span>.
            </p>

            <form onSubmit={handleAlterarSenha} className="space-y-6">
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 ring-blue-500/10 font-bold text-slate-900 transition-all placeholder:font-medium"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Save size={18} /> Salvar Nova Senha
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}