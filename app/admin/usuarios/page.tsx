'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCcw, UserMinus, UserCheck, 
  Key, Lock, X, Save, ShieldAlert, Mail, User,
  Loader2, MoreHorizontal
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- CONFIGURAÇÃO DA API DA AWS ---
const API_URL = 'https://r8amtavirp.us-east-1.awsapprunner.com/api/usuarios';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [isModalSenhaOpen, setIsModalSenhaOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("🚨 [DEBUG] Erro ao carregar membros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleStatus = async (user: any) => {
    const isBanido = user.status === 'Banido';
    const novoStatus = isBanido ? 'Ativo' : 'Banido';
    
    const result = await Swal.fire({
      title: isBanido ? 'Reativar Membro?' : 'Suspender Membro?',
      text: `Deseja alterar o acesso de ${user.nome} para ${novoStatus}?`,
      icon: isBanido ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isBanido ? '#10b981' : '#ef4444',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: isBanido ? 'Sim, Reativar' : 'Sim, Suspender',
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (!result.isConfirmed) return;

    setIsProcessing(user.id);
    try {
      const res = await fetch(`${API_URL}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: novoStatus })
      });

      if (res.ok) {
        Swal.fire({
            icon: 'success',
            title: `Status: ${novoStatus}`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        carregarUsuarios();
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao atualizar status.', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
        return Swal.fire('Atenção', 'A senha deve ter no mínimo 6 caracteres', 'info');
    }

    setIsProcessing('senha');
    try {
      const res = await fetch(`${API_URL}/${usuarioSelecionado.id}/senha`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: novaSenha })
      });

      if (res.ok) {
        Swal.fire({
            title: 'Senha Alterada!',
            icon: 'success',
            customClass: { popup: 'rounded-[2.5rem]' }
        });
        setIsModalSenhaOpen(false);
        setNovaSenha('');
      }
    } catch (err) {
      Swal.fire('Erro', 'Erro ao conectar com a API.', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER STAFF */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">Membros</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Controle de acesso e moderação de contas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Nome ou e-mail..." 
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-slate-100 font-bold shadow-sm w-full md:w-80 transition-all placeholder:text-slate-200 text-sm"
            />
          </div>
          <button 
            onClick={carregarUsuarios} 
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 transition-all shadow-sm active:scale-95"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin text-[#C22973]' : ''} />
          </button>
        </div>
      </header>

      {/* LISTAGEM DE USUÁRIOS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-8">Membro</th>
                <th className="px-10 py-8 text-center">Status de Acesso</th>
                <th className="px-10 py-8 text-center">Nível</th>
                <th className="px-10 py-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
                    <p className="text-slate-300 font-black uppercase text-[10px] mt-4 tracking-widest">Acessando Database...</p>
                  </td>
                </tr>
              ) : (
                usuarios
                  .filter(u => 
                    u.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) || 
                    u.email?.toLowerCase().includes(filtroBusca.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.id || user.email} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center font-black italic text-xl shadow-lg shrink-0">
                            {user.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic tracking-tight text-base leading-none mb-1">{user.nome || 'No Name'}</p>
                            <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                                <Mail size={10} className="text-[#C22973]" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                user.status === 'Banido' 
                                ? 'bg-red-50 text-red-500 border-red-100' 
                                : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${user.status === 'Banido' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                {user.status === 'Banido' ? 'Suspenso' : 'Ativo'}
                            </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Member</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => { setUsuarioSelecionado(user); setIsModalSenhaOpen(true); }}
                            className="w-11 h-11 flex items-center justify-center bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-slate-400 transition-all shadow-sm"
                            title="Resetar Senha"
                          >
                            <Key size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatus(user)}
                            disabled={isProcessing === user.id}
                            className={`w-11 h-11 flex items-center justify-center border border-slate-200 rounded-xl transition-all shadow-sm ${
                              user.status === 'Banido' 
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                              : 'bg-white text-slate-400 hover:bg-red-500 hover:text-white'
                            }`}
                            title={user.status === 'Banido' ? "Reativar" : "Banir"}
                          >
                            {isProcessing === user.id ? <Loader2 size={18} className="animate-spin" /> : (user.status === 'Banido' ? <UserCheck size={18} /> : <UserMinus size={18} />)}
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

      {/* MODAL DE SEGURANÇA (SENHA) */}
      {isModalSenhaOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            
            <button onClick={() => setIsModalSenhaOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-300 hover:text-slate-900"><X size={24} /></button>

            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-pink-50 text-[#C22973] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Nova <span className="text-[#C22973]">Senha</span></h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Alterando acesso de: {usuarioSelecionado?.nome}</p>
            </div>

            <form onSubmit={handleAlterarSenha} className="space-y-8">
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:ring-4 ring-pink-50 font-black italic text-slate-900 transition-all placeholder:font-medium placeholder:italic text-lg"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoFocus
                />
              </div>

              <button 
                type="submit"
                disabled={isProcessing === 'senha'}
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] hover:bg-[#C22973] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 text-xs"
              >
                {isProcessing === 'senha' ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Confirmar Reset
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}