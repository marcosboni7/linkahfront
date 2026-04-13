'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Trash2,
  RefreshCcw,
  MapPin,
  Save,
  X,
  Edit3,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Activity,
  Clock,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com/api/eventos';

function isEventoExcluido(evento: any) {
  const status = String(evento?.status || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return status === 'excluido';
}

export default function AdminEventos() {
  const { t }: any = useLanguage();

  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');

  const [eventoParaEditar, setEventoParaEditar] = useState<any>({
    id: '',
    nome: '',
    data: '',
    horario: '',
    local: '',
    preco: '',
    imagem: '',
    descricao: '',
    status: 'Ativo',
    taxa_plataforma: 0.05,
  });

  const carregarDados = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/vitrine?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Falha ao carregar eventos');
      }

      const data = await res.json();

      const formatados = Array.isArray(data)
        ? data
            .filter((ev: any) => !isEventoExcluido(ev))
            .map((ev: any) => ({
              ...ev,
              imagem: ev.imagem_capa || ev.imagem || '',
              local: ev.local_nome || ev.local || '',
              horario: ev.hora_inicio || ev.horario || '',
              data: ev.data_inicio
                ? String(ev.data_inicio).split('T')[0]
                : ev.data
                ? String(ev.data).split('T')[0]
                : '',
              taxa_plataforma:
                ev.taxa_plataforma !== undefined && ev.taxa_plataforma !== null
                  ? Number(ev.taxa_plataforma)
                  : 0.05,
              preco:
                ev.preco_minimo !== undefined && ev.preco_minimo !== null
                  ? Number(ev.preco_minimo)
                  : ev.preco !== undefined && ev.preco !== null
                  ? Number(ev.preco)
                  : 0,
            }))
        : [];

      setEventos(formatados);
    } catch (err) {
      console.error('❌ Erro ao conectar com o Render:', err);
      Swal.fire('Erro', 'Não foi possível carregar os eventos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirEdicao = (evento: any) => {
    setEventoParaEditar({
      id: evento.id || '',
      nome: evento.nome || '',
      data: evento.data || '',
      horario: evento.horario || '',
      local: evento.local || '',
      preco:
        evento.preco !== undefined && evento.preco !== null
          ? Number(evento.preco)
          : '',
      imagem: evento.imagem || '',
      descricao: evento.descricao || '',
      status: evento.status || 'Ativo',
      taxa_plataforma:
        evento.taxa_plataforma !== undefined && evento.taxa_plataforma !== null
          ? Number(evento.taxa_plataforma)
          : 0.05,
    });

    setIsModalOpen(true);
  };

  const salvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing('salvando');

    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';

      if (!token) {
        Swal.fire('Erro', 'Token não encontrado. Faça login novamente.', 'error');
        return;
      }

      const precoNumero =
        eventoParaEditar.preco === '' ||
        eventoParaEditar.preco === null ||
        eventoParaEditar.preco === undefined
          ? 0
          : Number(eventoParaEditar.preco);

      const taxaNumero =
        eventoParaEditar.taxa_plataforma === '' ||
        eventoParaEditar.taxa_plataforma === null ||
        eventoParaEditar.taxa_plataforma === undefined
          ? 0.05
          : Number(eventoParaEditar.taxa_plataforma);

      if (Number.isNaN(precoNumero)) {
        Swal.fire('Erro', 'Preço inválido.', 'error');
        return;
      }

      if (Number.isNaN(taxaNumero)) {
        Swal.fire('Erro', 'Taxa inválida.', 'error');
        return;
      }

      const payloadEvento = {
        nome: eventoParaEditar.nome,
        data_inicio: eventoParaEditar.data || null,
        hora_inicio: eventoParaEditar.horario || null,
        local_nome: eventoParaEditar.local || '',
        descricao: eventoParaEditar.descricao || '',
        status: eventoParaEditar.status || 'Ativo',
        imagem_capa: eventoParaEditar.imagem || '',
        taxa_plataforma: taxaNumero,
      };

      console.log('📤 PUT evento:', payloadEvento);
      console.log('💰 POST ingressos preço:', precoNumero);

      const resEvento = await fetch(`${API_URL}/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payloadEvento),
      });

      const dataEvento = await resEvento.json().catch(() => null);

      console.log('✅ resposta PUT:', dataEvento);

      if (!resEvento.ok) {
        throw new Error(dataEvento?.error || 'Falha ao atualizar evento');
      }

      const resIngressos = await fetch(`${API_URL}/${eventoParaEditar.id}/ingressos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingressos: [
            {
              nome: 'Ingresso Geral',
              preco: precoNumero,
              quantidade: 9999,
            },
          ],
        }),
      });

      const dataIngressos = await resIngressos.json().catch(() => null);

      console.log('✅ resposta POST ingressos:', dataIngressos);

      if (!resIngressos.ok) {
        throw new Error(dataIngressos?.error || 'Falha ao salvar ingressos');
      }

      setIsModalOpen(false);

      await Swal.fire({
        icon: 'success',
        title: 'Salvo com sucesso!',
        text: 'Evento e ingresso atualizados.',
        showConfirmButton: false,
        timer: 1500,
      });

      await carregarDados();
    } catch (err: any) {
      console.error('❌ Erro ao salvar edição:', err);
      Swal.fire('Erro', err.message || 'Erro ao salvar.', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleExcluir = async (evento: any) => {
    const result = await Swal.fire({
      title: 'Remover da Vitrine?',
      text: `O evento "${evento.nome}" será ocultado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7C3AED',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'rounded-[2rem]' },
    });

    if (!result.isConfirmed) return;

    setIsProcessing(evento.id);

    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';

      const res = await fetch(`${API_URL}/${evento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: 'Excluído',
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao remover evento');
      }

      setEventos((prev) => prev.filter((ev) => String(ev.id) !== String(evento.id)));

      Swal.fire({
        title: 'Removido!',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('❌ Erro na exclusão:', err);
      Swal.fire('Erro', 'Não foi possível remover o evento.', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const eventosFiltrados = eventos.filter((ev) => {
    if (isEventoExcluido(ev)) return false;

    return String(ev.nome || '')
      .toLowerCase()
      .includes(filtroBusca.toLowerCase());
  });

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
              {t.eventsTitle || 'Eventos'}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-3">
              Console da vitrine de eventos
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
                placeholder="Buscar eventos..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-violet-500/5 focus:border-violet-300 font-medium shadow-sm w-full md:w-72 transition-all text-sm text-slate-900"
              />
            </div>

            <button
              onClick={carregarDados}
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
                Gerencie a vitrine da plataforma
              </h2>
              <p className="text-slate-500 mt-3 max-w-2xl">
                Edite informações, ajuste taxa da plataforma e remova eventos da vitrine
                com uma interface mais clean e organizada.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                Status
              </p>
              <p className="text-sm font-semibold text-violet-600 mt-1">
                Render Host Ativo
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] uppercase font-bold tracking-[0.18em] border-b border-slate-100">
                  <th className="px-8 py-5">Evento</th>
                  <th className="px-8 py-5 text-center">Data e Hora</th>
                  <th className="px-8 py-5 text-center">Taxa Linkah</th>
                  <th className="px-8 py-5 text-center">Preço</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <Loader2 className="animate-spin mx-auto text-slate-300" size={34} />
                    </td>
                  </tr>
                ) : eventosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-16 text-center text-slate-400 font-medium"
                    >
                      Nenhum evento encontrado.
                    </td>
                  </tr>
                ) : (
                  eventosFiltrados.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 shrink-0">
                            {ev.imagem ? (
                              <img
                                src={ev.imagem}
                                className="w-full h-full rounded-xl object-cover border border-slate-200 shadow-sm"
                                alt={ev.nome}
                              />
                            ) : (
                              <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200">
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 leading-none mb-1">
                              {ev.nome}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                              <MapPin size={11} className="text-violet-500" />
                              {ev.local || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-[11px] font-semibold">
                            {ev.data || '--'}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {ev.horario || '--:--'}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-slate-900 font-semibold text-sm">
                            {(Number(ev.taxa_plataforma || 0.05) * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.12em]">
                            Fee ativa
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-center">
                        <span className="text-slate-900 font-semibold text-sm">
                          R$ {Number(ev.preco || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => abrirEdicao(ev)}
                            className="w-11 h-11 flex items-center justify-center bg-white hover:bg-violet-50 hover:text-violet-600 border border-slate-200 rounded-xl text-slate-500 transition-all shadow-sm"
                            title="Editar"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            onClick={() => handleExcluir(ev)}
                            className="w-11 h-11 flex items-center justify-center bg-white hover:bg-red-50 hover:text-red-500 border border-slate-200 rounded-xl text-slate-500 transition-all shadow-sm"
                            disabled={isProcessing === ev.id}
                            title="Excluir"
                          >
                            {isProcessing === ev.id ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 lg:p-10 shadow-2xl overflow-y-auto max-h-[90vh] relative border border-slate-200 animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-700 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.22em] text-violet-500 font-bold mb-2">
                  Edit Mode
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Editar Evento
                </h2>
              </div>

              <form onSubmit={salvarEdicao} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Título do Evento
                  </label>
                  <input
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 outline-none focus:bg-white focus:border-violet-300 transition-all"
                    value={eventoParaEditar.nome}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> Data
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:bg-white focus:border-violet-300 text-slate-800"
                    value={eventoParaEditar.data}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, data: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> Horário
                  </label>
                  <input
                    type="time"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:bg-white focus:border-violet-300 text-slate-800"
                    value={eventoParaEditar.horario}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, horario: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Localização
                  </label>
                  <input
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:bg-white focus:border-violet-300 text-slate-800"
                    value={eventoParaEditar.local}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, local: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Descrição
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:bg-white focus:border-violet-300 text-slate-800 resize-none"
                    value={eventoParaEditar.descricao}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, descricao: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-500 flex items-center gap-1">
                    <DollarSign size={12} /> Preço Base
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-4 bg-violet-50/40 border border-violet-100 rounded-2xl font-semibold text-violet-700 outline-none focus:bg-white focus:border-violet-300"
                    value={eventoParaEditar.preco}
                    onChange={(e) =>
                      setEventoParaEditar({
                        ...eventoParaEditar,
                        preco: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="col-span-2 space-y-4 p-6 bg-slate-50 rounded-[1.8rem] border border-slate-200">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-500 flex items-center gap-2">
                        <Activity size={14} /> Taxa da Plataforma
                      </label>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Lucro da plataforma por venda
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-semibold text-slate-900">
                        {(Number(eventoParaEditar.taxa_plataforma || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="0.30"
                    step="0.005"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    value={eventoParaEditar.taxa_plataforma}
                    onChange={(e) =>
                      setEventoParaEditar({
                        ...eventoParaEditar,
                        taxa_plataforma: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Status
                  </label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:bg-white focus:border-violet-300 text-slate-800"
                    value={eventoParaEditar.status}
                    onChange={(e) =>
                      setEventoParaEditar({ ...eventoParaEditar, status: e.target.value })
                    }
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Excluído">Excluído</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing === 'salvando'}
                  className="col-span-2 bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-violet-200 active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessing === 'salvando' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Salvar Alterações
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}