// 🔥 MESMA LÓGICA, SÓ VISUAL ALTERADO

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

  // ================= LOAD =================
  const carregarDados = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/vitrine?t=${Date.now()}`, {
        cache: 'no-store',
      });

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
                : '',
              taxa_plataforma: Number(ev.taxa_plataforma || 0.05),
              preco: Number(ev.preco_minimo || 0),
            }))
        : [];

      setEventos(formatados);
    } catch {
      Swal.fire('Erro', 'Falha ao carregar eventos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // ================= UI =================
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-violet-500 font-semibold mb-2">
              Admin
            </p>

            <h1 className="text-2xl md:text-3xl font-semibold">
              {t.eventsTitle || 'Eventos'}
            </h1>

            <p className="text-sm text-slate-400 mt-2">
              Gerenciamento da vitrine de eventos
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar..."
                className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-violet-400 outline-none"
              />
            </div>

            <button
              onClick={carregarDados}
              className="w-11 h-11 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50"
            >
              <RefreshCcw size={16} className="text-violet-600" />
            </button>
          </div>
        </header>

        {/* TABLE */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Evento</th>
                <th className="text-center">Data</th>
                <th className="text-center">Taxa</th>
                <th className="text-center">Preço</th>
                <th className="text-right pr-6">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="animate-spin mx-auto text-slate-300" />
                  </td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Nenhum evento encontrado
                  </td>
                </tr>
              ) : (
                eventos.map((ev) => (
                  <tr key={ev.id} className="border-t hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {ev.imagem ? (
                          <img src={ev.imagem} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ImageIcon size={16} />
                          </div>
                        )}

                        <div>
                          <p className="font-medium">{ev.nome}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin size={10} /> {ev.local}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">{ev.data}</td>

                    <td className="text-center text-violet-600 font-medium">
                      {(ev.taxa_plataforma * 100).toFixed(1)}%
                    </td>

                    <td className="text-center font-medium">
                      R$ {ev.preco.toFixed(2)}
                    </td>

                    <td className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-slate-100">
                          <Edit3 size={14} />
                        </button>

                        <button className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-red-50 text-red-500">
                          <Trash2 size={14} />
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
    </div> );
}
     