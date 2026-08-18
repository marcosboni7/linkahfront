'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Info,
  Globe,
  Share2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

function normalizeCurrency(input?: string) {
  const raw = String(input || '').trim().toUpperCase();
  if (raw === 'R$' || raw === 'REAL' || raw === 'REAIS' || raw === 'BRL') return 'BRL';
  if (raw === '€' || raw === 'EURO' || raw === 'EUROS' || raw === 'EUR') return 'EUR';
  if (
    raw === '$' ||
    raw === 'DOLAR' ||
    raw === 'DÓLAR' ||
    raw === 'DOLARES' ||
    raw === 'DÓLARES' ||
    raw === 'USD'
  ) {
    return 'USD';
  }
  return 'BRL';
}

// Função segura para parsear preço
function parsePrice(value: any) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  let raw = String(value).trim();
  if (!raw) return 0;

  raw = raw.replace(/[^\d,.-]/g, '');

  if (raw.includes('.') && raw.includes(',')) {
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else if (raw.includes(',')) {
    raw = raw.replace(',', '.');
  }

  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTicketPrice(ing: any) {
  return parsePrice(
    ing?.preco ??
      ing?.valor ??
      ing?.price ??
      ing?.preco_ingresso ??
      ing?.valor_ingresso ??
      ing?.lote_valor ??
      ing?.amount ??
      0
  );
}

function formatCurrency(value: number | string, currency?: string) {
  const amount = parsePrice(value);
  const moeda = normalizeCurrency(currency);

  const localeMap: Record<string, string> = {
    BRL: 'pt-BR',
    EUR: 'de-DE',
    USD: 'en-US',
  };

  return new Intl.NumberFormat(localeMap[moeda] || 'pt-BR', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function DetalhesLumaRoxo() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const router = useRouter();

  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  // --- LÓGICA DE AFILIADO BLINDADA ---
  const afiliadoId = searchParams?.get?.('ref') || searchParams?.get?.('afiliado_id') || '';

  useEffect(() => {
    async function carregarEvento() {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${API_URL}/api/eventos/${id}?t=${timestamp}`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Erro ao carregar evento');

        const data = await res.json();
        console.log('📦 Evento carregado da API:', data);

        const moedaEvento = normalizeCurrency(
          data?.moeda || data?.currency || data?.moeda_evento || 'BRL'
        );

        const ingressosTratados = Array.isArray(data?.ingressos)
          ? data.ingressos.map((ing: any, index: number) => {
              const precoFinal = getTicketPrice(ing);
              return {
                ...ing,
                id: String(ing?.id || ing?._id || `ingresso-${index}`),
                descricao: ing?.descricao || '',
                preco: precoFinal,
                moeda: normalizeCurrency(
                  ing?.moeda || ing?.currency || ing?.moeda_ingresso || moedaEvento
                ),
              };
            })
          : [];

        console.log('🎟️ Ingressos tratados:', ingressosTratados);

        setEvento({
          ...data,
          moeda: moedaEvento,
          ingressos: ingressosTratados,
        });

        const qts: Record<string, number> = {};
        ingressosTratados.forEach((ing: any) => {
          qts[String(ing.id)] = 0;
        });

        if (ingressosTratados.length > 0) {
          qts[String(ingressosTratados[0].id)] = 1;
        }

        console.log('🔢 Quantidades iniciais definidas:', qts);
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

  // CORRIGIDO: Removido o lixo de tradução do array de dependências
  const totalGeral = useMemo(() => {
    if (!Array.isArray(evento?.ingressos)) return 0;

    return evento.ingressos.reduce((acc: number, ing: any) => {
      const quantidade = Number(quantidades[String(ing.id)] || 0);
      const preco = getTicketPrice(ing);
      return acc + preco * quantidade;
    }, 0);
  }, [evento, quantidades]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-300" size={32} />
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-slate-400">
        Evento não encontrado.
      </div>
    );
  }

  const urlFinalImagem = evento.imagem_capa?.startsWith('http')
    ? evento.imagem_capa
    : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`;

  const urlFinalPatrocinador = evento.banner_patrocinio
    ? evento.banner_patrocinio?.startsWith('http')
      ? evento.banner_patrocinio
      : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`
    : null;

  return (
    <div className="min-h-screen bg-white text-[#121212] antialiased selection:bg-orange-100">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 pt-10 pb-32">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-colors text-sm font-semibold"
          >
            <ChevronLeft size={20} /> Voltar
          </button>

          <button className="p-2.5 rounded-full border border-slate-100 text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all">
            <Share2 size={18} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="sticky top-28 space-y-8">
              <div className="relative aspect-[3/4] w-full rounded-[2rem] overflow-hidden bg-slate-50 shadow-inner border border-slate-100">
                <img
                  src={urlFinalImagem}
                  className="w-full h-full object-cover"
                  alt={evento.nome}
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 shadow-sm flex items-center gap-1.5">
                    <Verified size={14} className="text-orange-600" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">
                      Oficial
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-2">
                <div className="w-11 h-11 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-sm uppercase">
                  {evento.produtor_nome?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">
                    Host
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {evento.produtor_nome || 'Produtor Verificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-12">
            <section className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {evento.categoria || 'Evento'}
                  </span>

                  {evento.tipo === 'Online' && (
                    <span className="inline-block px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe size={12} /> Online
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
                  {evento.nome}
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6 border-y border-slate-100">
                <div className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {evento.hora_inicio} até {evento.hora_termino || 'fim'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 truncate max-w-[200px]">
                      {evento.local_nome}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {evento.cidade}, {evento.estado}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-4">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Info size={14} /> Sobre a Experiência
                </h4>
                <div
                  className="text-slate-600 leading-relaxed font-medium prose prose-slate max-w-none prose-p:mb-5 prose-li:mb-2 prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: evento.descricao }}
                />
              </div>

              {urlFinalPatrocinador && (
                <div className="md:col-span-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-100 p-2 bg-white shadow-sm">
                    <img
                      src={urlFinalPatrocinador}
                      className="w-full h-auto rounded-xl object-contain"
                      alt="Sponsor"
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-6 pt-10 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
                  Escolha seu Acesso
                </h3>
              </div>

              <div className="space-y-3">
                {evento.ingressos?.map((ing: any) => (
                  <div
                    key={ing.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 transition-all shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100"
                  >
                    <div className="space-y-2 max-w-xl">
                      <p className="text-base font-bold text-slate-900 uppercase tracking-wide">
                        {ing.nome}
                      </p>

                      {ing.descricao && (
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                          {ing.descricao}
                        </p>
                      )}

                      <p className="text-orange-600 font-extrabold text-base">
                        {ing.preco === 0
                          ? 'Gratuito'
                          : formatCurrency(getTicketPrice(ing), ing.moeda || evento.moeda)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-orange-50/50 p-1 rounded-xl border border-orange-100">
                      <button
                        onClick={() =>
                          setQuantidades((prev) => {
                            const novo = {
                              ...prev,
                              [String(ing.id)]: Math.max(0, (prev[String(ing.id)] || 0) - 1),
                            };
                            console.log('➖ Quantidade decrementada:', novo);
                            return novo;
                          })
                        }
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-orange-400 hover:text-orange-700 transition-all active:scale-95"
                        type="button"
                      >
                        <Minus size={16} strokeWidth={3} />
                      </button>

                      <span className="text-base font-black w-5 text-center text-orange-950">
                        {quantidades[String(ing.id)] || 0}
                      </span>

                      <button
                        onClick={() =>
                          setQuantidades((prev) => {
                            const novo = {
                              ...prev,
                              [String(ing.id)]: (prev[String(ing.id)] || 0) + 1,
                            };
                            console.log('➕ Quantidade incrementada:', novo);
                            return novo;
                          })
                        }
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-orange-400 hover:text-orange-700 transition-all active:scale-95"
                        type="button"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-10">
              <div className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center gap-6 border border-slate-100 shadow-lg shadow-slate-100">
                <div className="w-full flex items-center justify-between px-4">
                  <p className="text-sm font-bold text-slate-900">Total a investir</p>
                  <p className="text-3xl font-black text-orange-600">
                    {formatCurrency(totalGeral, evento.moeda)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const finalPayload = encodeURIComponent(JSON.stringify(quantidades));
                    console.log('🚀 CLIQUE NO BOTÃO! Quantidades atuais:', quantidades);
                    console.log('📦 Payload gerado para a URL:', finalPayload);

                    router.push(
                      `/venda?eventoId=${id}&afiliado_id=${afiliadoId}&payload=${finalPayload}`
                    );
                  }}
                  disabled={!Object.values(quantidades).some((q) => q > 0)}
                  className={`group w-full flex items-center justify-center gap-4 px-12 py-6 rounded-2xl font-bold transition-all duration-300 text-lg ${
                    Object.values(quantidades).some((q) => q > 0)
                      ? 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continuar compra
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}