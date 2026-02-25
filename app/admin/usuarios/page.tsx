'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCcw, UserMinus, UserCheck, 
  Key, Lock, X, Save, Mail, 
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com/api/usuarios';

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
      title: isBanido ? t.promptReactivateTitle : t.promptSuspendTitle,
      text: `${user.nome} -> ${isBanido ? t.statusActive : t.statusBanned}?`,
      icon: isBanido ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isBanido ? '#10b981' : '#ef4444',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: isBanido ? t.promptConfirmReactivate : t.promptConfirmSuspend,
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
            title: t.done,
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
        return Swal.fire('!', t.labelMinChars, 'info');
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
            title: t.done,
            icon: 'success',
            customClass: { popup: 'rounded-[2.5rem]' }
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
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">{t.membersTitle}</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">{t.membersSub}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder={t.searchMembersPlaceholder}
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-pink-50 font-bold shadow-sm w-full md:w-80 transition-all text-sm"
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

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-8">{t.thMember}</th>
                <th className="px-10 py-8 text-center">{t.thStatus}</th>
                <th className="px-10 py-8 text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-10 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
                    <p className="text-slate-300 font-black uppercase text-[10px] mt-4 tracking-widest">{t.accessingDatabase}</p>
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
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              user.status === 'Banido' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                          }`}>
                              {user.status === 'Banido' ? t.statusBanned : t.statusActive}
                          </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setUsuarioSelecionado(user); setIsModalSenhaOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            <Key size={16} />
                          </button>
                          <button onClick={() => handleStatus(user)} disabled={isProcessing === user.id} className={`w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl transition-all shadow-sm ${
                              user.status === 'Banido' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:bg-red-500 hover:text-white'
                          }`}>
                            {isProcessing === user.id ? <Loader2 size={16} className="animate-spin" /> : (user.status === 'Banido' ? <UserCheck size={16} /> : <UserMinus size={16} />)}
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

      {isModalSenhaOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setIsModalSenhaOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900"><X size={24} /></button>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-pink-50 text-[#C22973] rounded-3xl flex items-center justify-center mx-auto mb-4"><Lock size={28} /></div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic">{t.newPasswordTitle}</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">Member: {usuarioSelecionado?.nome}</p>
            </div>
            <form onSubmit={handleAlterarSenha} className="space-y-6">
              <input type="password" required placeholder={t.labelMinChars} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white font-black italic text-slate-900 text-lg" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
              <button type="submit" disabled={isProcessing === 'senha'} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#C22973] transition-all flex items-center justify-center gap-2">
                {isProcessing === 'senha' ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {t.btnSavePassword}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}