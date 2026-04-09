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
  ExternalLink,
  Users,
  AlignLeft
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

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
  const localeMap: Record<string, string> = { BRL: 'pt-BR', EUR: 'de-DE', USD: 'en-US' };
  return new Intl.NumberFormat(localeMap[moeda] || 'pt-BR', {
    style: 'currency',
    currency: moeda,
  }).format(amount);
}

export default function DetalhesLumaStyle() {
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
        const moedaEvento = normalizeCurrency(data?.moeda || data?.currency || data?.moeda_evento || 'BRL');
        const ingressosTratados = Array.isArray(data?.ingressos)
          ? data.ingressos.map((ing: any) => ({
              ...ing,
              preco: Number(ing?.preco || 0),
              moeda: normalizeCurrency(ing?.moeda || moedaEvento),
            }))
          : [];
        setEvento({ ...data, moeda: moedaEvento, ingressos: ingressosTratados });
        const qts: Record<string, number> = {};
        ingressosTratados.forEach((ing: any) => { qts[ing.id] = 0; });
        if (ingressosTratados.length > 0) qts[ingressosTratados[0].id] = 1;
        setQuantidades(qts);
      } catch (err) {
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
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#7047EB]" size={32} />
    </div>
  );

  if (!evento) return <div className="h-screen flex items-center justify-center">Evento não encontrado.</div>;

  const urlFinalImagem = evento.imagem_capa?.startsWith('http')
    ? evento.imagem_capa
    : `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${evento.imagem_capa}`;

  const linkVenda = `/venda?eventoId=${id}&payload=${encodeURIComponent(JSON.stringify(quantidades))}`;

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-[#121212] antialiased font-sans">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 pt-12 pb-32">
        
        {/* HEADER / COVER AREA */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Imagem de Capa */}
            <div className="md:col-span-5 aspect-square md:aspect-auto relative bg-slate-100">
              <img src={urlFinalImagem} className="w-full h-full object-cover" alt={evento.nome} />
              <div className="absolute top-4 left-4">
                 <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 shadow-sm">
                    <Verified size={14} className="text-[#7047EB]" />
                    <span className="text-[10px] font-bold tracking-tight text-slate-700">OFICIAL</span>
                 </div>
              </div>
            </div>

            {/* Info Principal com o Headline Especial */}
            <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#7047EB]">
                <div className="flex items-center gap-2 mb-6">
                    <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-md text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                        {evento.categoria || 'Evento'}
                    </span>
                </div>

                {/* O HEADLINE QUE VOCÊ PEDIU COM O "AGORA" EM BRANCO */}
                <h1 className="text-5xl md:text-7xl font-black text-[#FF4D4D] leading-[0.95] tracking-tighter mb-8 italic uppercase text-balance">
                  Transforme-se <br/>
                  <span className="text-white">agora</span>
                  <span className="text-[#FF4D4D]">.</span>
                </h1>

                <h2 className="text-2xl font-bold text-white mb-8 opacity-90">{evento.nome}</h2>

                <div className="space-y-4 text-white/90">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-white/60" />
                        <span className="font-semibold text-sm">
                            {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} • {evento.hora_inicio}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-white/60" />
                        <span className="font-semibold text-sm">{evento.local_nome}, {evento.cidade}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <AlignLeft className="text-[#7047EB]" size={20} />
                    Sobre o Evento
                </h3>
                <div 
                  className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-normal"
                  dangerouslySetInnerHTML={{ __html: evento.descricao }} 
                />
            </div>
          </div>

          {/* Ingressos Sticky */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Ingressos</h3>
                    <div className="space-y-4">
                        {evento.ingressos?.map((ing: any) => (
                            <div key={ing.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#7047EB]/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-[#7047EB] transition-colors">{ing.nome}</p>
                                        <p className="text-[#7047EB] font-extrabold text-sm">{formatCurrency(ing.preco, ing.moeda || evento.moeda)}</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        <button onClick={() => setQuantidades(p => ({...p, [ing.id]: Math.max(0, (p[ing.id]||0)-1)}))} className="text-slate-400 hover:text-black transition-colors"><Minus size={14} strokeWidth={3} /></button>
                                        <span className="text-sm font-bold w-4 text-center">{quantidades[ing.id] || 0}</span>
                                        <button onClick={() => setQuantidades(p => ({...p, [ing.id]: (p[ing.id]||0)+1}))} className="text-slate-400 hover:text-black transition-colors"><Plus size={14} strokeWidth={3} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-sm font-medium text-slate-500">Total</span>
                            <span className="text-3xl font-black">{formatCurrency(totalGeral, evento.moeda)}</span>
                        </div>
                        <Link href={totalGeral > 0 ? linkVenda : '#'} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${totalGeral > 0 ? 'bg-[#7047EB] text-white hover:bg-[#5d39cc] shadow-[#7047EB]/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                            Registrar Agora <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        .prose p { margin-bottom: 1.25rem; }
        .prose strong { font-weight: 700; color: #000; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}