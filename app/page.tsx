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
  MessageCircle,
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
          setComunidades(Array.isArray(dadosCom) ? dadosCom.slice(0, 3) : []);
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

  const oQueFazerHoje = useMemo(() => {
    const agora = new Date();
    const hojeLocal = agora.getFullYear() + '-' + 
                      String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(agora.getDate()).padStart(2, '0');

    return eventos.filter((ev) => {
      const dataRaw = ev.data_inicio || ev.data || '';
      if (!dataRaw) return false;
      return String(dataRaw).split('T')[0] === hojeLocal;
    });
  }, [eventos]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#ff4d4d]/20 font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[75vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div key={s.id} className={cn('absolute inset-0 transition-all duration-[2000ms]', i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110')}>
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/50 to-[#ff4d4d]/10 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff4d4d]/20 bg-white/50 backdrop-blur-md px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#ff4d4d] mb-10 shadow-sm">
            <Sparkles size={14} className="animate-pulse" /> Curadoria Linkah
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-12">
            {String(t?.[slide.titleKey] || "")} <br />
            <span className="font-serif italic font-light text-[#ff4d4d]">{String(t?.[slide.highlightKey] || "")}</span>
          </h1>

          <div className="mx-auto max-w-4xl bg-white rounded-[2.5rem] shadow-2xl shadow-[#ff4d4d]/15 p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 group transition-all border border-slate-100">
            <div className="flex-[1.5] w-full flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-slate-50">
              <Search size={22} className="text-[#ff4d4d]" />
              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder={String(t?.searchPlaceholder || "O que você está procurando?")}
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-300 font-bold text-lg"
              />
            </div>
            <div className="flex-1 w-full flex items-center gap-4 px-6 py-4 hidden md:flex">
              <MapPin size={22} className="text-slate-400" />
              <span className="text-slate-400 font-bold text-lg">Brasil</span>
            </div>
            <button 
              onClick={() => document.getElementById('vitrine-principal')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto bg-gradient-to-r from-[#ff4d4d] to-[#ff7070] text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-[#ff4d4d]/30 transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
              Explorar <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* FILTROS STICKY */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <CategoryFilter categories={CATEGORIAS_FIXAS} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-20 space-y-32">
        
        {/* --- 1. ACONTECENDO HOJE (MAIS PERTO) --- */}
        {!loading && oQueFazerHoje.length > 0 && (
          <section className="bg-white rounded-[3.5rem] p-8 md:p-12 border-2 border-[#ff4d4d]/10 shadow-2xl shadow-[#ff4d4d]/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d4d]/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                <div className="bg-gradient-to-br from-[#ff4d4d] to-[#ff7070] p-4 rounded-2xl text-white shadow-lg shadow-[#ff4d4d]/30">
                    <Zap size={24} fill="currentColor" className="animate-pulse" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">{t.happeningToday || 'Para Hoje'}</h2>
                    <p className="text-[#ff4d4d] font-bold text-[10px] uppercase tracking-[0.3em]">Acontecendo agora</p>
                </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {oQueFazerHoje.map((ev) => <EventCard key={`hoje-${ev.id}`} evento={ev} />)}
                </div>
            </div>
          </section>
        )}

        {/* --- 2. COMUNIDADES LINKAH (LAYOUT CLEAN + FOTOS) --- */}
        {!loading && comunidades.length > 0 && (
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-8">
              <div>
                <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">Comunidades</h2>
                <p className="text-slate-400 mt-2 font-medium">Participe de grupos exclusivos e conecte-se via chat.</p>
              </div>
              <Link href="/comunidades" className="text-[#ff4d4d] font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2 group">
                Ver todas <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comunidades.map((com) => {
                // Tratamento de foto para garantir que apareça
                const rawFoto = com.foto_url || com.imagem || com.capa || com.banner;
                let fotoFinal = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070';
                if (rawFoto) {
                  fotoFinal = rawFoto.startsWith('http') ? rawFoto : `${API_URL_BASE}${rawFoto.startsWith('/') ? '' : '/'}${rawFoto}`;
                }

                return (
                  <Link 
                    key={com.id} 
                    href={`/comunidades/${com.id}`} 
                    className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-2xl hover:shadow-[#ff4d4d]/10 transition-all duration-500 flex flex-col min-h-[480px]"
                  >
                    <div className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-6 bg-slate-50">
                      <Image 
                        src={fotoFinal} 
                        alt={com.nome}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-4 left-4 bg-white/95 px-4 py-2 rounded-full text-[10px] font-black text-[#ff4d4d] shadow-sm flex items-center gap-2">
                        <Users size={14} /> {com.membros_count || 0} MEMBROS
                      </div>
                    </div>

                    <div className="px-2 flex-grow">
                      <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-[#ff4d4d] transition-colors uppercase tracking-tight">{com.nome}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8">
                        {com.descricao || "Entre na sala e comece a interagir com os membros agora mesmo."}
                      </p>
                    </div>

                    <div className="w-full py-5 bg-slate-50 group-hover:bg-gradient-to-r group-hover:from-[#ff4d4d] group-hover:to-[#ff7070] rounded-2xl flex items-center justify-center gap-3 text-slate-500 group-hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all">
                      <MessageCircle size={18} /> Abrir Chat
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* --- 3. VITRINE PRINCIPAL --- */}
        <section id="vitrine-principal" className="scroll-mt-32">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">
                {buscaNome ? `${t.resultsFor || 'Resultados para'} "${buscaNome}"` : categoriaAtiva === 'Todos' ? (t.discoverTitle || 'Explorar Experiências') : getCategoriaTraduzida(categoriaAtiva)}
              </h2>
              <div className="h-1.5 w-16 bg-[#ff4d4d] rounded-full mt-4" />
            </div>
            {(buscaNome || categoriaAtiva !== 'Todos') && (
              <button onClick={() => {setBuscaNome(''); setCategoriaAtiva('Todos');}} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-[#ff4d4d] transition">
                <X size={16} /> {t.clearFilters || 'Limpar Filtros'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {vitrineFiltrada.map((ev) => <EventCard key={`vitrine-${ev.id}`} evento={ev} />)}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}