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
  Info,
  Globe,
  Share2
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

// --- FUNÇÕES DE TRATAMENTO DE DADOS (INTEGRAIS) ---

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
  ) return 'USD';
  return 'BRL';
}

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

export default function DetalhesLumaCompleto() {
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
        console.log('📦 EVENTO RAW:', data);
        console.log('🎟️ INGRESSOS RAW:', data?.ingressos);

        const moedaEvento = normalizeCurrency(
          data?.moeda || data?.currency || data?.moeda_evento || 'BRL'
        );

        const ingressosTratados = Array.isArray(data?.ingressos)
          ? data.ingressos.map((ing: any, index: number) => {
              const precoFinal = getTicketPrice(ing);

              const ingressoTratado = {
                ...ing,
                id: String(ing?.id || ing?._id || `ingresso-${index}`),
                preco: precoFinal,
                moeda: normalizeCurrency(
                  ing?.moeda ||
                  ing?.currency ||
                  ing?.moeda_ingresso ||
                  moedaEvento
                ),
              };

              console.log('🎫 INGRESSO TRATADO:', ingressoTratado);
              return ingressoTratado;
            })
          : [];

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

    const total = evento.ingressos.reduce((acc: number, ing: any) => {
      const quantidade = Number(quantidades[String(ing.id)] || 0);
      const preco = getTicketPrice(ing);
      return acc + preco * quantidade;
    }, 0);

    console.log('💰 TOTAL GERAL:', total);
    return total;
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

  const urlFinalPatrocinador = evento.banner_patrocinio?.startsWith('http')
    ? evento.banner_patrocinio
    : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.banner_patrocinio}`;

  const linkVenda = `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}`;

  return (
    <div className="min-h-screen bg-white text-[#121212] antialiased selection:bg-indigo-100">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 pt-10 pb-32">
        {/* Topo / Voltar */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors text-sm font-semibold"
          >
            <ChevronLeft size={20} /> Voltar
          </button>
          <button className="p-2.5 rounded-full border border-slate-100 text-slate-400 hover:text-black hover:bg-slate-50 transition-all">
            <Share2 size={18} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* COLUNA ESQUERDA: IMAGEM (ESTILO LUMA) */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="sticky top-28 space-y-8">
              <div className="relative aspect-[3/4] w-full rounded-[2rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-100">
                <img
                  src={urlFinalImagem}
                  className="w-full h-full object-cover"
                  alt={evento.nome}
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 shadow-sm flex items-center gap-1.5">
                    <Verified size={14} className="text-indigo-600" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">
                      Verificado
                    </span>
                  </div>
                </div>
              </div>

              {/* Produtor sutil abaixo da foto */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                  {evento.produtor_nome?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">By</p>
                  <p className="text-sm font-bold text-slate-900">{evento.produtor_nome || 'Produtor Linkah'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CONTEÚDO */}
          <div className="flex-1 space-y-12">
            
            {/* Título e Meta */}
            <section className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {evento.categoria || 'Evento'}
                  </span>
                  {evento.tipo === 'Online' && (
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Online
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                  {evento.nome}
                </h1>
              </div>

              {/* Cards de Infos Minimalistas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Início às {evento.hora_inicio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                      {evento.local_nome}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{evento.cidade}, {evento.estado}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Descrição e Patrocinador */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-4">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Info size={14} /> Detalhes
                </h4>
                <div
                  className="text-slate-600 leading-relaxed font-medium prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: evento.descricao }}
                />
              </div>

              {/* Banner de Patrocínio Estilo Luma Sidebar */}
              {urlFinalPatrocinador && (
                <div className="md:col-span-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-100 p-1.5 bg-white shadow-sm">
                    <img
                      src={urlFinalPatrocinador}
                      className="w-full h-auto rounded-xl object-contain"
                      alt="Sponsor"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Seleção de Ingressos */}
            <section className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                  Ingressos Disponíveis
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Pague com Pix ou Cartão
                </span>
              </div>

              <div className="space-y-3">
                {evento.ingressos?.map((ing: any) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        {ing.nome}
                      </p>
                      <p className="text-indigo-600 font-bold text-sm">
                        {ing.preco === 0 ? 'Gratuito' : formatCurrency(getTicketPrice(ing), ing.moeda || evento.moeda)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      <button
                        onClick={() =>
                          setQuantidades((prev) => ({
                            ...prev,
                            [String(ing.id)]: Math.max(0, (prev[String(ing.id)] || 0) - 1),
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-black transition-all"
                        type="button"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>

                      <span className="text-sm font-black w-4 text-center">
                        {quantidades[String(ing.id)] || 0}
                      </span>

                      <button
                        onClick={() =>
                          setQuantidades((prev) => ({
                            ...prev,
                            [String(ing.id)]: (prev[String(ing.id)] || 0) + 1,
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-black transition-all"
                        type="button"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Barra de Checkout Fixa Sutil ou Footer do Card */}
            <div className="pt-10">
              <div className="bg-[#121212] p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-1">
                    Total do Pedido
                  </p>
                  <p className="text-3xl font-black text-white">
                    {formatCurrency(totalGeral, evento.moeda)}
                  </p>
                </div>

                <Link
                  href={totalGeral > 0 || Object.values(quantidades).some(q => q > 0) ? linkVenda : '#'}
                  className={`group w-full md:w-auto flex items-center justify-center gap-4 px-12 py-5 rounded-2xl font-bold transition-all duration-300 ${
                    totalGeral > 0 || Object.values(quantidades).some(q => q > 0)
                      ? 'bg-white text-black hover:scale-[1.03] active:scale-[0.97]'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span className="text-xs uppercase tracking-widest">Garantir Vaga</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-center mt-6 text-[10px] font-medium text-slate-400 flex items-center justify-center gap-2">
                 Compra segura via Linkah • <Verified size={10} /> Processamento imediato
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { 
          font-family: 'Inter', sans-serif;
          background-color: white;
        }

        .prose ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .prose ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 1rem 0 !important; }
        .prose li { margin-bottom: 0.5rem !important; color: #475569 !important; }
        .prose strong { font-weight: 800 !important; color: #0f172a !important; }
        .prose p { margin-bottom: 1rem !important; }
      `}</style>
    </div>
  );
}