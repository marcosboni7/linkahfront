'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './site/Navbar'; 
import { EventCard } from './site/EventCard';
import { Footer } from './site/Footer';
import { CategoryFilter } from './site/CategoryFilter';
import { SectionHeader } from './site/SectionHeader';
import { useLanguage } from '@/app/context/LanguageContext'; // 🟢 Importante!
import { 
  Search, Ticket, Music, Mic2, Theater, Gamepad2, 
  Utensils, GraduationCap, PartyPopper, Heart,
  Sparkles, Zap, Calendar, Loader2
} from 'lucide-react';
import Link from 'next/link';

const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

const iconMap: { [key: string]: any } = {
  'Todos': Ticket, 'Show': Music, 'Mentoria': Mic2, 'Teatro': Theater,
  'Games': Gamepad2, 'Gastronomia': Utensils, 'Workshop': GraduationCap,
  'Festa': PartyPopper, 'Infantil': Heart,
};

// --- SLIDES COM CHAVES DE TRADUÇÃO ---
const SLIDES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070', titleKey: 'slide1Title', highlightKey: 'slide1Highlight' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070', titleKey: 'slide2Title', highlightKey: 'slide2Highlight' },
  { id: 3, url: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=2070', titleKey: 'slide3Title', highlightKey: 'slide3Highlight' }
];

export default function BuyTicketHome() {
  const { t, language } = useLanguage(); // 🟢 Puxando as traduções globais
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

  // Filtragem temporal
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
    <div className="flex flex-col min-h-screen bg-[#FCFBFA] text-slate-900 font-sans antialiased">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden bg-slate-900 shrink-0">
        {SLIDES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out" 
                 style={{ backgroundImage: `url('${slide.url}')`, transform: index === currentSlide ? 'scale(1.05)' : 'scale(1.2)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#FCFBFA]" />
            </div>
            <div className="relative z-10 text-center px-6 mt-[-80px]">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full mb-6 border border-white/20">
                <Sparkles size={14} className="text-[#ff4d4d]" /> Linkah Experience
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
                {/* 🟢 Tradução dinâmica do Slider */}
                {(t as any)[slide.titleKey]} <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] to-[#ff8080]">
                  {(t as any)[slide.highlightKey]}
                </span>
              </h1>
            </div>
          </div>
        ))}
        
        {/* BARRA DE BUSCA */}
        <div className="absolute bottom-16 z-30 w-full px-6">
          <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center max-w-4xl mx-auto border border-slate-100 transition-all hover:shadow-[#ff4d4d]/10">
            <div className="flex-[1.5] flex items-center px-6 py-3 w-full border-b md:border-b-0 md:border-r border-slate-100">
              <Search size={22} className="text-slate-400 mr-4" />
              <input 
                type="text" 
                value={buscaNome} 
                onChange={(e) => setBuscaNome(e.target.value)} 
                placeholder={t.searchPlaceholder} // 🟢 Traduzido
                className="w-full bg-transparent outline-none text-lg font-bold text-slate-800 placeholder:text-slate-300" 
              />
            </div>
            <button className="bg-slate-950 hover:bg-[#ff4d4d] text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all w-full md:w-auto ml-2 active:scale-95">
              {t.explore} {/* 🟢 Traduzido */}
            </button>
          </div>
        </div>
      </section>

      <div className="sticky top-[68px] z-40 bg-white/80 backdrop-blur-xl py-5 border-b border-slate-100 shadow-sm">
        <CategoryFilter categories={categoriasExistentes} activeCategory={categoriaAtiva} onSelect={setCategoriaAtiva} iconMap={iconMap} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 space-y-28 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#ff4d4d]" size={40} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">{t.sync}</p>
          </div>
        ) : (
          <>
            {!buscaNome && categoriaAtiva === 'Todos' && (
              <>
                {/* SEÇÃO HOJE */}
                {oQueFazerHoje.length > 0 && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-[#ff4d4d]/10 p-2.5 rounded-2xl text-[#ff4d4d] shadow-sm"><Zap size={24} fill="currentColor"/></div>
                      <SectionHeader title={t.happening} highlight={t.today} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {oQueFazerHoje.map(ev => <EventCard key={ev.id} evento={ev} />)}
                    </div>
                  </section>
                )}

                {/* SEÇÃO EM BREVE */}
                {eventosChegando.length > 0 && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-blue-500/10 p-2.5 rounded-2xl text-blue-500 shadow-sm"><Calendar size={24} /></div>
                      <SectionHeader title={t.coming} highlight={t.soon} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {eventosChegando.map(ev => <EventCard key={ev.id} evento={ev} />)}
                    </div>
                  </section>
                )}

                {/* SEÇÃO COMUNIDADES */}
                {comunidades.length > 0 && (
                  <section className="space-y-10 py-10 bg-slate-50 -mx-6 px-6 rounded-[4rem] border border-slate-100">
                    <div className="flex flex-col">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{t.communities} <span className="text-[#ff4d4d]">{t.trending}</span></h2>
                        <p className="text-slate-500 mt-2 text-lg font-medium">{t.communitySub}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {comunidades.map((com) => (
                        <Link href={`/evento/${com.id}/comunidade`} key={com.id} className="group relative h-72 rounded-[3rem] overflow-hidden border border-white shadow-lg hover:shadow-2xl transition-all duration-500">
                          <img src={com.imagem_url || 'https://images.unsplash.com/photo-1514525253361-bee8718a74a7?q=80&w=500'} 
                               className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={com.nome} />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
                          <div className="absolute bottom-8 left-8 right-8">
                            <h4 className="text-white font-black text-2xl uppercase italic leading-tight mb-2">{com.nome}</h4>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700" />)}
                                </div>
                                <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">+{com.total_membros} {t.membersCount}</span>
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
              <SectionHeader 
                title={buscaNome ? `${t.resultsFor} "${buscaNome}"` : (categoriaAtiva === 'Todos' ? t.discoverNew : (language === 'PT' ? categoriaAtiva : categoriaAtiva))} 
                highlight={buscaNome ? "" : (categoriaAtiva === 'Todos' ? t.experiences : "")} 
                count={vitrineFiltrada.length} 
              />
              {vitrineFiltrada.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                  {vitrineFiltrada.map(ev => <EventCard key={ev.id} evento={ev} />)}
                </div>
              ) : (
                <div className="py-20 text-center">
                    <p className="text-slate-400 font-bold italic">{t.noEventsFound}</p>
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