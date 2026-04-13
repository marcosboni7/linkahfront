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
        console.log('❌ ID PARAM ausente:', params);
        setLoadingEvento(false);
        return;
      }

      try {
        console.log('🆔 ID PARAM:', id);

        const res = await fetch(`${API_URL}/api/eventos/${id}`, {
          cache: 'no-store',
        });

        const data = await res.json().catch(() => null);

        console.log('🔥 EVENTO RAW:', data);

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

  const handleChange = (index: number, field: string, value: string) => {
    const novos = [...ingressos];
    novos[index] = { ...novos[index], [field]: value };
    setIngressos(novos);

    if (value && errors[`${index}-${field}`]) {
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
        confirmButtonColor: '#C22973',
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

      console.log('📤 PAYLOAD INGRESSOS:', payload);

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
          title: `<span style="color: #C22973; font-family: sans-serif; font-weight: 900; font-style: italic; text-transform: uppercase;">🚀 EVENTO ONLINE</span>`,
          text:
            t.publishSuccessText ||
            'Seu evento foi configurado e as vendas podem começar.',
          icon: 'success',
          confirmButtonColor: '#000',
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
    <div className="min-h-screen bg-[#FCFBFA] font-sans antialiased pb-24">
      <header className="border-b border-slate-100 px-6 md:px-12 py-6 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-black transition-all active:scale-90 border border-transparent hover:border-slate-100"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-black font-black text-xl tracking-tighter uppercase italic leading-none">
              {t.setupTickets || 'Configurar Ingressos'}
            </h1>
            <p className="text-[#C22973] text-[9px] font-black uppercase tracking-[0.3em] mt-1 italic animate-pulse">
              {t.finalStep || 'Provisionamento Final'}
            </p>
          </div>
        </div>

        <button
          onClick={handleFinalizar}
          disabled={loading || loadingEvento}
          className="bg-black text-white px-8 md:px-12 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center gap-3 active:scale-95 group"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              {t.btnPublish || 'Publicar Evento'}
              <CheckCircle2
                size={16}
                className="text-[#C22973] group-hover:text-white transition-colors"
              />
            </>
          )}
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <div className="flex justify-center items-center mb-20">
          <div className="flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 transition-transform group-hover:scale-110">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
              {t.stepInfo || 'Informações'}
            </span>
          </div>

          <div className="w-24 h-[2px] bg-slate-100 mx-6 rounded-full" />

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-black text-white flex items-center justify-center shadow-2xl shadow-pink-200 font-black text-sm italic border-4 border-white">
              2
            </div>
            <span className="text-[9px] font-black text-black uppercase tracking-widest italic">
              {t.stepTickets || 'Ingressos'}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {loadingEvento ? (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <Loader2 className="animate-spin mx-auto text-slate-400" size={28} />
              <p className="text-slate-400 font-bold mt-4">
                Carregando informações do evento...
              </p>
            </div>
          ) : evento ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C22973] italic mb-3">
                    Evento carregado
                  </p>

                  <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">
                    {evento.nome || 'Evento sem nome'}
                  </h2>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600">
                      <Tag size={14} />
                      {evento.categoria || 'Sem categoria'}
                    </span>

                    <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600">
                      <Coins size={14} />
                      Moeda: {evento.moeda || 'BRL'}
                    </span>

                    <span className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-bold text-slate-600">
                      <CalendarDays size={14} />
                      {formatDate(evento.data_inicio)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] px-5 py-4 min-w-[220px]">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 mb-2">
                    ID do evento
                  </p>
                  <p className="text-sm font-black text-slate-800 break-all">{id}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-sm">
              <p className="text-red-500 font-black uppercase text-xs tracking-[0.2em] italic mb-2">
                Evento não carregado
              </p>
              <p className="text-slate-500 text-sm font-medium">
                Não foi possível encontrar as informações do evento para este ID.
              </p>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-5 items-start">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
              <Info size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 italic">
                Gestão de Inventário
              </h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                {t.ticketAlert ||
                  'Defina os preços e quantidades. Estes valores alimentam o Checkout da Linkah em tempo real.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {ingressos.map((ing, index) => (
              <div
                key={index}
                className="bg-white rounded-[3rem] p-10 border border-slate-100 hover:border-[#C22973]/20 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col gap-8 relative group animate-in slide-in-from-bottom-8"
              >
                <div className="absolute -left-3 top-10 w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-300 italic uppercase">
                  #{index + 1}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2 ml-2">
                      <Ticket size={14} className="text-slate-300" />
                      <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                        {t.labelTicketName || 'Nome do Lote'}
                      </label>
                    </div>

                    <input
                      value={ing.nome}
                      onBlur={(e) => validateField(index, 'nome', e.target.value)}
                      onChange={(e) => handleChange(index, 'nome', e.target.value)}
                      className={`w-full bg-slate-50/50 border ${
                        errors[`${index}-nome`] ? 'border-red-400' : 'border-slate-100'
                      } px-6 py-5 rounded-[1.5rem] outline-none focus:bg-white focus:border-black font-bold text-black transition-all placeholder:text-slate-200`}
                      placeholder={t.placeholderTicket || 'Ex: VIP Experience'}
                    />
                  </div>

                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center gap-2 ml-2">
                      <FileText size={14} className="text-slate-300" />
                      <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                        Descrição do ingresso
                      </label>
                    </div>

                    <textarea
                      value={ing.descricao || ''}
                      onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50/50 border border-slate-100 px-6 py-4 rounded-[1.5rem] outline-none focus:bg-white focus:border-black font-medium text-black transition-all resize-none"
                      placeholder="Ex: acesso VIP, open bar, área exclusiva, brindes..."
                    />
                  </div>

                  <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center gap-2 ml-2">
                      <Coins size={14} className="text-slate-300" />
                      <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                        Preço de Venda
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <select
                        value={ing.moeda}
                        onChange={(e) => handleChange(index, 'moeda', e.target.value)}
                        className="bg-white border border-slate-100 px-4 py-5 rounded-[1.5rem] font-black text-[10px] text-black outline-none focus:border-black shadow-sm cursor-pointer hover:bg-slate-50 transition-all"
                      >
                        <option value="BRL">BRL</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>

                      <div className="relative flex-1 group/input">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs transition-colors group-focus-within/input:text-black">
                          {currencyMap[ing.moeda]}
                        </span>

                        <input
                          type="number"
                          value={ing.preco}
                          onBlur={(e) => validateField(index, 'preco', e.target.value)}
                          onChange={(e) => handleChange(index, 'preco', e.target.value)}
                          className={`w-full pl-14 pr-6 py-5 bg-slate-50/50 border ${
                            errors[`${index}-preco`] ? 'border-red-400' : 'border-slate-100'
                          } rounded-[1.5rem] outline-none focus:bg-white focus:border-black font-black text-black transition-all`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                  <div className="w-full lg:w-44 space-y-3">
                    <div className="flex items-center gap-2 ml-2">
                      <Layers size={14} className="text-slate-300" />
                      <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                        Capacidade
                      </label>
                    </div>

                    <input
                      type="number"
                      value={ing.quantidade}
                      onBlur={(e) => validateField(index, 'quantidade', e.target.value)}
                      onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                      className={`w-full bg-slate-50/50 border ${
                        errors[`${index}-quantidade`] ? 'border-red-400' : 'border-slate-100'
                      } px-6 py-5 rounded-[1.5rem] outline-none focus:bg-white focus:border-black font-bold text-black text-center transition-all`}
                      placeholder="100"
                    />
                  </div>

                  {ingressos.length > 1 && (
                    <button
                      onClick={() => removeIngresso(index)}
                      className="p-5 text-slate-300 hover:text-[#C22973] hover:bg-red-50 rounded-[1.5rem] transition-all active:scale-90 border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={22} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addIngresso}
              className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-300 font-black uppercase text-[10px] tracking-[0.4em] hover:border-black hover:text-black hover:bg-slate-50 transition-all bg-white flex items-center justify-center gap-4 group italic"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              {t.btnAddCategory || 'Gerar Nova Categoria de Ingresso'}
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 text-center border-t border-slate-50">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">
          Linkah Cloud Nodes &copy; 2026
        </p>
      </footer>
    </div>
  );
}