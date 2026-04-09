'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import {
  Calendar,
  MapPin,
  Loader2,
  Plus,
  Minus,
  ChevronLeft,
  ArrowRight,
  Verified,
  Info
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

// Utilitários de Formatação
function normalizeCurrency(input?: string) {
  const raw = String(input || '').trim().toUpperCase();
  if (raw === 'R$' || raw === 'REAL' || raw === 'REAIS' || raw === 'BRL') return 'BRL';
  if (raw === '€' || raw === 'EURO' || raw === 'EUROS' || raw === 'EUR') return 'EUR';
  if (raw === '$' || raw === 'DOLAR' || raw === 'DÓLAR' || raw === 'DOLARES' || raw === 'DÓLARES' || raw === 'USD') return 'USD';
  return 'BRL';
}

function formatCurrency(value: number | string, currency?: string) {
  const amount = Number(value || 0);
  const moeda = normalizeCurrency(currency);
  const localeMap: Record<string, string> = {
    BRL: 'pt-BR',
    EUR: 'de-DE',
    USD: 'en-US',
  };
  return new Intl.NumberFormat(localeMap[moeda] || 'pt-BR', {
    style: 'currency',
    currency: moeda,
  }).format(amount);
}

export default function DetalhesEquilibrado() {
  const { id } = useParams();
  const router = useRouter();

  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function carregarEvento() {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${API_URL}/api/eventos/${id}?t=${timestamp}`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Erro ao carregar evento');

        const data = await res.json();
        
        // Normalização da moeda base do evento
        const moedaEvento = normalizeCurrency(
          data?.moeda || data?.currency || data?.moeda_evento || 'BRL'
        );

        // Tratamento dos ingressos
        const ingressosTratados = Array.isArray(data?.ingressos)
          ? data.ingressos.map((ing: any) => ({
              ...ing,
              preco: Number(ing?.preco || 0),
              moeda: normalizeCurrency(ing?.moeda || moedaEvento),
            }))
          : [];

        setEvento({
          ...data,
          moeda: moedaEvento,
          ingressos: ingressosTratados,
        });

        // Inicializa quantidades (primeiro ingresso com 1 por padrão)
        const qts: Record<string, number> = {};
        ingressosTratados.forEach((ing: any) => { qts[ing.id] = 0; });
        if (ingressosTratados.length > 0) {
          qts[ingressosTratados[0].id] = 1;
        }
        setQuantidades(qts);

      } catch (err) {
        console.error('❌ Erro ao carregar evento:', err);
        setEvento(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarEvento();
  }, [id]);

  const totalGeral = useMemo(() => {
    if (!Array.isArray(evento?.ingressos)) return 0;
    return evento.ingressos.reduce((acc: number, ing: any) => {
      const quantidade = quantidades[ing.id] || 0;
      return acc + (Number(ing.preco || 0) * quantidade);
    }, 0);
  }, [evento, quantidades]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  if (!evento) return <div className="h-screen flex items-center justify-center font-bold">Evento não encontrado.</div>;

  // URLs das Imagens
  const urlFinalImagem = evento.imagem_capa?.startsWith('http')
    ? evento.imagem_capa
    : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`;

  const urlFinalPatrocinador = evento.banner_patrocinio?.startsWith('http')
    ? evento.banner_patrocinio
    : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`;

  const linkVenda = `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-32">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="mb-10 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all text-xs font-semibold"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LADO ESQUERDO: CAPA */}
          <div className="lg:col-span-6">
            <div className="sticky top-28">
              <div className="relative aspect-[1080/1350] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border-4 border-white">
                <img
                  src={urlFinalImagem}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  alt={evento.nome}
                />
                <div className="absolute top-6 left-6">
                  <div className="bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/50 shadow-sm">
                    <Verified size={16} className="text-indigo-600" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-800">
                      Evento Oficial
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: INFO E INGRESSOS */}
          <div className="lg:col-span-6 space-y-10">
            <section className="space-y-6">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {evento.categoria || 'Destaque'}
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                  {evento.nome}
                </h1>
              </div>

              {/* Badges de Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Data e Hora</p>
                    <p className="text-sm font-bold">
                      {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                      })}{' '}
                      • {evento.hora_inicio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Localização</p>
                    <p className="text-sm font-bold">
                      {evento.local_nome}, {evento.cidade}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SOBRE O EVENTO COM FIX DE QUEBRA DE LINHA */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={14} /> Sobre o evento
                </h4>
                {/* AQUI ESTÁ O SEGREDO: whitespace-pre-wrap */}
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {evento.descricao}
                </p>
              </div>

              {/* Patrocinador */}
              <div className="md:col-span-4 flex justify-center">
                <div className="w-full max-w-[200px] aspect-[236/354] bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100">
                  <div className="w-full h-full rounded-[1.2rem] overflow-hidden">
                    <img
                      src={urlFinalPatrocinador}
                      className="w-full h-full object-cover"
                      alt="Sponsor"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SELEÇÃO DE INGRESSOS */}
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] ml-2">
                  Escolha seu acesso
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Moeda: {evento.moeda}
                </span>
              </div>

              <div className="space-y-3">
                {evento.ingressos?.map((ing: any) => (
                  <div
                    key={ing.id}
                    className="group bg-white hover:bg-indigo-600 p-6 rounded-[1.8rem] border border-slate-100 hover:border-indigo-400 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-200"
                  >
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-900 group-hover:text-white transition-colors">
                        {ing.nome}
                      </p>
                      <p className="text-indigo-600 font-bold text-sm mt-1 group-hover:text-indigo-200 transition-colors">
                        {formatCurrency(ing.preco, ing.moeda || evento.moeda)}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-50 group-hover:bg-white/10 px-5 py-2.5 rounded-2xl transition-colors">
                      <button
                        onClick={() =>
                          setQuantidades((prev) => ({
                            ...prev,
                            [ing.id]: Math.max(0, (prev[ing.id] || 0) - 1),
                          }))
                        }
                        className="text-slate-400 hover:text-indigo-600 group-hover:text-white transition-colors"
                        type="button"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>

                      <span className="text-md font-black w-4 text-center group-hover:text-white">
                        {quantidades[ing.id] || 0}
                      </span>

                      <button
                        onClick={() =>
                          setQuantidades((prev) => ({
                            ...prev,
                            [ing.id]: (prev[ing.id] || 0) + 1,
                          }))
                        }
                        className="text-slate-400 hover:text-indigo-600 group-hover:text-white transition-colors"
                        type="button"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* BARRA DE CHECKOUT */}
              <div className="mt-12 bg-slate-900 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">
                    Valor do investimento
                  </p>
                  <p className="text-4xl font-black text-white mt-1">
                    {formatCurrency(totalGeral, evento.moeda)}
                  </p>
                </div>

                <Link
                  href={totalGeral > 0 ? linkVenda : '#'}
                  className={`group flex items-center gap-4 px-10 py-5 rounded-2xl font-bold transition-all duration-300 ${
                    totalGeral > 0
                      ? 'bg-indigo-600 text-white hover:bg-white hover:text-indigo-600'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span className="text-sm uppercase tracking-widest">
                    Confirmar Pedido
                  </span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}