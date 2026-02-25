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
  Sparkles, Zap, Calendar, Loader2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

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
  const seteDiasDepois = new Date();
  seteDiasDepois.setDate(seteDiasDepois.getDate() + 7);
  const seteDiasStr = seteDiasDepois.toLocaleDateString('en-CA');
  const formatarDataBanco = (ev: any) => (ev.data || ev.data_inicio || "").split('T')[0];

  const oQueFazerHoje = eventos.filter(ev => formatarDataBanco(ev) === hojeStr);
  const eventosChegando = eventos.filter(ev => {
    const dataEv = formatarDataBanco(ev);
    return dataEv > hojeStr && dataEv <= seteDiasStr;
  });
  
  const vitrineFiltrada = eventos.filter(ev => {
    const nomeMatch = ev.nome.toLowerCase().includes(buscaNome.toLowerCase());
    const catMatch = categoriaAtiva === 'Todos' || ev.categoria === categoriaAtiva;
    return nomeMatch && catMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      {/* HERO SECTION - MAIS CLEAN E POLIDA */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-slate-900">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms]" 
                 style={{ backgroundImage: `url('${slide.url}')`, transform: index === currentSlide ? 'scale(1)' : 'scale(1.1)' }}>
              <div className="absolute inset-0 bg-black/40 backdrop-brightness-75" />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Sparkles size={12} className="text-blue-400" /> Linkah Premier
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                  {(t as any)[slide.titleKey]} <br /> 
                  <span className="text-blue-400">
                    {(t as any)[slide.highlightKey]}
                  </span>
                </h1>
              </div>
            </div>
          </div>
        ))}
        
        {/* BARRA DE BUSCA - DESIGN "FLOATING CLEAN" */}
        <div className="absolute bottom-12 z-30 w-full px-6">
          <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center max-w-5xl mx-auto border border-gray-100">
            <div className="flex-1 flex items-center px-6 py-4 w-full">
              <Search size={20} className="text-gray-400 mr-4" />
              <input 
                type="text" 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
                placeholder={t.searchPlaceholder || "O que você está procurando?"} 
                className="w-full bg-transparent outline-none text-base font-medium text-slate-800 placeholder:text-gray-400" 
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all w-full md:w-auto active:scale-95 shadow-lg shadow-blue-500/20">
              {t.explore || 'Explorar'}
            </button>
          </div>
        </div>
      </section>

      {/* FILTRO DE CATEGORIAS - STICKY MINIMALISTA */}
      <div className="sticky top-[64px] z-40 bg-white/90 backdrop-blur-md py-4 border-b border-gray-100">
        <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 space-y-24 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">{t.sync || 'Carregando...'}</p>
          </div>
        ) : (
          <>
            {!buscaNome && categoriaAtiva === 'Todos' && (
              <>
                {/* SEÇÃO HOJE - CARDS MENORES E MAIS ELEGANTES */}
                {oQueFazerHoje.length > 0 && (
                  <section className="animate-in fade-in duration-700">
                    <div className="flex justify-between items-end mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                          <Zap size={20} fill="currentColor"/>
                        </div>
                        <SectionHeader title={t.happening || 'Acontecendo'} highlight={t.today || 'hoje'} />
                      </div>
                      <Link href="#vitrine-principal" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                        Ver tudo <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
                    </div>
                  </section>
                )}

                {/* SEÇÃO EM BREVE */}
                {eventosChegando.length > 0 && (
                  <section className="animate-in fade-in duration-1000">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Calendar size={20} />
                      </div>
                      <SectionHeader title={t.coming || 'Chegando'} highlight={t.soon || 'em breve'} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {eventosChegando.map(ev => <EventCard key={ev.id} evento={ev} />)}
                    </div>
                  </section>
                )}

                {/* SEÇÃO COMUNIDADES - LAYOUT DE REVISTA */}
                {comunidades.length > 0 && (
                  <section className="py-16 px-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                          {t.communities || 'Comunidades'} <span className="text-blue-600">{t.trending || 'em alta'}</span>
                        </h2>
                        <p className="text-gray-500 mt-1 text-base">{t.communitySub || 'Conecte-se com pessoas que amam o que você ama.'}</p>
                      </div>
                      <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        Explorar todas
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {comunidades.map((com) => (
                        <Link href={`/evento/${com.id}/comunidade`} key={com.id} className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                          <img src={com.imagem_url || 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=500'} 
                               className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={com.nome} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <h4 className="text-white font-bold text-xl mb-2">{com.nome}</h4>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 bg-gray-400" />)}
                                </div>
                                <span className="text-white/90 text-xs font-medium">+{com.total_membros || 0} {t.membersCount || 'membros'}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* VITRINE PRINCIPAL */}
            <section id="vitrine-principal" className="pt-10">
              <div className="mb-10">
                <SectionHeader 
                  title={buscaNome ? `${t.resultsFor || 'Resultados para'} "${buscaNome}"` : (categoriaAtiva === 'Todos' ? (t.discoverNew || 'Descubra novas') : categoriaAtiva)} 
                  highlight={buscaNome ? "" : (categoriaAtiva === 'Todos' ? (t.experiences || 'experiências') : "")} 
                  count={vitrineFiltrada.length} 
                />
              </div>
              {vitrineFiltrada.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              ) : (
                <div className="py-32 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">{t.noEventsFound || 'Nenhum evento encontrado para esta busca.'}</p>
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