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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Background Decorativo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-100/40 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="group w-10 h-10 rounded-xl border border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50 text-slate-500 hover:text-violet-600 transition-all flex items-center justify-center shadow-sm"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                  Checkout Setup
                </p>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
                {t.setupTickets || 'Configurar Ingressos'}
              </h1>
            </div>
          </div>

          <button
            onClick={handleFinalizar}
            disabled={loading || loadingEvento}
            className="group relative inline-flex items-center gap-2.5 rounded-xl bg-slate-900 hover:bg-violet-600 text-white px-6 py-3 font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                <span className="text-sm">{t.btnPublish || 'Publicar Evento'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-100">
                    <Ticket size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Gestão de Lotes
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Etapa 2 de 2</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                    <div className="w-8 h-8 rounded-lg bg-white text-emerald-500 flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">Evento Criado</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-50 border border-violet-100">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold">02</span>
                    </div>
                    <span className="text-sm font-semibold text-violet-700">Configurar Ingressos</span>
                  </div>
                </div>
              </div>

              {loadingEvento ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <Loader2 className="animate-spin mx-auto text-violet-500" size={24} />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">Carregando...</p>
                </div>
              ) : evento && (
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Resumo do Evento</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{evento.nome}</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        <CalendarDays size={12} />
                        {formatDate(evento.data_inicio)}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        <Tag size={12} />
                        {evento.categoria}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <Info size={18} className="text-violet-400" />
                  <h4 className="text-sm font-bold">Dica Pro</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Crie diferentes lotes (ex: Lote 1, Lote 2) para incentivar a compra antecipada. Você pode ajustar a quantidade de cada um.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-8 space-y-8">
            {ingressos.map((ing, index) => (
              <div
                key={index}
                className="group relative rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-10 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-violet-200 transition-all duration-300"
              >
                {/* Badge de Número */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center font-black text-sm shadow-md z-10">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Header do Card */}
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      Categoria de Ingresso
                    </h3>
                    <div className="h-1 w-12 bg-violet-500 rounded-full mt-1" />
                  </div>
                  
                  {ingressos.length > 1 && (
                    <button
                      onClick={() => removeIngresso(index)}
                      className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title="Remover Categoria"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Nome e Descrição */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                        <Ticket size={12} className="text-violet-500" />
                        Nome do Lote
                      </label>
                      <input
                        value={ing.nome}
                        onBlur={(e) => validateField(index, 'nome', e.target.value)}
                        onChange={(e) => handleChange(index, 'nome', e.target.value)}
                        className={`w-full rounded-2xl border-2 ${
                          errors[`${index}-nome`] ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-slate-50/50'
                        } px-6 py-4 outline-none focus:bg-white focus:border-violet-400 text-slate-900 font-bold transition-all placeholder:text-slate-300`}
                        placeholder="Ex: VIP Experience"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                        <FileText size={12} className="text-violet-500" />
                        Descrição (Opcional)
                      </label>
                      <input
                        value={ing.descricao || ''}
                        onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-4 outline-none focus:bg-white focus:border-violet-400 text-slate-900 font-semibold transition-all placeholder:text-slate-300"
                        placeholder="O que está incluso?"
                      />
                    </div>
                  </div>

                  {/* Preço e Quantidade - DESTAQUE */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                    
                    {/* Campo de Preço - Aumentado */}
                    <div className="md:col-span-8 space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                        <Coins size={12} className="text-violet-500" />
                        Valor do Ingresso
                      </label>
                      
                      <div className="flex gap-3">
                        <div className="relative shrink-0">
                          <select
                            value={ing.moeda}
                            onChange={(e) => handleChange(index, 'moeda', e.target.value)}
                            className="appearance-none h-[72px] rounded-2xl border-2 border-slate-100 bg-slate-50/50 pl-6 pr-10 font-black text-slate-900 outline-none focus:border-violet-400 transition-all cursor-pointer"
                          >
                            <option value="BRL">BRL</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <ChevronLeft size={14} className="-rotate-90" />
                          </div>
                        </div>

                        <div className="relative flex-1 group/input">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                            <span className="text-2xl font-black text-slate-300 group-focus-within/input:text-violet-500 transition-colors">
                              {currencyMap[ing.moeda] || '$'}
                            </span>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={ing.preco}
                            onBlur={(e) => validateField(index, 'preco', e.target.value)}
                            onChange={(e) => {
                              const value = e.target.value.replace(',', '.');
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleChange(index, 'preco', value);
                              }
                            }}
                            className={`block w-full h-[72px] rounded-2xl border-2 ${
                              errors[`${index}-preco`] ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-slate-50/50'
                            } pl-16 pr-8 outline-none focus:bg-white focus:border-violet-400 text-3xl font-black text-slate-900 transition-all placeholder:text-slate-200`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Campo de Quantidade */}
                    <div className="md:col-span-4 space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                        <Layers size={12} className="text-violet-500" />
                        Qtd. Disponível
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={ing.quantidade}
                          onBlur={(e) => validateField(index, 'quantidade', e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            handleChange(index, 'quantidade', value);
                          }}
                          className={`w-full h-[72px] rounded-2xl border-2 ${
                            errors[`${index}-quantidade`] ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-slate-50/50'
                          } px-6 outline-none focus:bg-white focus:border-violet-400 text-2xl font-black text-center text-slate-900 transition-all placeholder:text-slate-200`}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Botão Adicionar */}
            <button
              onClick={addIngresso}
              className="group w-full rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white py-10 text-slate-400 hover:border-violet-300 hover:bg-violet-50/30 hover:text-violet-600 transition-all flex flex-col items-center justify-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:scale-110 group-hover:rotate-90 text-slate-400 group-hover:text-violet-600 flex items-center justify-center transition-all shadow-sm">
                <Plus size={28} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">
                {t.btnAddCategory || 'Adicionar Nova Categoria'}
              </span>
            </button>
          </section>
        </div>
      </main>

      <footer className="py-12 mt-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">
            Linkah Cloud Nodes © 2026
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Privacidade</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Termos</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
