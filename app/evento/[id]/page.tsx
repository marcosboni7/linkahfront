'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../site/Navbar';
import { Footer } from '../../site/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Calendar,
  MapPin,
  Ticket,
  Share2,
  Loader2,
  Plus,
  Minus,
  ChevronLeft,
  CheckCircle2,
  Heart,
  Users,
  Verified,
  Building2
} from 'lucide-react';
import Link from 'next/link';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export default function DetalhesEvento() {
  const { id } = useParams();
  const router = useRouter();
  const { t, language }: any = useLanguage();

  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    async function carregarEvento() {
      try {
        console.log(
          `%c[AWS Debug] Buscando evento ID: ${id}`,
          'color: #C22973; font-weight: bold;'
        );

        const timestamp = new Date().getTime();
        const res = await fetch(`${API_URL}/api/eventos/${id}?t=${timestamp}`, {
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          setEvento(data);

          if (data.ingressos && Array.isArray(data.ingressos)) {
            const qts: any = {};

            data.ingressos.forEach((ing: any) => {
              qts[ing.id] = 0;
            });

            if (data.ingressos.length > 0) {
              qts[data.ingressos[0].id] = 1;
            }

            setQuantidades(qts);
          }
        }
      } catch (err) {
        console.error('[AWS Debug] Erro na conexão:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarEvento();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#C22973]" size={40} />
          <p className="text-slate-400 font-medium animate-pulse">
            {t?.sync || 'Sincronizando...'}
          </p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-slate-500 font-medium italic">
          Evento não encontrado.
        </p>
        <button
          onClick={() => router.push('/')}
          className="text-[#C22973] font-bold underline"
        >
          Voltar para o início
        </button>
      </div>
    );
  }

  const rawImage =
    evento.imagem_capa || evento.capa_url || evento.imagem_url || evento.imagem;

  let urlFinalImagem =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';

  if (rawImage && rawImage !== 'null' && rawImage !== 'undefined') {
    const valor = String(rawImage).trim();

    if (valor.startsWith('http://') || valor.startsWith('https://')) {
      urlFinalImagem = valor;
    } else if (valor.startsWith('linkah/')) {
      urlFinalImagem = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valor}`;
    } else {
      urlFinalImagem = `${API_URL}/uploads/${valor.replace(/^\/+/, '')}`;
    }
  }

  const rawBanner = evento.banner_patrocinio;
  let urlFinalBanner = null;

  if (rawBanner && rawBanner !== 'null' && rawBanner !== 'undefined') {
    const valorBanner = String(rawBanner).trim();

    if (valorBanner.startsWith('http')) {
      urlFinalBanner = valorBanner;
    } else if (valorBanner.startsWith('linkah/')) {
      urlFinalBanner = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valorBanner}`;
    } else {
      urlFinalBanner = `${API_URL}/uploads/${valorBanner.replace(/^\/+/, '')}`;
    }
  }

  const moedaFinal = (evento.moeda || 'BRL').toUpperCase();
  const locale = language === 'PT' ? 'pt-BR' : 'en-US';

  const formatarDataSegura = (data: string) => {
    if (!data) return '---';

    const apenasData = String(data).split('T')[0];
    const partes = apenasData.split('-');

    if (partes.length !== 3) return '---';

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (!ano || !mes || !dia) return '---';

    const dataLocal = new Date(ano, mes - 1, dia);

    return dataLocal.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long'
    });
  };

  const formatarHoraSegura = (hora: string) => {
    if (!hora) return '19:00';
    return String(hora).slice(0, 5);
  };

  const totalGeral =
    evento.ingressos?.reduce((acc: number, ing: any) => {
      return acc + Number(ing.preco) * (quantidades[ing.id] || 0);
    }, 0) || 0;

  const temIngressoSelecionado = totalGeral > 0;

  const handleMudarQuantidade = (ingId: string, operacao: 'soma' | 'sub') => {
    setQuantidades((prev) => ({
      ...prev,
      [ingId]:
        operacao === 'soma'
          ? (prev[ingId] || 0) + 1
          : Math.max(0, (prev[ingId] || 0) - 1)
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#C22973] transition-all text-sm font-semibold"
          >
            <div className="p-2 rounded-full group-hover:bg-pink-50 transition-colors">
              <ChevronLeft size={18} />
            </div>
            {language === 'PT' ? 'Voltar' : 'Back'}
          </button>

          <div className="flex gap-3">
            <button className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shadow-sm transition-all">
              <Share2 size={18} />
            </button>
            <button className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shadow-sm transition-all">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* CAPA NOVA 1080x1350 */}
        <div className="w-full flex justify-center mb-14">
          <div className="relative w-full max-w-[1080px] aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            <img
              src={urlFinalImagem}
              alt={evento.nome}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn('[Render Debug] Falha na imagem, usando fallback.');
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute top-5 left-5 right-5 flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/12 backdrop-blur-md px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] text-white border border-white/20">
                  {evento.categoria || 'Evento'}
                </span>

                <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/90 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/15">
                  <Verified size={13} className="text-sky-300" />
                  {language === 'PT' ? 'Verificado' : 'Verified'}
                </span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-[1.75rem] p-5 md:p-7">
                <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight">
                  {evento.nome}
                </h1>

                <div className="mt-5 flex flex-wrap gap-3 text-white/90">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm">
                    <Calendar size={16} />
                    <span>
                      {formatarDataSegura(evento.data_inicio)} •{' '}
                      {formatarHoraSegura(evento.hora_inicio || evento.horario)}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm">
                    <MapPin size={16} />
                    <span>
                      {String(evento.tipo || '').toLowerCase() === 'online'
                        ? 'Linkah Digital'
                        : evento.local_nome || evento.local || 'Local a definir'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
          <div className="lg:col-span-8 space-y-10">
            {/* INFORMAÇÕES */}
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-[#C22973] shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">
                      Data
                    </p>
                    <p className="font-semibold text-slate-900 text-lg">
                      {formatarDataSegura(evento.data_inicio)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatarHoraSegura(evento.hora_inicio || evento.horario)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">
                      Local
                    </p>
                    <p className="font-semibold text-slate-900 text-lg line-clamp-1">
                      {String(evento.tipo || '').toLowerCase() === 'online'
                        ? 'Linkah Digital'
                        : evento.local_nome || evento.local || 'Local a definir'}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {String(evento.tipo || '').toLowerCase() === 'online'
                        ? 'Digital'
                        : evento.cidade || 'Cidade a definir'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">
                      Organizador
                    </p>
                    <p className="font-semibold text-slate-900 text-lg line-clamp-1">
                      {evento.produtor_nome || 'Linkah Produtora'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SOBRE */}
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-5">
                Sobre o evento
              </h2>

              <div className="text-slate-600 leading-8 text-base md:text-lg whitespace-pre-line">
                {evento.descricao || 'Sem descrição disponível.'}
              </div>
            </section>

            {/* BANNER PATROCINADOR 236x354 */}
            {urlFinalBanner && (
              <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Building2 size={14} className="text-blue-500" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      Patrocinador oficial
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-full max-w-[236px] aspect-[236/354] rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                    <img
                      src={urlFinalBanner}
                      alt="Banner Patrocinador"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-6 md:p-7 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-xl">
                  Ingressos
                </h3>
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {evento.ingressos?.length > 0 ? (
                  evento.ingressos.map((ing: any) => (
                    <div
                      key={ing.id}
                      className={`rounded-[1.5rem] border p-4 transition-all ${
                        quantidades[ing.id] > 0
                          ? 'bg-pink-50/40 border-pink-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <p className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                        {ing.nome || 'Individual'}
                      </p>

                      <p className="text-[#C22973] font-bold text-xl mt-1 mb-4">
                        {Number(ing.preco).toLocaleString(locale, {
                          style: 'currency',
                          currency: moedaFinal
                        })}
                      </p>

                      <div className="flex items-center justify-between bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                        <button
                          onClick={() => handleMudarQuantidade(ing.id, 'sub')}
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-[#C22973] transition-colors"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="font-bold text-lg text-slate-900">
                          {quantidades[ing.id] || 0}
                        </span>

                        <button
                          onClick={() => handleMudarQuantidade(ing.id, 'soma')}
                          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-[#C22973] transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Nenhum ingresso disponível no momento.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-5">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em]">
                    Total geral
                  </p>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    {totalGeral.toLocaleString(locale, {
                      style: 'currency',
                      currency: moedaFinal
                    })}
                  </p>
                </div>

                <Link
                  href={
                    temIngressoSelecionado
                      ? `/venda?eventoId=${id}&payload=${encodeURIComponent(
                          JSON.stringify(quantidades)
                        )}`
                      : '#'
                  }
                  className={`flex items-center justify-center w-full py-4 rounded-[1.25rem] font-bold text-white transition-all ${
                    temIngressoSelecionado
                      ? 'bg-gradient-to-r from-[#C22973] to-[#ff8c42] hover:opacity-95'
                      : 'bg-slate-200 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <Ticket size={20} className="mr-2" />
                  CONTINUAR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}