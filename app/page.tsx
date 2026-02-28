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
  ChevronRight,
  MapPin,
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

export default function BuyTicketHome() {
  const { t }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Lógica de Slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // Carga de Dados
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const resEventos = await fetch(`${API_URL_BASE}/api/eventos/vitrine`, { cache: 'no-store' });
        if (resEventos.ok) {
          const dados = await resEventos.json();
          setEventos(dados);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  // Filtros Memoizados
  const vitrineFiltrada = useMemo(() => {
    const query = buscaNome.trim().toLowerCase();
    return eventos.filter((ev) => {
      const nomeMatch = String(ev.nome || '').toLowerCase().includes(query);
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
    <div className="min-h-screen bg-[#FCFCFD] text-slate-900 selection:bg-indigo-100 font-sans">
      <Navbar />

      {/* --- HERO SECTION (ESTILO PREMIUM) --- */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'absolute inset-0 transition-all duration-[2000ms] ease-in-out',
                i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              )}
            >
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#FCFCFD]" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-8">
            <Sparkles size={14} className="text-yellow-400" /> Curadoria Linkah
          </div>

          <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-white leading-[1.05] mb-12">
            {String(t?.[slide.titleKey] || "")} <br />
            <span className="font-serif italic text-white/80">{String(t?.[slide.highlightKey] || "")}</span>
          </h1>

          {/* --- BARRA DE BUSCA "FLOATING" (ESTILO LUMA) --- */}
          <div className="mx-auto max-w-4xl bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 group">
            <div className="flex-[1.5] w-full flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={22} className="text-slate-400" />
              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder={String(t?.searchPlaceholder || "O que você está procurando?")}
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-300 font-medium text-lg"
              />
            </div>
            
            <div className="flex-1 w-full flex items-center gap-4 px-6 py-4 hidden md:flex">
              <MapPin size={22} className="text-slate-400" />
              <span className="text-slate-400 font-medium text-lg">Brasil</span>
            </div>

            <button 
              onClick={() => document.getElementById('vitrine-principal')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto bg-slate-950 text-white px-10 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {String(t?.explore || "Explorar")} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* --- FILTROS (STICKY E CLEAN) --- */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <CategoryFilter
            categories={CATEGORIAS_FIXAS}
            activeCategory={categoriaAtiva}
            onSelect={setCategoriaAtiva}
            iconMap={iconMap}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-20 space-y-32">
        {/* Seção Hoje */}
        {!loading && oQueFazerHoje.length > 0 && (
          <section className="relative">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Zap size={20} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-bold text-slate-950 tracking-tight">{t.happeningToday || 'Destaques do Dia'}</h2>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-medium text-slate-950 tracking-tight">
                {buscaNome 
                  ? `${t.resultsFor || 'Resultados para'} "${buscaNome}"` 
                  : categoriaAtiva === 'Todos' 
                    ? (t.discoverTitle || 'Próximas Experiências') 
                    : categoriaAtiva}
              </h2>
              <p className="text-slate-400 mt-2 font-medium">{vitrineFiltrada.length} eventos para você explorar</p>
            </div>
            
            {(buscaNome || categoriaAtiva !== 'Todos') && (
              <button 
                onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}}
                className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <X size={16} className="group-hover:rotate-90 transition-transform" /> {t.clearFilters || 'Limpar Filtros'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[4/5] bg-slate-100 rounded-[2.5rem]" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : vitrineFiltrada.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
              {vitrineFiltrada.map((ev) => (
                <EventCard key={`vitrine-${ev.id}`} evento={ev} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Search size={32} />
              </div>
              <p className="text-slate-500 font-medium text-lg">{t.noEventsFound || 'Nenhum evento encontrado'}</p>
              <button onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}} className="mt-4 text-indigo-600 font-bold hover:underline">
                Ver vitrine completa
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}