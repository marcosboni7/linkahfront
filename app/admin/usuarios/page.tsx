'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCcw, UserMinus, UserCheck, 
  Key, Lock, X, Save, Mail, 
  Loader2, ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com/api/usuarios';

export default function AdminUsuarios() {
  const { t } = useLanguage();
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
      if (!res.ok) throw new Error('Falha ao buscar usuários');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("🚨 Erro ao carregar membros:", err);
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
      title: isBanido ? (t.promptReactivateTitle || 'Reativar Membro?') : (t.promptSuspendTitle || 'Suspender Membro?'),
      text: `${user.nome} -> ${isBanido ? (t.statusActive || 'Ativo') : (t.statusBanned || 'Banido')}?`,
      icon: isBanido ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isBanido ? '#10b981' : '#0f172a',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: isBanido ? (t.promptConfirmReactivate || 'Sim, Ativar') : (t.promptConfirmSuspend || 'Sim, Banir'),
      customClass: { popup: 'rounded-[3rem]' }
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
            title: t.done || 'Sucesso',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        carregarUsuarios();
      }
    } catch (err) {
      Swal.fire('Error', 'Server connection failed', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
        return Swal.fire('!', t.labelMinChars || 'Mínimo de 6 caracteres', 'info');
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
            title: t.done || 'Senha Alterada',
            icon: 'success',
            customClass: { popup: 'rounded-[3rem]' }
        });
        setIsModalSenhaOpen(false);
        setNovaSenha('');
      }
    } catch (err) {
      Swal.fire('Error', 'Update failed', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
            {t.membersTitle || 'Membros'}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">
            {t.membersSub || 'Controle de Acessos e Permissões'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder={t.searchMembersPlaceholder || 'Buscar por nome ou email...'}
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-pink-50 font-bold shadow-sm w-full md:w-80 transition-all text-sm text-slate-900"
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

      {/* TABELA DE USUÁRIOS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-8">{t.thMember || 'Membro'}</th>
                <th className="px-10 py-8 text-center">{t.thStatus || 'Status'}</th>
                <th className="px-10 py-8 text-right">{t.thActions || 'Gerenciamento'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-10 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
                    <p className="text-slate-300 font-black uppercase text-[10px] mt-4 tracking-widest">{t.accessingDatabase || 'Acessando Base de Dados...'}</p>
                  </td>
                </tr>
              ) : (
                usuarios
                  .filter(u => 
                    u.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) || 
                    u.email?.toLowerCase().includes(filtroBusca.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic shadow-lg shrink-0">
                            {user.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic tracking-tight">{user.nome || 'Member'}</p>
                            <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                                <Mail size={10} className="text-[#C22973]" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                              user.status === 'Banido' 
                              ? 'bg-red-50 text-red-500 border-red-100' 
                              : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                          }`}>
                              {user.status === 'Banido' ? (t.statusBanned || 'Banido') : (t.statusActive || 'Ativo')}
                          </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          {/* Botão de Alterar Senha */}
                          <button 
                            onClick={() => { setUsuarioSelecionado(user); setIsModalSenhaOpen(true); }} 
                            title="Alterar Senha"
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <Key size={16} />
                          </button>
                          
                          {/* Botão de Banir/Reativar */}
                          <button 
                            onClick={() => handleStatus(user)} 
                            disabled={isProcessing === user.id} 
                            title={user.status === 'Banido' ? 'Reativar' : 'Banir'}
                            className={`w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl transition-all shadow-sm active:scale-90 ${
                                user.status === 'Banido' 
                                ? 'bg-emerald-500 text-white border-emerald-400' 
                                : 'bg-white text-slate-400 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            {isProcessing === user.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                user.status === 'Banido' ? <UserCheck size={16} /> : <UserMinus size={16} />
                            )}
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

      {/* MODAL TROCA DE SENHA */}
      {isModalSenhaOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20">
            <button 
                onClick={() => setIsModalSenhaOpen(false)} 
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
            >
                <X size={24} />
            </button>
            
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-pink-50 text-[#C22973] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Lock size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                {t.newPasswordTitle || 'Segurança'}
              </h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Protocolo:</span>
                <p className="text-slate-900 text-[10px] font-bold uppercase truncate max-w-[150px]">
                  {usuarioSelecionado?.nome}
                </p>
              </div>
            </div>

            <form onSubmit={handleAlterarSenha} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Nova Credencial</label>
                <input 
                    type="password" 
                    required 
                    autoFocus
                    placeholder={t.labelMinChars || '6+ caracteres'} 
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-pink-50 font-black italic text-slate-900 text-lg transition-all" 
                    value={novaSenha} 
                    onChange={(e) => setNovaSenha(e.target.value)} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isProcessing === 'senha'} 
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] hover:bg-[#C22973] transition-all flex items-center justify-center gap-3 text-xs shadow-xl active:scale-95 disabled:opacity-50"
              >
                {isProcessing === 'senha' ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {t.btnSavePassword || 'Atualizar Acesso'}
              </button>
              
              <div className="flex items-center gap-2 justify-center text-amber-500">
                <ShieldAlert size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Esta ação é irreversível</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}