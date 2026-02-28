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
  MapPin,
  ChevronRight,
  MessageCircle, // Ícone de chat para o botão
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
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
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

        if (resEventos.ok) setEventos(await resEventos.json());
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
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 selection:bg-indigo-100 font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[70vh] min-h-[550px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div key={s.id} className={cn('absolute inset-0 transition-all duration-[2000ms]', i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105')}>
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8F9FB]" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-8">
            {String(t?.[slide.titleKey] || "Explore o melhor da")} <br />
            <span className="text-indigo-600 italic font-serif font-light">{String(t?.[slide.highlightKey] || "sua cidade")}</span>
          </h1>

          {/* BARRA DE BUSCA MINIMALISTA */}
          <div className="mx-auto max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 p-1.5 flex flex-col md:flex-row items-center border border-white">
            <div className="flex-[1.5] w-full flex items-center gap-3 px-5 py-3">
              <Search size={20} className="text-slate-400" />
              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="O que você quer viver hoje?"
                className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
            <button 
              onClick={() => document.getElementById('vitrine-principal')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <div className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <CategoryFilter categories={CATEGORIAS_FIXAS} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-20 space-y-32">
        
        {/* --- NOVO LAYOUT DE COMUNIDADES (CLEAN & APP STYLE) --- */}
        {!loading && comunidades.length > 0 && (
          <section className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-2 block">Social</span>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Comunidades</h2>
              </div>
              <Link href="/comunidades" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition flex items-center gap-2">
                Ver todas as salas <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comunidades.map((com) => {
                const fotoFinal = com.foto_url 
                  ? (com.foto_url.startsWith('http') ? com.foto_url : `${API_URL_BASE}${com.foto_url}`)
                  : 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070';

                return (
                  <Link 
                    key={com.id} 
                    href={`/comunidades/${com.id}`} 
                    className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 flex flex-col h-full"
                  >
                    {/* Imagem Arredondada Estilo Card */}
                    <div className="relative h-56 w-full overflow-hidden rounded-[2rem] mb-6">
                      <Image 
                        src={fotoFinal} 
                        alt={com.nome}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-indigo-600 shadow-sm flex items-center gap-1.5">
                        <Users size={12} /> {com.membros_count || 0}
                      </div>
                    </div>

                    {/* Texto e Conteúdo */}
                    <div className="px-2 flex-grow">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{com.nome}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">
                        {com.descricao || "Participe das discussões e fique por dentro das novidades desta comunidade exclusiva."}
                      </p>
                    </div>

                    {/* Botão de Ação Clean */}
                    <div className="mt-auto px-2 pb-2">
                      <div className="w-full py-4 bg-slate-50 group-hover:bg-indigo-600 rounded-2xl flex items-center justify-center gap-2 text-slate-900 group-hover:text-white font-bold text-xs uppercase tracking-widest transition-all">
                        <MessageCircle size={16} /> Entrar no Chat
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* VITRINE PRINCIPAL (MANTIDA) */}
        <section id="vitrine-principal" className="scroll-mt-32">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
              {buscaNome ? `Resultados para "${buscaNome}"` : "Eventos em Destaque"}
            </h2>
            <div className="h-1 w-20 bg-indigo-600 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {vitrineFiltrada.map((ev) => <EventCard key={`vitrine-${ev.id}`} evento={ev} />)}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}