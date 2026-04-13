'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Info,
  Ticket,
  Coins,
  Layers,
  CalendarDays,
  Tag,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';

const currencyMap: Record<string, string> = {
  BRL: 'R$',
  EUR: '€',
  USD: '$',
};

function formatDate(dateValue: any) {
  if (!dateValue) return 'Data não definida';

  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return String(dateValue);
  }
}

function parsePrecoInput(value: any) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isNaN(n) ? '' : String(n);
}

export default function CadastroIngressos() {
  const { t }: any = useLanguage();
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [loading, setLoading] = useState(false);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evento, setEvento] = useState<any>(null);

  const [ingressos, setIngressos] = useState([
    {
      nome: '',
      descricao: '',
      preco: '',
      quantidade: '',
      tipo: 'Pago',
      moeda: 'BRL',
    },
  ]);

  useEffect(() => {
    const fetchEvento = async () => {
      if (!id) {
        setLoadingEvento(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/eventos/${id}`, {
          cache: 'no-store',
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            data?.message || data?.error || 'Não foi possível carregar o evento'
          );
        }

        const eventoData = data;
        setEvento(eventoData);

        const moedaEvento = eventoData?.moeda || 'BRL';

        if (Array.isArray(eventoData?.ingressos) && eventoData.ingressos.length > 0) {
          setIngressos(
            eventoData.ingressos.map((ing: any) => ({
              nome: ing.nome || '',
              descricao: ing.descricao || '',
              preco: parsePrecoInput(ing.preco),
              quantidade:
                ing.quantidade === null || ing.quantidade === undefined
                  ? ''
                  : String(ing.quantidade),
              tipo: 'Pago',
              moeda: ing.moeda || moedaEvento,
            }))
          );
        } else {
          setIngressos((prev) =>
            prev.map((ing) => ({
              ...ing,
              moeda: moedaEvento,
            }))
          );
        }
      } catch (err: any) {
        console.error('❌ Erro ao buscar evento:', err);
        Swal.fire(
          'Erro',
          err?.message || 'Não foi possível carregar as informações do evento.',
          'error'
        );
      } finally {
        setLoadingEvento(false);
      }
    };

    fetchEvento();
  }, [id, params]);

  const addIngresso = () => {
    setIngressos([
      ...ingressos,
      {
        nome: '',
        descricao: '',
        preco: '',
        quantidade: '',
        tipo: 'Pago',
        moeda: evento?.moeda || ingressos[0]?.moeda || 'BRL',
      },
    ]);
  };

  const removeIngresso = (index: number) => {
    if (ingressos.length > 1) {
      setIngressos(ingressos.filter((_, i) => i !== index));
    }
  };

  const handleChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const novos = [...ingressos];
    novos[index] = { ...novos[index], [field]: String(value) };
    setIngressos(novos);

    if (String(value) && errors[`${index}-${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-${field}`];
        return newErrors;
      });
    }
  };

  const validateField = (index: number, field: string, value: string) => {
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [`${index}-${field}`]: t.fieldRequired || 'Obrigatório',
      }));
    }
  };

  const handleFinalizar = async () => {
    const hasEmpty = ingressos.some(
      (ing) =>
        !String(ing.nome).trim() ||
        !String(ing.preco).trim() ||
        !String(ing.quantidade).trim()
    );

    if (hasEmpty) {
      Swal.fire({
        title: `<span style="font-family: sans-serif; font-weight: 900; font-style: italic; text-transform: uppercase;">${
          t.errorIncomplete || 'DADOS PENDENTES'
        }</span>`,
        text:
          t.errorIncompleteText ||
          'Certifique-se de que todos os lotes possuem nome, preço e quantidade.',
        icon: 'warning',
        confirmButtonColor: '#7C3AED',
        customClass: { popup: 'rounded-[2.5rem]' },
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('@Linkah:Token')?.replace(/['"]+/g, '');

      const payload = {
        ingressos: ingressos.map((ing) => ({
          ...ing,
          descricao: ing.descricao || '',
          preco: Number(ing.preco),
          quantidade: Number(ing.quantidade),
          moeda: evento?.moeda || ing.moeda || 'BRL',
        })),
        moeda_global: evento?.moeda || ingressos[0].moeda,
      };

      const response = await fetch(`${API_URL}/api/eventos/${id}/ingressos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire({
          title: `<span style="color: #7C3AED; font-family: sans-serif; font-weight: 900; font-style: italic; text-transform: uppercase;">✨ EVENTO PUBLICADO</span>`,
          text:
            t.publishSuccessText ||
            'Seu evento foi configurado e as vendas podem começar.',
          icon: 'success',
          confirmButtonColor: '#7C3AED',
          confirmButtonText: t.btnViewEvents || 'Ir para o Dashboard',
          customClass: { popup: 'rounded-[3rem]' },
        }).then((result) => {
          if (result.isConfirmed) router.push('/dashboard/eventos');
        });
      } else {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.message || errData?.error || 'Falha ao salvar ingressos'
        );
      }
    } catch (error: any) {
      Swal.fire(
        'Erro de Sincronização',
        error.message || 'Falha na conexão com AWS Linkah-Node',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.08),transparent_35%)]" />

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-11 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>

            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-violet-500 mb-1">
                Checkout Setup
              </p>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                {t.setupTickets || 'Configurar Ingressos'}
              </h1>
            </div>
          </div>

          <button
            onClick={handleFinalizar}
            disabled={loading || loadingEvento}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white px-5 md:px-7 py-3.5 font-semibold shadow-lg shadow-violet-200 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Sparkles size={16} />
                {t.btnPublish || 'Publicar Evento'}
              </>
            )}
          </button>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <aside className="xl:col-span-4 space-y-6">
            <div className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-violet-500 font-bold">
                    Etapa Final
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Ingressos & Pricing
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {t.stepEvent || 'Evento'}
                  </p>
                  <p className="text-slate-400 text-xs">Concluído</p>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 ml-4 my-2" />

              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {t.stepTickets || 'Ingressos'}
                  </p>
                  <p className="text-violet-500 text-xs font-medium">Em edição</p>
                </div>
              </div>
            </div>

            {loadingEvento ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
                <Loader2 className="animate-spin mx-auto text-violet-500" size={28} />
                <p className="text-slate-500 font-medium mt-4">
                  Carregando informações do evento...
                </p>
              </div>
            ) : evento ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-500 mb-2">
                    Evento
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {evento.nome || 'Evento sem nome'}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                    <Tag size={13} />
                    {evento.categoria || 'Sem categoria'}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                    <Coins size={13} />
                    {evento.moeda || 'BRL'}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                    <CalendarDays size={13} />
                    {formatDate(evento.data_inicio)}
                  </span>
                </div>

                <div className="rounded-2xl bg-violet-50 border border-violet-100 px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-violet-500 font-bold mb-1">
                    Identificador
                  </p>
                  <p className="text-sm font-medium text-slate-800 break-all">{id}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
                <p className="text-red-500 font-semibold mb-1">Evento não carregado</p>
                <p className="text-slate-500 text-sm">
                  Não foi possível encontrar as informações do evento para este ID.
                </p>
              </div>
            )}

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center border border-violet-100">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">
                    Gestão de Inventário
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {t.ticketAlert ||
                      'Defina os preços e quantidades. Estes valores alimentam o checkout da plataforma em tempo real.'}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="xl:col-span-8 space-y-6">
            {ingressos.map((ing, index) => (
              <div
                key={index}
                className="relative rounded-[2rem] border border-slate-200 bg-white p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all"
              >
                <div className="absolute top-5 right-5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-50 text-violet-600 text-sm font-semibold border border-violet-100">
                    {index + 1}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Categoria de ingresso
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Configure nome, descrição, preço e capacidade.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-5 space-y-2">
                    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                      <Ticket size={14} />
                      {t.labelTicketName || 'Nome do Lote'}
                    </label>

                    <input
                      value={ing.nome}
                      onBlur={(e) => validateField(index, 'nome', e.target.value)}
                      onChange={(e) => handleChange(index, 'nome', e.target.value)}
                      className={`w-full rounded-2xl border ${
                        errors[`${index}-nome`] ? 'border-red-400' : 'border-slate-200'
                      } bg-slate-50/70 px-5 py-4 outline-none focus:bg-white focus:border-violet-400 text-slate-900 font-medium transition-all`}
                      placeholder={t.placeholderTicket || 'Ex: VIP Experience'}
                    />
                  </div>

                  <div className="lg:col-span-4 space-y-2">
                    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                      <FileText size={14} />
                      Descrição
                    </label>

                    <textarea
                      value={ing.descricao || ''}
                      onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 outline-none focus:bg-white focus:border-violet-400 text-slate-900 font-medium transition-all resize-none"
                      placeholder="Ex: acesso VIP, open bar, área exclusiva, brindes..."
                    />
                  </div>

                  <div className="lg:col-span-3 space-y-2">
                    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                      <Coins size={14} />
                      Preço de Venda
                    </label>

                    <div className="flex gap-2">
                      <select
                        value={ing.moeda}
                        onChange={(e) => handleChange(index, 'moeda', e.target.value)}
                        className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 font-semibold text-slate-900 outline-none focus:border-violet-400"
                      >
                        <option value="BRL">BRL</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>

                      <div className="relative flex-1 min-w-0">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm z-10">
                          {currencyMap[ing.moeda] || '$'}
                        </span>

                        <input
                          type="text"
                          inputMode="decimal"
                          value={ing.preco}
                          onBlur={(e) => validateField(index, 'preco', e.target.value)}
                          onChange={(e) => {
                            // Permite apenas números e um único ponto ou vírgula
                            const value = e.target.value.replace(',', '.');
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              handleChange(index, 'preco', value);
                            }
                          }}
                          className={`block w-full min-w-0 rounded-2xl border ${
                            errors[`${index}-preco`] ? 'border-red-400' : 'border-slate-200'
                          } bg-slate-50/70 pl-11 pr-4 py-4 outline-none focus:bg-white focus:border-violet-400 text-slate-900 font-semibold transition-all`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="w-full sm:w-52 space-y-2">
                    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400">
                      <Layers size={14} />
                      Capacidade
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={ing.quantidade}
                      onBlur={(e) => validateField(index, 'quantidade', e.target.value)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleChange(index, 'quantidade', value);
                      }}
                      className={`w-full rounded-2xl border ${
                        errors[`${index}-quantidade`] ? 'border-red-400' : 'border-slate-200'
                      } bg-slate-50/70 px-5 py-4 outline-none focus:bg-white focus:border-violet-400 text-slate-900 font-semibold text-center transition-all`}
                      placeholder="100"
                    />
                  </div>

                  {ingressos.length > 1 && (
                    <button
                      onClick={() => removeIngresso(index)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-red-500 hover:bg-red-100 transition-all font-medium"
                    >
                      <Trash2 size={18} />
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addIngresso}
              className="w-full rounded-[2rem] border-2 border-dashed border-violet-200 bg-violet-50/40 py-8 text-violet-600 hover:bg-violet-50 hover:border-violet-300 transition-all flex items-center justify-center gap-3 font-semibold"
            >
              <Plus size={18} />
              {t.btnAddCategory || 'Gerar Nova Categoria de Ingresso'}
            </button>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-10 mt-10">
        <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
          <p className="text-[11px] font-medium text-slate-400 tracking-[0.2em] uppercase">
            Linkah Cloud Nodes © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
