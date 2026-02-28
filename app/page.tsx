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

  // Carrossel Automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // Busca de dados REAIS da sua API
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resEventos, resComunidades] = await Promise.all([
          fetch(`${API_URL_BASE}/api/eventos/vitrine`, { cache: 'no-store' }),
          fetch(`${API_URL_BASE}/api/comunidades`, { cache: 'no-store' }),
        ]);

        if (resEventos.ok) {
          const dadosEventos = await resEventos.json();
          setEventos(dadosEventos);
        }

        if (resComunidades.ok) {
          const dadosCom = await resComunidades.json();
          // Puxando os dados reais conforme o retorno da sua API
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
    <div className="min-h-screen bg-[#FCFCFD] text-slate-900 selection:bg-indigo-100 font-sans">
      <Navbar />

      {/* Hero Section Centralizada */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {SLIDES.map((s, i) => (
            <div key={s.id} className={cn('absolute inset-0 transition-all duration-[2000ms]', i === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110')}>
              <Image src={s.url} alt="Destaque" fill priority={i === 0} className="object-cover" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FCFCFD]" />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-10">
            <Sparkles size={14} className="text-indigo-300" /> Curadoria Linkah
          </div>

          <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-white leading-[1.05] mb-12">
            {String(t?.[slide.titleKey] || "")} <br />
            <span className="font-serif italic text-white/70">{String(t?.[slide.highlightKey] || "")}</span>
          </h1>

          {/* Busca Moderna Centralizada */}
          <div className="mx-auto max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 group">
            <div className="flex-[1.5] w-full flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={22} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
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
              className="w-full md:w-auto bg-slate-950 text-white px-10 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              Explorar <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Filtros Sticky */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4">
        <div className="mx-auto max-w-7xl px-6">
          <CategoryFilter categories={CATEGORIAS_FIXAS} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-20 space-y-32">
        
        {/* VITRINE HOJE */}
        {!loading && oQueFazerHoje.length > 0 && (
          <section className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-indigo-600 p-2 rounded-xl text-white"><Zap size={20} fill="currentColor" /></div>
              <h2 className="text-3xl font-bold text-slate-950 tracking-tight">{t.happeningToday || 'Destaques do Dia'}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {oQueFazerHoje.map((ev) => <EventCard key={`hoje-${ev.id}`} evento={ev} />)}
            </div>
          </section>
        )}

        {/* VITRINE PRINCIPAL */}
        <section id="vitrine-principal" className="scroll-mt-32">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-medium text-slate-950 tracking-tight">
                {buscaNome ? `${t.resultsFor || 'Resultados para'} "${buscaNome}"` : categoriaAtiva === 'Todos' ? (t.discoverTitle || 'Próximas Experiências') : getCategoriaTraduzida(categoriaAtiva)}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {vitrineFiltrada.map((ev) => <EventCard key={`vitrine-${ev.id}`} evento={ev} />)}
          </div>
        </section>

        {/* --- SEÇÃO COMUNIDADES REAIS (CLICÁVEIS) --- */}
        {!loading && comunidades.length > 0 && (
          <section className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-medium text-slate-950 tracking-tight">Comunidades Linkah</h2>
                <p className="text-slate-400 mt-2 font-medium">Conecte-se com pessoas reais em grupos exclusivos.</p>
              </div>
              <Link href="/comunidades" className="text-indigo-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2 group">
                Ver todas <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comunidades.map((com) => (
                <Link 
                  key={com.id} 
                  href={`/comunidades/${com.id}`} // Rota real para o chat
                  className="group relative h-[450px] overflow-hidden rounded-[2.5rem] bg-slate-200 block shadow-lg"
                >
                  {/* Puxando foto_url real da sua API */}
                  {com.foto_url ? (
                    <Image 
                      src={com.foto_url} 
                      alt={com.nome}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-indigo-900" />
                  )}
                  
                  {/* Gradiente Escuro para leitura */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-3">
                      <Users size={14} /> {com.membros_count || 0} Membros
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{com.nome}</h3>
                    <p className="text-slate-300 text-sm line-clamp-2 mb-6 opacity-90">
                      {com.descricao}
                    </p>
                    <div className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-[0.2em] group-hover:text-indigo-300 transition-colors">
                      Entrar no Chat <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}