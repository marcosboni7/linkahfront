'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './site/Navbar'; 
import { EventCard } from './site/EventCard';
import { Footer } from './site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { useLanguage } from '@/app/context/LanguageContext';
import { 
  Search, Ticket, Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  Sparkles, Zap, Calendar, Loader2, ArrowRight, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

// Mapeamento de ícones minimalistas (sem cores vibrantes no código)
const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070', titleKey: 'slide1Title', highlightKey: 'slide1Highlight' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', titleKey: 'slide2Title', highlightKey: 'slide2Highlight' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070', titleKey: 'slide3Title', highlightKey: 'slide3Highlight' }
];

export default function BuyTicketHome() {
  const { t, language }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>(['Todos']);
  const [buscaNome, setBuscaNome] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1)), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [resEventos, resComunidades] = await Promise.all([
          fetch(`${API_URL_BASE}/api/eventos/vitrine`),
          fetch(`${API_URL_BASE}/api/comunidades`)
        ]);

        if (resEventos.ok) {
          const dados = await resEventos.json();
          setEventos(dados);
          const extrair = dados.map((ev: any) => ev.categoria).filter(Boolean);
          setCategoriasExistentes(['Todos', ...Array.from(new Set(extrair)) as string[]]);
        }

        if (resComunidades.ok) {
          const dadosCom = await resComunidades.json();
          setComunidades(dadosCom.slice(0, 3));
        }
      } catch (error) { 
        console.error("Erro ao carregar dados:", error); 
      } finally { 
        setLoading(false); 
      }
    }
    carregarDados();
  }, []);

  const hojeStr = new Date().toLocaleDateString('en-CA');
  const oQueFazerHoje = eventos.filter(ev => (ev.data || ev.data_inicio || "").split('T')[0] === hojeStr);
  
  const vitrineFiltrada = eventos.filter(ev => {
    const nomeMatch = ev.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    return nomeMatch && catMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* HERO SECTION - FOCO EM TIPOGRAFIA E IMAGEM */}
      <section className="relative h-[550px] flex items-center overflow-hidden bg-slate-950">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center" 
                 style={{ backgroundImage: `url('${slide.url}')` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                  <Sparkles size={12} /> Curadoria Linkah
                </div>
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-[1] transition-all">
                  {(t as any)[slide.titleKey]} <br /> 
                  <span className="text-indigo-500 font-light">
                    {(t as any)[slide.highlightKey]}
                  </span>
                </h1>
              </div>
            </div>
          </div>
        ))}
        
        {/* BARRA DE BUSCA INTEGRADA AO HERO */}
        <div className="absolute bottom-10 z-30 w-full px-8">
          <div className="bg-white p-1.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center max-w-4xl border border-slate-200">
            <div className="flex-1 flex items-center px-6 py-3 w-full">
              <Search size={18} className="text-slate-400 mr-4" />
              <input 
                type="text" 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
                placeholder={t.searchPlaceholder || "Buscar eventos, shows ou mentorias..."} 
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400" 
              />
            </div>
            <button className="bg-slate-950 hover:bg-black text-white px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all w-full md:w-auto active:scale-95">
              {t.explore || 'Pesquisar'}
            </button>
          </div>
        </div>
      </section>

      {/* FILTRO DE CATEGORIAS - FLAT DESIGN */}
      <div className="sticky top-[64px] z-40 bg-white/80 backdrop-blur-xl py-4 border-b border-slate-100">
        <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-8 py-20 space-y-24 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-slate-950" size={32} />
            <p className="font-bold text-slate-300 uppercase tracking-widest text-[9px]">Sincronizando vitrine</p>
          </div>
        ) : (
          <>
            {!buscaNome && categoriaAtiva === 'Todos' && (
              <>
                {/* SEÇÃO HOJE - MINIMALISTA */}
                {oQueFazerHoje.length > 0 && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center mb-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                          <Zap size={14} fill="currentColor" /> Live Now
                        </div>
                        <h2 className="text-3xl font-bold text-slate-950 tracking-tight">Acontecendo hoje</h2>
                      </div>
                      <Link href="#vitrine-principal" className="group text-xs font-bold text-slate-400 hover:text-slate-950 transition-all flex items-center gap-2 uppercase tracking-widest">
                        Ver grade completa <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
                    </div>
                  </section>
                )}

                {/* SEÇÃO COMUNIDADES - ESTILO CARD DE LUXO */}
                {comunidades.length > 0 && (
                  <section className="py-20 px-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div className="max-w-3xl mb-12">
                      <h2 className="text-4xl font-bold text-slate-950 tracking-tighter mb-4">
                        Comunidades <span className="text-indigo-600">Exclusivas</span>
                      </h2>
                      <p className="text-slate-500 text-lg font-light leading-relaxed">
                        Não apenas eventos, mas conexões reais. Entre em grupos segmentados e faça networking antes mesmo do evento começar.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {comunidades.map((com) => (
                        <Link href={`/evento/${com.id}/comunidade`} key={com.id} className="group bg-white p-2 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all duration-500 shadow-sm hover:shadow-xl">
                          <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-6">
                            <img src={com.imagem_url || 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=500'} 
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={com.nome} />
                          </div>
                          <div className="px-4 pb-4">
                            <h4 className="text-slate-950 font-bold text-xl mb-3 tracking-tight">{com.nome}</h4>
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
                              </div>
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                {com.total_membros || 0} Membros
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* VITRINE PRINCIPAL - GRID MODERNO */}
            <section id="vitrine-principal" className="pt-10">
              <div className="flex items-center gap-3 mb-12">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <h2 className="text-slate-950 font-bold text-2xl tracking-tighter uppercase">
                   {buscaNome ? `Resultados para "${buscaNome}"` : (categoriaAtiva === 'Todos' ? 'Descubra Experiências' : categoriaAtiva)}
                 </h2>
                 {vitrineFiltrada.length > 0 && (
                   <span className="text-slate-400 text-sm ml-2 font-medium">({vitrineFiltrada.length})</span>
                 )}
              </div>
              
              {vitrineFiltrada.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                  {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              ) : (
                <div className="py-40 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Nenhum evento encontrado</p>
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