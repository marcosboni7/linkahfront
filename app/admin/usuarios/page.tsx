'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCcw,
  UserMinus,
  UserCheck,
  Key,
  Lock,
  X,
  Save,
  Mail,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com/api/usuarios';

export default function AdminUsuarios() {
  const { t }: any = useLanguage();
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
      console.error('🚨 Erro ao carregar membros:', err);
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
      title: isBanido
        ? t.promptReactivateTitle || 'Reativar Membro?'
        : t.promptSuspendTitle || 'Suspender Membro?',
      text: `${user.nome} -> ${isBanido ? t.statusActive || 'Ativo' : t.statusBanned || 'Banido'}?`,
      icon: isBanido ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isBanido ? '#10b981' : '#7C3AED',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: isBanido
        ? t.promptConfirmReactivate || 'Sim, Ativar'
        : t.promptConfirmSuspend || 'Sim, Banir',
      customClass: { popup: 'rounded-[2rem]' },
    });

    if (!result.isConfirmed) return;

    setIsProcessing(user.id);
    try {
      const res = await fetch(`${API_URL}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: novoStatus }),
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: t.done || 'Sucesso',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
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
        body: JSON.stringify({ senha: novaSenha }),
      });

      if (res.ok) {
        Swal.fire({
          title: t.done || 'Senha Alterada',
          icon: 'success',
          customClass: { popup: 'rounded-[2rem]' },
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

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      u.email?.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.05),transparent_30%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-violet-500 font-bold mb-2">
              Admin
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
              {t.membersTitle || 'Membros'}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-3">
              {t.membersSub || 'Controle de acessos e permissões'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder={t.searchMembersPlaceholder || 'Buscar por nome ou email...'}
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-violet-500/5 focus:border-violet-300 font-medium shadow-sm w-full md:w-80 transition-all text-sm text-slate-900"
              />
            </div>

            <button
              onClick={carregarUsuarios}
              className="w-12 h-12 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 transition-all shadow-sm active:scale-95 flex items-center justify-center"
            >
              <RefreshCcw
                size={18}
                className={loading ? 'animate-spin text-violet-500' : 'text-violet-600'}
              />
            </button>
          </div>
        </header>

        <div className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-violet-500 mb-2">
                Overview
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Gestão de usuários da plataforma
              </h2>
              <p className="text-slate-500 mt-3 max-w-2xl">
                Controle acesso, reative membros, suspenda perfis e atualize credenciais
                com uma interface mais limpa e consistente.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  Total
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {usuariosFiltrados.length} usuários
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] uppercase font-bold tracking-[0.18em] border-b border-slate-100">
                  <th className="px-8 py-5">{t.thMember || 'Membro'}</th>
                  <th className="px-8 py-5 text-center">{t.thStatus || 'Status'}</th>
                  <th className="px-8 py-5 text-right">{t.thActions || 'Gerenciamento'}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-16 text-center">
                      <Loader2 className="animate-spin mx-auto text-slate-300" size={34} />
                      <p className="text-slate-400 font-medium text-sm mt-4">
                        {t.accessingDatabase || 'Acessando base de dados...'}
                      </p>
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-medium">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-semibold shadow-sm shrink-0">
                            {user.nome?.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 leading-none mb-1 truncate">
                              {user.nome || 'Member'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 truncate">
                              <Mail size={11} className="text-violet-500 shrink-0" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] border ${
                            user.status === 'Banido'
                              ? 'bg-red-50 text-red-500 border-red-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}
                        >
                          {user.status === 'Banido'
                            ? t.statusBanned || 'Banido'
                            : t.statusActive || 'Ativo'}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setUsuarioSelecionado(user);
                              setIsModalSenhaOpen(true);
                            }}
                            title="Alterar Senha"
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-violet-50 hover:text-violet-600 transition-all shadow-sm active:scale-95"
                          >
                            <Key size={16} />
                          </button>

                          <button
                            onClick={() => handleStatus(user)}
                            disabled={isProcessing === user.id}
                            title={user.status === 'Banido' ? 'Reativar' : 'Banir'}
                            className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-all shadow-sm active:scale-95 ${
                              user.status === 'Banido'
                                ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                            }`}
                          >
                            {isProcessing === user.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : user.status === 'Banido' ? (
                              <UserCheck size={16} />
                            ) : (
                              <UserMinus size={16} />
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

        {isModalSenhaOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-slate-200">
              <button
                onClick={() => setIsModalSenhaOpen(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-700 transition-colors"
              >
                <X size={22} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-violet-100">
                  <Lock size={26} />
                </div>

                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {t.newPasswordTitle || 'Segurança'}
                </h2>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-300 tracking-[0.18em]">
                    Protocolo:
                  </span>
                  <p className="text-slate-900 text-[11px] font-medium uppercase truncate max-w-[170px]">
                    {usuarioSelecionado?.nome}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAlterarSenha} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 ml-1">
                    Nova Credencial
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder={t.labelMinChars || '6+ caracteres'}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 ring-violet-500/5 focus:border-violet-300 font-medium text-slate-900 text-base transition-all"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing === 'senha'}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-violet-200 active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessing === 'senha' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {t.btnSavePassword || 'Atualizar Acesso'}
                </button>

                <div className="flex items-center gap-2 justify-center text-amber-500">
                  <ShieldAlert size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    Esta ação é irreversível
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}