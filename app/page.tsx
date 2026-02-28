'use client';



import { useEffect, useMemo, useState } from 'react';

import { Navbar } from './site/Navbar';

import { EventCard } from './site/EventCard';

import { Footer } from './site/Footer';

import { CategoryFilter } from './site/CategoryFilter';

import { useLanguage } from '@/app/context/LanguageContext';

import {

  Search,

  Ticket,

  Palette,

  Theater,

  Briefcase,

  GraduationCap,

  Heart,

  Sparkles,

  Users,

  Zap,

  X,

} from 'lucide-react';

import Link from 'next/link';

import Image from 'next/image';



const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';



const iconMap: { [key: string]: any } = {

  Todos: Ticket,

  'Arte & Cultura': Palette,

  'Entretenimento': Theater,

  'Negócios': Briefcase,

  'Educação & Desenvolvimento': GraduationCap,

  'Esportes & Bem-estar': Heart,

  'Experiências & Lifestyle': Sparkles,

  'Família & Comunidade': Users,

};



const CATEGORIAS_FIXAS = [

  'Todos',

  'Arte & Cultura',

  'Entretenimento',

  'Negócios',

  'Educação & Desenvolvimento',

  'Esportes & Bem-estar',

  'Experiências & Lifestyle',

  'Família & Comunidade'

];



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

  const [buscaNome, setBuscaNome] = useState('');

  const [currentSlide, setCurrentSlide] = useState(0);



  const getCategoriaTraduzida = (cat: string) => {

    if (cat === 'Todos') return t.allCategories || 'Todos';

    const map: Record<string, string> = {

      'Arte & Cultura': t.catArt,

      'Entretenimento': t.catEnt,

      'Negócios': t.catBiz,

      'Educação & Desenvolvimento': t.catEdu,

      'Esportes & Bem-estar': t.catHealth,

      'Experiências & Lifestyle': t.catLife,

      'Família & Comunidade': t.catFamily,

    };

    return map[cat] || cat;

  };



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



  const vitrineFiltrada = useMemo(() => {

    const query = buscaNome.trim().toLowerCase();

    return eventos.filter((ev) => {

      const nomeMatch = String(ev.nome || '').toLowerCase().includes(query);

      // Aqui a comparação agora vai bater com o valor que salvamos no NovoEventoPresencial

      const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;

      return nomeMatch && catMatch;

    });

  }, [eventos, buscaNome, categoriaAtiva]);



  const oQueFazerHoje = useMemo(() => {

    const agora = new Date();

    const hojeLocal = agora.getFullYear() + '-' +

                      String(agora.getMonth() + 1).padStart(2, '0') + '-' +

                      String(agora.getDate()).padStart(2, '0');



    return eventos.filter((ev) => {

      const dataRaw = ev.data_inicio || ev.data || '';

      if (!dataRaw) return false;

      const dataEvento = String(dataRaw).split('T')[0];

      return dataEvento === hojeLocal;

    });

  }, [eventos]);



  const slide = SLIDES[currentSlide];



  return (

    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">

      <Navbar />



      {/* Hero Section */}

      <section className="relative h-[75vh] min-h-[500px] overflow-hidden bg-slate-950">

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

              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40 md:opacity-100" />

              <div className="absolute inset-0 bg-black/40" />

            </div>

          ))}

        </div>



        <div className="relative mx-auto max-w-7xl px-6 h-full flex flex-col justify-center">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">

              <span className="animate-pulse w-2 h-2 bg-indigo-400 rounded-full" />

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



      {/* FILTRO DE CATEGORIAS - Com margem negativa para subir no banner */}

      <div className="relative z-40 -mt-12">

        <div className="mx-auto max-w-7xl px-6">

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-4 border border-slate-100">

            <CategoryFilter

              categories={CATEGORIAS_FIXAS}

              activeCategory={categoriaAtiva}

              onSelect={setCategoriaAtiva}

              iconMap={iconMap}

            />

          </div>

        </div>

      </div>



      <main className="mx-auto max-w-7xl px-6 py-16 space-y-24">

        {loading ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

          </div>

        ) : (

          <>

            {/* Seção Hoje */}

            {oQueFazerHoje.length > 0 && (

              <section className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100">

                <div className="flex items-end justify-between mb-10">

                  <div>

                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-2">

                      <Zap size={14} fill="currentColor" /> {t.happening || 'Acontecendo'} {t.today || 'hoje'}

                    </div>

                    <h2 className="text-3xl font-bold text-slate-950">{t.happeningToday || 'Destaques do Dia'}</h2>

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                  {oQueFazerHoje.map((ev) => (

                    <EventCard key={`hoje-${ev.id}`} evento={ev} />

                  ))}

                </div>

              </section>

            )}



            {/* Vitrine Principal */}

            <section id="vitrine-principal" className="scroll-mt-32">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">

                <div>

                    <h2 className="text-4xl font-bold text-slate-950 tracking-tight">

                        {buscaNome

                          ? `${t.resultsFor || 'Resultados para'} "${buscaNome}"`

                          : categoriaAtiva === 'Todos'

                            ? (t.discoverTitle || 'Descubra Experiências')

                            : getCategoriaTraduzida(categoriaAtiva)}

                    </h2>

                    <p className="text-slate-500 mt-2">{vitrineFiltrada.length} {t.optionsAvailable || 'opções disponíveis'}</p>

                </div>

                {(buscaNome || categoriaAtiva !== 'Todos') && (

                    <button

                        onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}}

                        className="text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-indigo-800 transition"

                    >

                        <X size={14} /> {t.clearFilters || 'Limpar Filtros'}

                    </button>

                )}

              </div>



              {vitrineFiltrada.length > 0 ? (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">

                  {vitrineFiltrada.map((ev) => (

                    <EventCard key={`vitrine-${ev.id}`} evento={ev} />

                  ))}

                </div>

              ) : (

                <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">

                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.noEventsFound || 'Nenhum evento encontrado'}</p>

                  <button onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}} className="mt-4 text-indigo-600 font-bold hover:underline">

                    {t.viewFullShowcase || 'Ver vitrine completa'}

                  </button>

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