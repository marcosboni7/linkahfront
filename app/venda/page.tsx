'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  ShieldCheck,
  Lock,
  Loader2,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

// Função segura para normalizar moeda
function normalizeCurrency(input?: any) {
  if (input === null || input === undefined) return 'BRL';

  const raw =
    typeof input === 'string'
      ? input.trim().toUpperCase()
      : String(input).trim().toUpperCase();

  if (['R$', 'REAL', 'REAIS', 'BRL'].includes(raw)) return 'BRL';
  if (['€', 'EURO', 'EUROS', 'EUR'].includes(raw)) return 'EUR';
  if (['$', 'DOLAR', 'DÓLAR', 'DOLARES', 'DÓLARES', 'USD'].includes(raw)) return 'USD';

  return 'BRL';
}

// Função segura para número
function safeNumber(value: any, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

// Função segura para texto de erro
function getErrorMessage(err: any) {
  if (!err) return 'Erro desconhecido';
  if (typeof err === 'string') return err;
  if (typeof err?.message === 'string' && err.message.trim()) return err.message;
  if (typeof err?.toString === 'function') {
    const asString = err.toString();
    if (typeof asString === 'string' && asString.trim() && asString !== '[object Object]') {
      return asString;
    }
  }
  return 'Erro desconhecido';
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('eventoId');
  const payloadRaw = searchParams.get('payload');
  
  // --- ADICIONADO: Captura de Afiliados da URL ---
  const afiliadoId = searchParams.get('afiliado_id');
  const comissaoPercentual = searchParams.get('pct');

  const [loading, setLoading] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  const [formData, setFormData] = useState({ nome: '', email: '' });
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  const { language }: any = useLanguage();

  // Decodifica o payload de ingressos vindo da página anterior
  useEffect(() => {
    if (!payloadRaw) return;

    try {
      const decoded = JSON.parse(decodeURIComponent(payloadRaw));

      if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) {
        const quantidadesTratadas: { [key: string]: number } = {};

        Object.entries(decoded).forEach(([key, value]) => {
          quantidadesTratadas[String(key)] = safeNumber(value, 0);
        });

        setQuantidades(quantidadesTratadas);
      } else {
        setQuantidades({});
      }
    } catch (err) {
      console.error('Erro ao decodificar payload:', err);
      setQuantidades({});
    }
  }, [payloadRaw]);

  // Carrega os dados do evento e trata a moeda/ingressos
  useEffect(() => {
    async function carregarEvento() {
      if (!eventoId) return;

      try {
        const res = await fetch(`${API_URL}/api/eventos/${eventoId}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Não foi possível carregar o evento.');
        }

        let data: any = null;

        try {
          data = await res.json();
        } catch {
          throw new Error('Resposta inválida do servidor ao carregar evento.');
        }

        const moedaEvento = normalizeCurrency(
          data?.moeda ?? data?.currency ?? data?.moeda_evento
        );

        const ingressosTratados = Array.isArray(data?.ingressos)
          ? data.ingressos.map((ing: any, index: number) => ({
              ...ing,
              id: String(ing?.id ?? index),
              nome: ing?.nome ?? 'Ingresso',
              preco: safeNumber(ing?.preco, 0),
              moeda: normalizeCurrency(
                ing?.moeda ?? ing?.currency ?? ing?.moeda_evento ?? moedaEvento
              ),
            }))
          : [];

        setEvento({
          ...data,
          moeda: moedaEvento,
          ingressos: ingressosTratados,
        });
      } catch (err) {
        console.error('🚨 Erro de conexão:', err);
        setEvento(null);
      }
    }

    carregarEvento();
  }, [eventoId]);

  const moedaEvento = useMemo(() => {
    return normalizeCurrency(evento?.moeda);
  }, [evento]);

  const locale = useMemo(() => {
    const localeMap: Record<string, string> = {
      BRL: 'pt-BR',
      EUR: 'de-DE',
      USD: 'en-US',
    };

    return localeMap[moedaEvento] || 'pt-BR';
  }, [moedaEvento]);

  const formatarPreco = (valor: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: moedaEvento,
      }).format(safeNumber(valor, 0));
    } catch {
      return safeNumber(valor, 0).toFixed(2);
    }
  };

  const totalGeral = useMemo(() => {
    if (!Array.isArray(evento?.ingressos)) return 0;

    return evento.ingressos.reduce((acc: number, ing: any) => {
      const key = String(ing?.id ?? '');
      const qtdSelecionada = safeNumber(quantidades[key], 0);
      const preco = safeNumber(ing?.preco, 0);

      return acc + preco * qtdSelecionada;
    }, 0);
  }, [evento, quantidades]);

  const totalItens = useMemo(() => {
    return Object.values(quantidades).reduce((a, b) => a + safeNumber(b, 0), 0);
  }, [quantidades]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinalizarCompra = async () => {
    if (!formData.email || !formData.nome) {
      alert('Por favor, preencha nome e e-mail.');
      return;
    }

    if (!eventoId) {
      alert('Evento inválido.');
      return;
    }

    if (totalItens <= 0 || totalGeral <= 0) {
      alert('Selecione pelo menos 1 ingresso.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/pagamento/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: {
            id: eventoId,
            titulo: evento?.nome ?? 'Evento',
            preco: totalGeral / totalItens,
            moeda: moedaEvento,
          },
          usuarioEmail: formData.email,
          usuarioNome: formData.nome,
          quantidade: totalItens,
          quantidades,
          // --- ADICIONADO: Envio dos dados de afiliado para o Back-end ---
          afiliadoId: afiliadoId || '',
          comissaoPercentual: comissaoPercentual || '10',
        }),
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao gerar sessão de pagamento.');
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error(data?.error || 'Erro ao gerar sessão de pagamento.');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      console.error('🚨 Erro:', err);
      alert(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!eventoId) {
    return (
      <div className="p-20 text-center uppercase tracking-widest text-slate-400">
        ID do evento não encontrado.
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 min-h-[80vh]">
      <div className="mb-12">
        <Link
          href={`/evento/${eventoId}`}
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-[10px] tracking-[0.3em] uppercase font-bold"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-7 space-y-12">
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tighter text-slate-950 italic uppercase">
              Finalizar Pedido
            </h1>
            <p className="text-slate-400 font-light text-lg">
              Insira os detalhes para o envio dos seus ingressos digitais.
            </p>
          </header>

          <section className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                  Nome Completo
                </label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Linkah Eventos"
                  className="w-full p-5 bg-white border-b border-slate-200 focus:border-black outline-none transition-all text-xl font-light italic"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
                  E-mail de Recebimento
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="w-full p-5 bg-white border-b border-slate-200 focus:border-black outline-none transition-all text-xl font-light italic"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-6">
              <div className="flex items-center gap-3 text-slate-400">
                <CreditCard size={18} strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-widest">Stripe Gateway</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={18} strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-widest">AWS Encrypted</span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-50 p-10 rounded-sm border border-slate-100 sticky top-28 space-y-10">
            <div className="flex items-start gap-6">
              <div className="w-16 h-20 bg-slate-200 rounded-sm overflow-hidden flex-shrink-0">
                {evento?.imagem_capa && (
                  <img
                    src={
                      String(evento.imagem_capa).startsWith('http')
                        ? evento.imagem_capa
                        : `https://res.cloudinary.com/dj32txsol/image/upload/${evento.imagem_capa}`
                    }
                    className="w-full h-full object-cover grayscale"
                    alt={evento?.nome || 'Evento'}
                  />
                )}
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-slate-900 uppercase italic tracking-tighter leading-tight">
                  {evento?.nome || 'Carregando...'}
                </h4>

                <div className="mt-4 space-y-2">
                  {Array.isArray(evento?.ingressos) &&
                    evento.ingressos.map((ing: any) => {
                      const key = String(ing?.id ?? '');
                      const qtd = safeNumber(quantidades[key], 0);

                      if (qtd > 0) {
                        return (
                          <div key={key} className="flex justify-between items-center group">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                              {qtd}x {ing?.nome || 'Ingresso'}
                            </span>
                            <span className="text-xs font-bold italic text-slate-900">
                              {formatarPreco(safeNumber(ing?.preco, 0) * qtd)}
                            </span>
                          </div>
                        );
                      }

                      return null;
                    })}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-200">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Total a pagar
                </span>
                <span className="text-4xl font-extralight italic tracking-tighter text-slate-950">
                  {formatarPreco(totalGeral)}
                </span>
              </div>

              <button
                onClick={handleFinalizarCompra}
                disabled={loading || !formData.nome || !formData.email || totalGeral === 0}
                className={`w-full py-6 rounded-full flex items-center justify-center gap-3 transition-all duration-500 uppercase text-[10px] font-black tracking-[0.2em] shadow-sm ${
                  loading || !formData.nome || !formData.email || totalGeral === 0
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-slate-800 shadow-xl active:scale-95'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Lock size={14} />
                    Finalizar Pagamento
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400 uppercase tracking-widest pt-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Sua compra é processada com segurança
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Suspense
        fallback={
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-slate-200" size={40} />
            <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
              Preparando Checkout
            </span>
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}