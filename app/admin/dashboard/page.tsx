'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Ticket,
  MessageCircle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Loader2,
  Activity,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

export default function AdminDashboard() {
  const { t }: any = useLanguage();

  const [stats, setStats] = useState({
    usuarios: 0,
    eventos: 0,
    comunidades: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const fetchStats = async () => {
    setLoading(true);
    setError(false);

    try {
      const [resUsers, resEvents, resCommu] = await Promise.all([
        fetch(`${API_URL_BASE}/api/usuarios`),
        fetch(`${API_URL_BASE}/api/eventos`),
        fetch(`${API_URL_BASE}/api/comunidades/total`),
      ]);

      if (!resUsers.ok || !resEvents.ok || !resCommu.ok) {
        throw new Error('Falha na resposta da API');
      }

      const usersData = await resUsers.json();
      const eventsData = await resEvents.json();
      const commuData = await resCommu.json();

      setStats({
        usuarios: Array.isArray(usersData) ? usersData.length : 0,
        eventos: Array.isArray(eventsData) ? eventsData.length : 0,
        comunidades: Array.isArray(commuData)
          ? commuData.length
          : typeof commuData?.total === 'number'
          ? commuData.total
          : 0,
      });

      setLastSync(new Date());
    } catch (err) {
      console.error('Erro ao sincronizar dados do Dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const statusLabel = loading
    ? t?.syncing || 'Sincronizando'
    : error
    ? 'System Error'
    : t?.systemStable || 'Sistema Estável';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.06),transparent_30%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-12 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 mb-4">
              <ShieldCheck size={14} className="text-violet-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
                Administrator Access
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
              {t?.consoleTitle || 'Console'}{' '}
              <span className="text-slate-400">
                {t?.consoleGeneral || 'General'}
              </span>
            </h1>

            <p className="text-sm text-slate-500 font-medium mt-3">
              {t?.infraSub || 'Infraestrutura, monitoramento e métricas em tempo real'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  loading
                    ? 'bg-amber-400 animate-pulse'
                    : error
                    ? 'bg-red-500'
                    : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                }`}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                {statusLabel}
              </span>
            </div>

            <button
              onClick={fetchStats}
              disabled={loading}
              className="w-12 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center"
            >
              <Activity
                size={18}
                className={loading ? 'animate-spin text-slate-400' : 'text-violet-600'}
              />
            </button>
          </div>
        </header>

        {/* HERO CARD */}
        <section className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-violet-500 mb-2">
                Overview
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Painel administrativo da plataforma
              </h2>
              <p className="text-slate-500 mt-3 max-w-2xl">
                Acompanhe usuários, eventos e comunidades com uma visão centralizada,
                limpa e atualizada automaticamente.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  Última sincronização
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {lastSync.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MÉTRICAS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EVENTOS */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center mb-6">
              <Ticket size={28} />
            </div>

            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400 mb-2">
              {t?.activeEvents || 'Eventos ativos'}
            </p>

            <div className="flex items-end gap-3">
              {loading ? (
                <Loader2 className="animate-spin text-slate-300" size={30} />
              ) : (
                <p className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
                  {stats.eventos}
                </p>
              )}

              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500 mb-2">
                Live
              </span>
            </div>
          </div>

          {/* USUÁRIOS */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-6">
              <Users size={28} />
            </div>

            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400 mb-2">
              {t?.totalMembers || 'Total de membros'}
            </p>

            <div className="flex items-end gap-3">
              {loading ? (
                <Loader2 className="animate-spin text-slate-300" size={30} />
              ) : (
                <p className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
                  {stats.usuarios}
                </p>
              )}

              <div className="inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold mb-2">
                <ArrowUpRight size={14} />
                +{stats.usuarios > 0 ? '12' : '0'}%
              </div>
            </div>
          </div>

          {/* COMUNIDADES */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100 flex items-center justify-center mb-6">
              <MessageCircle size={28} />
            </div>

            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400 mb-2">
              {t?.communities || 'Comunidades'}
            </p>

            <div className="flex items-end gap-3">
              {loading ? (
                <Loader2 className="animate-spin text-slate-300" size={30} />
              ) : (
                <p className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
                  {stats.comunidades}
                </p>
              )}

              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">
                Hubs
              </span>
            </div>
          </div>
        </section>

        {/* STATUS / LOGS */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-7 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-violet-500 font-bold mb-1">
                  Logs
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  {t?.systemLogs || 'System Logs'}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-5 flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    error
                      ? 'bg-red-50 text-red-500 border border-red-100'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}
                >
                  {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {error
                      ? 'API Connection Failed'
                      : t?.syncSuccess || 'Sincronização concluída'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock size={12} />
                      {lastSync.toLocaleTimeString()}
                    </span>

                    <span
                      className={`text-[11px] font-semibold ${
                        error ? 'text-red-500' : 'text-emerald-600'
                      }`}
                    >
                      {error ? 'Critical' : 'Success'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-7 md:p-8 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-violet-500 font-bold mb-2">
              Health Check
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Status do ambiente
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Monitore a saúde do sistema, valide a resposta da API e acompanhe o
              comportamento geral do painel.
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">API</span>
                <span
                  className={`text-sm font-semibold ${
                    error ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  {error ? 'Erro' : 'Online'}
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Sync</span>
                <span className="text-sm font-semibold text-violet-600">
                  {loading ? 'Running' : 'Idle'}
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Atualização</span>
                <span className="text-sm font-semibold text-slate-700">5 min</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}