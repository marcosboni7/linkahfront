'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  ShieldCheck, Lock, Loader2, ArrowLeft,
  Ticket as TicketIcon, CreditCard, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

function normalizeCurrency(input?: string) {
  const raw = String(input || '').trim().toUpperCase();

  if (raw === 'R$' || raw === 'REAL' || raw === 'REAIS' || raw === 'BRL') return 'BRL';
  if (raw === '€' || raw === 'EURO' || raw === 'EUROS' || raw === 'EUR') return 'EUR';
  if (raw === '$' || raw === 'DOLAR' || raw === 'DÓLAR' || raw === 'DOLARES' || raw === 'DÓLARES' || raw === 'USD') return 'USD';

  return 'BRL';
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('eventoId');
  const payloadRaw = searchParams.get('payload');

  const [loading, setLoading] = useState(false);
  const [evento, setEvento] = useState<any>(null);
  const [formData, setFormData] = useState({ nome: '', email: '' });
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  const { language }: any = useLanguage();

  useEffect(() => {
    if (payloadRaw) {
      try {
        const decoded = JSON.parse(decodeURIComponent(payloadRaw));
        setQuantidades(decoded);
      } catch (err) {
        console.error('Erro ao decodificar payload:', err);
      }
    }
  }, [payloadRaw]);

  useEffect(() => {
    async function carregarEvento() {
      if (!eventoId) return;

      try {
        const res = await fetch(`${API_URL}/api/eventos/${eventoId}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();

          const moedaEvento = normalizeCurrency(
            data?.moeda ||
            data?.currency ||
            data?.moeda_evento
          );

          const ingressosTratados = Array.isArray(data?.ingressos)
            ? data.ingressos.map((ing: any) => ({
                ...ing,
                preco: Number(ing?.preco || 0),
                moeda: normalizeCurrency(
                  ing?.moeda ||
                  ing?.currency ||
                  ing?.moeda_evento ||
                  moedaEvento
                ),
              }))
            : [];

          setEvento({
            ...data,
            moeda: moedaEvento,
            ingressos: ingressosTratados,
          });
        }
      } catch (err) {
        console.error('🚨 Erro de conexão:', err);
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

  const formatarPreco = useMemo(() => {
    return (valor: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: moedaEvento,
      }).format(Number(valor || 0));
  }, [locale, moedaEvento]);

  const totalGeral = evento?.ingressos?.reduce((acc: number, ing: any) => {
    const qtdSelecionada = quantidades[ing.id] || 0;
    return acc + (Number(ing.preco) * qtdSelecionada);
  }, 0) || 0;

  const totalItens = Object.values(quantidades).reduce((a, b) => a + b, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalizarCompra = async () => {
    if (!formData.email || !formData.nome) {
      alert('Por favor, preencha nome e e-mail.');
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
            titulo: evento?.nome,
            precoTotal: totalGeral,
            moeda: moedaEvento
          },
          usuarioEmail: formData.email,
          usuarioNome: formData.nome,
          quantidades: quantidades,
          totalItens: totalItens
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error(data.error || 'Erro ao gerar sessão de pagamento.');
      }
    } catch (err: any) {
      console.error('🚨 Erro:', err.message);
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!eventoId) {
    return <div className="p-20 text-center">ID do evento não encontrado.</div>;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 min-h-[80vh]">
      <div className="mb-12">
        <Link
          href={`/evento/${eventoId}`}
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-[10px] tracking-[0.3em] uppercase font-bold"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar
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
                  placeholder="Ex: Marcos Boni"
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
                      evento.imagem_capa.startsWith('http')
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
                  {evento?.ingressos?.map((ing: any) => {
                    const qtd = quantidades[ing.id] || 0;

                    if (qtd > 0) {
                      return (
                        <div key={ing.id} className="flex justify-between items-center group">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                            {qtd}x {ing.nome}
                          </span>
                          <span className="text-xs font-bold italic">
                            {formatarPreco(Number(ing.preco) * qtd)}
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