'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Navbar } from './site/Navbar';
import { EventCard } from './site/EventCard';
import { Footer } from './site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  Search,
  Ticket,
  Music,
  Mic2,
  Theater,
  Gamepad2,
  Utensils,
  GraduationCap,
  PartyPopper,
  Heart,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

const iconMap: { [key: string]: any } = {
  Todos: Ticket,
  Show: Music,
  Mentoria: Mic2,
  Teatro: Theater,
  Games: Gamepad2,
  Gastronomia: Utensils,
  Workshop: GraduationCap,
  Festa: PartyPopper,
  Infantil: Heart,
};

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070', titleKey: 'slide1Title', highlightKey: 'slide1Highlight' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', titleKey: 'slide2Title', highlightKey: 'slide2Highlight' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070', titleKey: 'slide3Title', highlightKey: 'slide3Highlight' },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
      <div className="h-48 bg-slate-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-slate-200 animate-pulse rounded-full" />
        <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded-full" />
      </div>
    </div>
  );
}

export default function BuyTicketHome() {
  const { t }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resEventos, resComunidades] = await Promise.all([
          fetch(`${API_URL_BASE}/api/eventos/vitrine`, { cache: 'no-store' }),
          fetch(`${API_URL_BASE}/api/comunidades`, { cache: 'no-store' }),
        ]);

        if (resEventos.ok) {
          const dados = await resEventos.json();
          setEventos(dados);
          
          const extrair: string[] = dados
            .map((ev: any) => ev.categoria)
            .filter(Boolean)
            .map((x: any) => String(x).trim());

          setCategoriasExistentes(['Todos', ...Array.from(new Set<string>(extrair))]);
        }

        if (resComunidades.ok) {
          const dadosCom = await resComunidades.json();
          setComunidades(dadosCom.slice(0, 3));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  /**
   * DEBUG DE FILTRO "HOJE"
   */
  const oQueFazerHoje = useMemo(() => {
    const hojeLocal = new Date().toLocaleDateString('en-CA'); 
    console.log("--- DEBUG HOJE ---");
    console.log("Data do Sistema (en-CA):", hojeLocal);

    const filtrados = eventos.filter((ev) => {
      const dataRaw = ev.data_inicio || ev.data || '';
      if (!dataRaw) return false;
      
      // Limpeza de fuso para comparação de dia
      const dataLimpa = String(dataRaw).replace(/Z$|[+-]\d{2}:\d{2}$/, '');
      const dataEvento = dataLimpa.split('T')[0];
      
      const ehHoje = dataEvento === hojeLocal;
      
      if (ehHoje) {
        console.log(`✅ Evento HOJE: ${ev.nome} | Data API: ${dataRaw} | Comparação: ${dataEvento} === ${hojeLocal}`);
      }

      return ehHoje;
    });

    console.log("Total eventos hoje:", filtrados.length);
    console.log("------------------");
    return filtrados;
  }, [eventos]);

  const vitrineFiltrada = useMemo(() => {
    const query = buscaNome.trim().toLowerCase();
    return eventos.filter((ev) => {
      const nomeMatch = String(ev.nome || '').toLowerCase().includes(query);
      const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
      return nomeMatch && catMatch;
    });
  }, [eventos, buscaNome, categoriaAtiva]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
      <Navbar />

      <section className="relative h-[80vh] min-h-[550px] overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'absolute inset-0 transition-all duration-1000',
                i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
            >
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            </div>
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-6 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
              <Sparkles size={12} className="text-indigo-300" />
              Curadoria Linkah
            </div>

            <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              {String(t?.[slide.titleKey] || "")}{' '}
              <span className="block font-light text-indigo-300/90 italic">
                {String(t?.[slide.highlightKey] || "")}
              </span>
            </h1>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 bg-white/10 p-2 rounded-3xl border border-white/10 backdrop-blur-xl max-w-2xl">
              <div className="flex flex-1 items-center gap-3 px-4 py-2">
                <Search size={20} className="text-white/60" />
                <input
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  placeholder={String(t?.searchPlaceholder || "Buscar eventos...")}
                  className="w-full bg-transparent text-white outline-none placeholder:text-white/40"
                />
              </div>
              <button 
                onClick={() => document.getElementById('vitrine-principal')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-slate-950 px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-50 transition"
              >
                {String(t?.explore || "Explorar")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[64px] z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <CategoryFilter
            categories={categoriasExistentes}
            activeCategory={categoriaAtiva}
            onSelect={setCategoriaAtiva}
            iconMap={iconMap}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* SEÇÃO ACONTECENDO HOJE */}
            {!buscaNome && categoriaAtiva === 'Todos' && oQueFazerHoje.length > 0 && (
              <section className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-2">
                      <Zap size={14} fill="currentColor" /> Live Now
                    </div>
                    <h2 className="text-3xl font-bold text-slate-950">Acontecendo hoje</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {oQueFazerHoje.map((ev) => (
                    <EventCard key={ev.id} evento={ev} />
                  ))}
                </div>
              </section>
            )}

            {!buscaNome && categoriaAtiva === 'Todos' && comunidades.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-8 text-slate-950">Comunidades em destaque</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {comunidades.map((com) => (
                            <Link href={`/evento/${com.id}/comunidade`} key={com.id} className="group relative h-64 rounded-3xl overflow-hidden shadow-lg">
                                <Image 
                                  src={String(com.imagem_url || 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=1200')} 
                                  alt={String(com.nome || "Comunidade")} 
                                  fill 
                                  className="object-cover transition duration-500 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <p className="text-white font-bold text-xl">{String(com.nome || "")}</p>
                                    <p className="text-white/70 text-sm">{Number(com.total_membros || 0)} membros</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section id="vitrine-principal" className="scroll-mt-32">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
                <div>
                    <h2 className="text-4xl font-bold text-slate-950 tracking-tight">
                        {buscaNome ? `Resultados para "${buscaNome}"` : categoriaAtiva === 'Todos' ? 'Descubra Experiências' : categoriaAtiva}
                    </h2>
                    <p className="text-slate-500 mt-2">{vitrineFiltrada.length} opções disponíveis</p>
                </div>
                {(buscaNome || categoriaAtiva !== 'Todos') && (
                    <button 
                        onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}}
                        className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-indigo-800 transition"
                    >
                        <X size={14} /> Limpar Filtros
                    </button>
                )}
              </div>

              {vitrineFiltrada.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                  {vitrineFiltrada.map((ev) => (
                    <EventCard key={ev.id} evento={ev} />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum evento encontrado</p>
                  <button onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}} className="mt-4 text-indigo-600 font-bold hover:underline">Ver vitrine completa</button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}